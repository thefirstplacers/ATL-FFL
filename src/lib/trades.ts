import type { SleeperRoster, SleeperUser, SleeperMatchup } from './types';
import type { PlayerMeta } from './players';
import { MANAGER_INFO } from './constants';
import { buildTeamMap } from './sleeper';
import { getManagerDisplayName } from './utils';

export type RosterPosition = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF' | 'FLEX';

// Starter slot counts for the league. Derived from league.roster_positions but
// we need FLEX handling separate from the position-specific slots. FLEX is
// consumed after QB/RB/WR/TE needs are met.
export interface StarterSlots {
  QB: number;
  RB: number;
  WR: number;
  TE: number;
  K: number;
  DEF: number;
  FLEX: number; // RB/WR/TE eligible
}

export function parseStarterSlots(rosterPositions: string[]): StarterSlots {
  const slots: StarterSlots = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0, FLEX: 0 };
  for (const pos of rosterPositions) {
    switch (pos) {
      case 'QB': slots.QB++; break;
      case 'RB': slots.RB++; break;
      case 'WR': slots.WR++; break;
      case 'TE': slots.TE++; break;
      case 'K': slots.K++; break;
      case 'DEF': slots.DEF++; break;
      case 'FLEX': case 'WRRB_FLEX': case 'REC_FLEX': slots.FLEX++; break;
    }
  }
  return slots;
}

export interface PlayerValue {
  id: string;
  name: string;
  position: string;
  team: string;
  age: number;
  yearsExp: number;
  injuryStatus: string | null;
  pointsScored: number; // actual points this season
  gamesPlayed: number;
  ppg: number;
  // A 0-100 "trade value" based on PPG, position scarcity, and age.
  // Used for fairness scoring and roster strength.
  tradeValue: number;
}

// Position positional replacement level (VBD reference points). Below these
// PPG numbers a player is roughly waiver-wire-available, so surplus above
// this value is what makes someone tradeable.
const REPLACEMENT_PPG: Record<string, number> = {
  QB: 14,
  RB: 8,
  WR: 8,
  TE: 6,
  K: 7,
  DEF: 7,
};

// Positional scarcity: TE and QB are rarer at the top end in single-QB leagues,
// so elite TE/QB value gets a small premium.
const POSITION_PREMIUM: Record<string, number> = {
  QB: 1.0,
  RB: 1.1,
  WR: 1.1,
  TE: 1.15,
  K: 0.6,
  DEF: 0.6,
};

// Age curves: under-24 skill players trend up, late-20s RBs start declining.
// Values <1 reduce trade value, >1 increase it.
function ageMultiplier(position: string, age: number): number {
  if (!age) return 1;
  if (position === 'RB') {
    if (age <= 23) return 1.1;
    if (age <= 26) return 1.0;
    if (age <= 28) return 0.9;
    return 0.75;
  }
  if (position === 'WR' || position === 'TE') {
    if (age <= 24) return 1.1;
    if (age <= 29) return 1.0;
    if (age <= 31) return 0.92;
    return 0.8;
  }
  if (position === 'QB') {
    if (age <= 25) return 1.08;
    if (age <= 34) return 1.0;
    return 0.9;
  }
  return 1;
}

function injuryPenalty(status: string | null): number {
  if (!status) return 1;
  const s = status.toLowerCase();
  if (s.includes('out') || s.includes('ir')) return 0.7;
  if (s.includes('doubt')) return 0.8;
  if (s.includes('quest')) return 0.92;
  return 1;
}

export function valuePlayer(
  player: PlayerMeta,
  pointsScored: number,
  gamesPlayed: number,
): PlayerValue {
  const ppg = gamesPlayed > 0 ? pointsScored / gamesPlayed : 0;
  const replacement = REPLACEMENT_PPG[player.position] ?? 6;
  const surplus = Math.max(ppg - replacement, 0);
  const premium = POSITION_PREMIUM[player.position] ?? 1;
  const raw = surplus * premium * ageMultiplier(player.position, player.age) * injuryPenalty(player.injuryStatus);
  // Cap at 100; a typical elite fantasy asset ends up around 70-95.
  const tradeValue = Math.min(Math.round(raw * 6), 100);
  return {
    id: player.id,
    name: player.name,
    position: player.position,
    team: player.team,
    age: player.age,
    yearsExp: player.yearsExp,
    injuryStatus: player.injuryStatus,
    pointsScored,
    gamesPlayed,
    ppg: Math.round(ppg * 10) / 10,
    tradeValue,
  };
}

export interface TeamRosterAnalysis {
  rosterId: number;
  ownerId: string;
  managerName: string;
  teamName: string;
  photo: string;
  mode?: string;
  tradingScale?: number;
  players: PlayerValue[];
  // Grade per position (0-100) — lower = that position is a hole
  positionGrades: Record<RosterPosition, number>;
  // Positions where this team is above average vs league
  surplusPositions: RosterPosition[];
  // Positions where this team is below average vs league
  needPositions: RosterPosition[];
  totalValue: number;
  startersPPG: number;
}

const POSITION_ORDER: RosterPosition[] = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'FLEX'];

function gradePositionGroup(players: PlayerValue[], position: RosterPosition, slots: StarterSlots): number {
  // For FLEX grade, use RB/WR/TE depth beyond their main slots.
  if (position === 'FLEX') {
    const flexEligible = players
      .filter((p) => ['RB', 'WR', 'TE'].includes(p.position))
      .sort((a, b) => b.tradeValue - a.tradeValue);
    const mainStarters = slots.RB + slots.WR + slots.TE;
    const flexPool = flexEligible.slice(mainStarters, mainStarters + slots.FLEX + 2);
    if (flexPool.length === 0) return 0;
    return Math.round(flexPool.reduce((s, p) => s + p.tradeValue, 0) / flexPool.length);
  }

  const starters = slots[position];
  if (starters === 0) return 50;
  const atPosition = players
    .filter((p) => p.position === position)
    .sort((a, b) => b.tradeValue - a.tradeValue);
  // Grade = weighted average of top `starters + 1` players at the position
  // (we care about starters AND top reserve since injuries happen).
  const pool = atPosition.slice(0, starters + 1);
  if (pool.length === 0) return 0;
  const weighted = pool.reduce((sum, p, i) => sum + p.tradeValue * (i < starters ? 1 : 0.5), 0);
  const denom = Math.min(pool.length, starters) + (pool.length > starters ? 0.5 : 0);
  return Math.round(weighted / denom);
}

export interface RosterInput {
  roster: SleeperRoster;
  players: PlayerValue[];
}

export function analyzeRoster(
  input: RosterInput,
  leagueAverages: Record<RosterPosition, number>,
  slots: StarterSlots,
  teamInfo: { ownerId: string; displayName: string; teamName: string },
): TeamRosterAnalysis {
  const grades: Record<RosterPosition, number> = {
    QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0, FLEX: 0,
  };
  for (const p of POSITION_ORDER) grades[p] = gradePositionGroup(input.players, p, slots);

  // Surplus/need thresholds: 10pts above/below league average at that position
  // is the boundary where a team becomes a plausible trade partner.
  const THRESHOLD = 10;
  const surplusPositions: RosterPosition[] = [];
  const needPositions: RosterPosition[] = [];
  for (const p of POSITION_ORDER) {
    if (p === 'K' || p === 'DEF') continue; // streamable, ignore
    const diff = grades[p] - leagueAverages[p];
    if (diff >= THRESHOLD) surplusPositions.push(p);
    else if (diff <= -THRESHOLD) needPositions.push(p);
  }

  const totalValue = input.players.reduce((s, p) => s + p.tradeValue, 0);
  const startersPPG = Object.values(grades).reduce((s, v) => s + v, 0) / POSITION_ORDER.length;

  const manager = MANAGER_INFO[teamInfo.ownerId];
  return {
    rosterId: input.roster.roster_id,
    ownerId: teamInfo.ownerId,
    managerName: getManagerDisplayName(teamInfo.ownerId, teamInfo.displayName),
    teamName: teamInfo.teamName,
    photo: manager?.photo || '/managers/question.jpg',
    mode: manager?.mode,
    tradingScale: manager?.tradingScale,
    players: input.players,
    positionGrades: grades,
    surplusPositions,
    needPositions,
    totalValue,
    startersPPG,
  };
}

export function computeLeagueAverages(analyses: Pick<TeamRosterAnalysis, 'positionGrades'>[]): Record<RosterPosition, number> {
  const sums: Record<RosterPosition, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0, FLEX: 0 };
  for (const a of analyses) {
    for (const p of POSITION_ORDER) sums[p] += a.positionGrades[p];
  }
  const result: Record<RosterPosition, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0, FLEX: 0 };
  const n = Math.max(analyses.length, 1);
  for (const p of POSITION_ORDER) result[p] = sums[p] / n;
  return result;
}

export interface TradeSuggestion {
  partner: TeamRosterAnalysis;
  // Player myTeam gives away
  giving: PlayerValue;
  // Player partner gives away
  receiving: PlayerValue;
  // 0-100. 50 = perfectly fair (same trade value). Closer to 50 = more fair.
  fairnessScore: number;
  // Value delta (receiving - giving). Positive = I'm winning on paper.
  valueDelta: number;
  // How well the trade fills both teams' holes (0-100)
  fitScore: number;
  // Combined score used for ranking suggestions. High fit + reasonable fairness.
  overallScore: number;
  reasoning: string[];
}

// Find trades where:
// - myTeam gives from a surplus position → partner's need position
// - partner gives from a surplus position → myTeam's need position
// - The two players have similar trade value (fairness)
//
// Excludes: players with very low value (bench-level), non-fantasy-relevant
// positions (K, DEF — these are streamed not traded).
export function findTradeSuggestions(
  myTeam: TeamRosterAnalysis,
  allTeams: TeamRosterAnalysis[],
  opts: { maxPerPartner?: number; minValueToTrade?: number } = {},
): TradeSuggestion[] {
  const { maxPerPartner = 3, minValueToTrade = 15 } = opts;
  const suggestions: TradeSuggestion[] = [];

  const partners = allTeams.filter((t) => t.rosterId !== myTeam.rosterId);

  for (const partner of partners) {
    const partnerSuggestions: TradeSuggestion[] = [];

    for (const myNeed of myTeam.needPositions) {
      // Candidate "receiving" players: partner's roster at their surplus positions
      // that match my need. FLEX need maps to RB/WR/TE.
      const needMatchers =
        myNeed === 'FLEX' ? ['RB', 'WR', 'TE'] : [myNeed];

      const receivingCandidates = partner.players.filter(
        (p) => needMatchers.includes(p.position) && p.tradeValue >= minValueToTrade,
      );

      for (const partnerNeed of partner.needPositions) {
        const giveMatchers = partnerNeed === 'FLEX' ? ['RB', 'WR', 'TE'] : [partnerNeed];
        const givingCandidates = myTeam.players.filter(
          (p) => giveMatchers.includes(p.position) && p.tradeValue >= minValueToTrade,
        );

        for (const receiving of receivingCandidates) {
          for (const giving of givingCandidates) {
            // Skip if this player is essential to my starting lineup (don't
            // suggest trading my only elite QB away, for example).
            const myPositionGrade = myTeam.positionGrades[giving.position as RosterPosition] || 0;
            if (myPositionGrade - giving.tradeValue < 30 && giving.tradeValue > 50) continue;

            const valueDelta = receiving.tradeValue - giving.tradeValue;
            const fairness = 100 - Math.min(Math.abs(valueDelta) * 2, 100);
            if (fairness < 50) continue; // too lopsided to be realistic

            // Fit score: how well it fills both teams' holes
            const myFitGain = Math.max(0, 60 - myTeam.positionGrades[myNeed as RosterPosition]);
            const partnerFitGain = Math.max(0, 60 - partner.positionGrades[partnerNeed as RosterPosition]);
            const fitScore = Math.min(100, myFitGain + partnerFitGain);

            const tradeActivityWeight = partner.tradingScale ? partner.tradingScale / 10 : 0.5;
            const overallScore = fairness * 0.35 + fitScore * 0.45 + (valueDelta > 0 ? 10 : 0) + tradeActivityWeight * 10;

            const reasoning: string[] = [
              `You're weak at ${myNeed} (${Math.round(myTeam.positionGrades[myNeed as RosterPosition])}/100) — ${receiving.name} fills that hole.`,
              `${partner.managerName} is weak at ${partnerNeed} (${Math.round(partner.positionGrades[partnerNeed as RosterPosition])}/100) — ${giving.name} fits their need.`,
            ];
            if (Math.abs(valueDelta) <= 5) reasoning.push('Roughly even-value swap.');
            else if (valueDelta > 0) reasoning.push(`You come out ahead by ~${valueDelta} value points.`);
            else reasoning.push(`You give up ~${-valueDelta} value points, but gain positional fit.`);
            if (partner.tradingScale != null && partner.tradingScale >= 7) reasoning.push(`${partner.managerName} is an active trader (${partner.tradingScale}/10).`);

            partnerSuggestions.push({
              partner,
              giving,
              receiving,
              fairnessScore: Math.round(fairness),
              valueDelta,
              fitScore: Math.round(fitScore),
              overallScore: Math.round(overallScore),
              reasoning,
            });
          }
        }
      }
    }

    partnerSuggestions.sort((a, b) => b.overallScore - a.overallScore);
    suggestions.push(...partnerSuggestions.slice(0, maxPerPartner));
  }

  return suggestions.sort((a, b) => b.overallScore - a.overallScore);
}

export interface TradeOptimizerData {
  teams: TeamRosterAnalysis[];
  leagueAverages: Record<RosterPosition, number>;
  slots: StarterSlots;
  season: string;
  leagueName: string;
  isOffseason: boolean;
}

// Main orchestrator: pulls rosters, users, matchups, players; builds team
// analyses with player values derived from season-to-date points.
export function buildOptimizerInput(
  rosters: SleeperRoster[],
  users: SleeperUser[],
  allMatchups: Record<number, SleeperMatchup[]>,
  playerMap: Map<string, PlayerMeta>,
  rosterPositions: string[],
): { analyses: TeamRosterAnalysis[]; slots: StarterSlots } {
  const slots = parseStarterSlots(rosterPositions);
  const teamMap = buildTeamMap(rosters, users);

  // Aggregate player points from all matchups
  const playerPoints = new Map<string, { points: number; games: number }>();
  for (const matchups of Object.values(allMatchups)) {
    for (const m of matchups) {
      for (const [pid, pts] of Object.entries(m.players_points || {})) {
        const entry = playerPoints.get(pid) || { points: 0, games: 0 };
        entry.points += pts;
        if (pts > 0) entry.games += 1; // only count games where they scored
        playerPoints.set(pid, entry);
      }
    }
  }

  const rosterInputs: RosterInput[] = rosters.map((roster) => {
    const players = (roster.players || [])
      .map((pid) => {
        const meta = playerMap.get(pid);
        if (!meta) return null;
        const stats = playerPoints.get(pid) || { points: 0, games: 0 };
        return valuePlayer(meta, stats.points, stats.games);
      })
      .filter((p): p is PlayerValue => p !== null);
    return { roster, players };
  });

  // First pass: compute per-team grades without league averages, then average,
  // then redo with averages known. This gives us proper surplus/need tagging.
  const firstPass = rosterInputs.map((input) => {
    const team = teamMap.get(input.roster.roster_id);
    return analyzeRoster(
      input,
      { QB: 50, RB: 50, WR: 50, TE: 50, K: 50, DEF: 50, FLEX: 50 },
      slots,
      {
        ownerId: input.roster.owner_id,
        displayName: team?.displayName || '',
        teamName: team?.teamName || '',
      },
    );
  });
  const leagueAverages = computeLeagueAverages(firstPass);
  const analyses = rosterInputs.map((input) => {
    const team = teamMap.get(input.roster.roster_id);
    return analyzeRoster(input, leagueAverages, slots, {
      ownerId: input.roster.owner_id,
      displayName: team?.displayName || '',
      teamName: team?.teamName || '',
    });
  });

  return { analyses, slots };
}
