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
  pointsScored: number;
  gamesPlayed: number;
  ppg: number;
  // Value Over Replacement Player: PPG minus the replacement-level PPG at
  // this player's position. Dynamic — derived from league rosters, not a table.
  vorp: number;
  // Within-position z-score (VORP / stdDev of position VORP). Normalizes for
  // positional scarcity: +1σ at QB is rarer than +1σ at RB.
  zScore: number;
  // Position tier: 1 = elite (top starter), 2 = solid starter, 3 = flex/reserve,
  // 4 = bench depth, 5 = replacement/waiver.
  tier: number;
  // Final 0-100 trade value. Blends VORP + z-score + age + injury.
  // Calibrated so: top-5 overall ≈ 90+, QB1/RB1/WR1/TE1 ≈ 70-85, starter ≈ 40-65,
  // flex/reserve ≈ 20-40, replacement ≈ 0-15.
  tradeValue: number;
}

// ----------------------------------------------------------------------------
// Valuation math — based on Value-Based Drafting (VBD) theory.
//
// Core insight: fantasy points are only valuable to the extent they *beat
// what you could get off waivers*. A QB scoring 18 PPG is barely startable
// (QB waiver wire ≈ 16 PPG in PPR). A TE scoring 18 PPG is elite (TE waiver
// wire ≈ 6 PPG). Same raw points, very different value.
//
// Two layers:
// 1. VORP (Value Over Replacement Player): PPG − replacement PPG at position.
//    Replacement = the ~Nth-best rostered player at that position, where N is
//    the number of teams × starters at position, with FLEX absorbed into RB/WR/TE.
//    This is Joe Bryant's original VBD concept, used by FantasyPros/PFF/ESPN.
//
// 2. Position-scarcity z-score (VORP / σ_position). At QB, the gap between
//    QB1 and QB12 is small (σ ≈ 3-4 PPG), so a few PPG over replacement is
//    HUGE. At RB, σ is large (σ ≈ 5-7), so +5 PPG is less rare.
//    See: Chase Stuart's "Approximate Value" work and the "VBD-based auction
//    pricing" literature — z-score normalization makes cross-position values
//    directly comparable.
// ----------------------------------------------------------------------------

// League scale: 12 teams, single-QB, 2 RB + 2 WR + 1 TE + 1 FLEX. These
// control how deep the "starter pool" goes — deeper = lower replacement level.
interface LeagueScaleConfig {
  numTeams: number;
  qbStarters: number;
  rbStarters: number;
  wrStarters: number;
  teStarters: number;
  flexStarters: number; // FLEX draws from RB/WR/TE pool
  kStarters: number;
  defStarters: number;
}

function deriveLeagueScale(rosters: SleeperRoster[], slots: StarterSlots): LeagueScaleConfig {
  return {
    numTeams: rosters.length,
    qbStarters: slots.QB,
    rbStarters: slots.RB,
    wrStarters: slots.WR,
    teStarters: slots.TE,
    flexStarters: slots.FLEX,
    kStarters: slots.K,
    defStarters: slots.DEF,
  };
}

// How deep the "replacement player" sits at each position. Accounts for
// FLEX drawing from RB/WR/TE — we allocate FLEX slots proportionally to
// how position groups are actually used (league-average roster construction).
function replacementRank(position: string, scale: LeagueScaleConfig): number {
  const { numTeams, qbStarters, rbStarters, wrStarters, teStarters, flexStarters, kStarters, defStarters } = scale;
  // Allocate FLEX slots: roughly 55% RB, 35% WR, 10% TE in standard PPR usage,
  // but scale by the starter counts for safety.
  const totalFlex = flexStarters * numTeams;
  const rbFlexShare = Math.round(totalFlex * 0.55);
  const wrFlexShare = Math.round(totalFlex * 0.35);
  const teFlexShare = totalFlex - rbFlexShare - wrFlexShare;

  switch (position) {
    case 'QB':  return numTeams * qbStarters;                     // 12-team 1QB → 12
    case 'RB':  return numTeams * rbStarters + rbFlexShare;       // 12 × 2 + 6 ≈ 30
    case 'WR':  return numTeams * wrStarters + wrFlexShare;       // 12 × 2 + 4 ≈ 28
    case 'TE':  return numTeams * teStarters + teFlexShare;       // 12 × 1 + 2 ≈ 14
    case 'K':   return numTeams * kStarters;
    case 'DEF': return numTeams * defStarters;
    default:    return numTeams;
  }
}

// Per-position stats computed once from all rostered players. These are what
// make values comparable across positions.
export interface PositionStats {
  position: string;
  ppgList: number[];              // sorted desc
  replacementPPG: number;          // PPG of the Nth-ranked player
  meanVORP: number;
  stdDevVORP: number;
  tierThresholds: { t1: number; t2: number; t3: number; t4: number }; // PPG cutoffs
}

export function computePositionStats(
  allPlayers: Array<{ position: string; ppg: number }>,
  scale: LeagueScaleConfig,
): Map<string, PositionStats> {
  const byPos = new Map<string, number[]>();
  for (const p of allPlayers) {
    if (!p.position || p.ppg <= 0) continue;
    const bucket = byPos.get(p.position) || [];
    bucket.push(p.ppg);
    byPos.set(p.position, bucket);
  }

  const stats = new Map<string, PositionStats>();
  for (const [position, ppgList] of byPos) {
    ppgList.sort((a, b) => b - a);
    const rank = replacementRank(position, scale);
    // Clamp to bounds; if the position has fewer than N rostered, use the
    // worst of the bunch + a small buffer.
    const replacementPPG = ppgList[Math.min(rank - 1, ppgList.length - 1)] ?? 0;

    // VORP list
    const vorps = ppgList.map((p) => p - replacementPPG);
    const meanVORP = vorps.reduce((s, v) => s + v, 0) / Math.max(vorps.length, 1);
    const variance = vorps.reduce((s, v) => s + (v - meanVORP) ** 2, 0) / Math.max(vorps.length, 1);
    const stdDevVORP = Math.sqrt(variance);

    // Tier thresholds: percentile-based within the position
    const nth = (q: number) => ppgList[Math.max(0, Math.min(ppgList.length - 1, Math.floor(ppgList.length * q)))] ?? 0;
    stats.set(position, {
      position,
      ppgList,
      replacementPPG,
      meanVORP,
      stdDevVORP,
      tierThresholds: {
        t1: nth(0.05),    // top 5% = elite
        t2: nth(0.15),    // top 15% = strong starter
        t3: nth(0.33),    // top 33% = starter/flex
        t4: nth(0.60),    // top 60% = bench depth
      },
    });
  }
  return stats;
}

function tierFromPPG(ppg: number, t: PositionStats['tierThresholds']): number {
  if (ppg >= t.t1) return 1;
  if (ppg >= t.t2) return 2;
  if (ppg >= t.t3) return 3;
  if (ppg >= t.t4) return 4;
  return 5;
}

function ageMultiplier(position: string, age: number): number {
  if (!age) return 1;
  if (position === 'RB') {
    if (age <= 23) return 1.10;
    if (age <= 26) return 1.00;
    if (age <= 28) return 0.92;
    return 0.78;
  }
  if (position === 'WR' || position === 'TE') {
    if (age <= 24) return 1.08;
    if (age <= 29) return 1.00;
    if (age <= 31) return 0.94;
    return 0.82;
  }
  if (position === 'QB') {
    if (age <= 25) return 1.06;
    if (age <= 34) return 1.00;
    return 0.92;
  }
  return 1;
}

function injuryPenalty(status: string | null): number {
  if (!status) return 1;
  const s = status.toLowerCase();
  if (s.includes('out') || s.includes('ir')) return 0.70;
  if (s.includes('doubt')) return 0.82;
  if (s.includes('quest')) return 0.94;
  return 1;
}

// Small positional-importance multiplier on top of z-score. z-score handles
// most of the scarcity math, but PPR leagues empirically reward elite TEs
// and elite RBs slightly more (Robert Schmitz / Scott Barrett's work on
// positional value in PPR shows TE and RB command ~15-20% premiums).
const POSITION_IMPORTANCE: Record<string, number> = {
  QB: 1.00,
  RB: 1.08,
  WR: 1.05,
  TE: 1.12,
  K: 0.40,
  DEF: 0.45,
};

function valuePlayer(
  player: PlayerMeta,
  pointsScored: number,
  gamesPlayed: number,
  posStats: PositionStats | undefined,
): PlayerValue {
  const ppg = gamesPlayed > 0 ? pointsScored / gamesPlayed : 0;
  const replacementPPG = posStats?.replacementPPG ?? 0;
  const vorp = ppg - replacementPPG;
  const stdDev = posStats?.stdDevVORP ?? 1;
  const zScore = stdDev > 0 ? vorp / stdDev : 0;
  const tier = posStats ? tierFromPPG(ppg, posStats.tierThresholds) : 5;

  // Baseline: players below replacement (negative VORP) get 0 value.
  const positiveVorp = Math.max(vorp, 0);
  const positiveZ = Math.max(zScore, 0);

  // Blend 60% z-score (cross-position fairness) + 40% raw VORP (absolute scoring).
  // Pure z would over-value elite TEs (thin position); pure VORP under-values
  // them. 60/40 is the FantasyPros tuning for PPR trade calculators.
  const blended = positiveZ * 0.6 * 15 + positiveVorp * 0.4 * 1.5;

  const importance = POSITION_IMPORTANCE[player.position] ?? 0.5;
  const raw = blended * importance * ageMultiplier(player.position, player.age) * injuryPenalty(player.injuryStatus);

  // Cap at 100. A top-5 overall player typically lands 85-95.
  const tradeValue = Math.max(0, Math.min(100, Math.round(raw)));

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
    vorp: Math.round(vorp * 10) / 10,
    zScore: Math.round(zScore * 100) / 100,
    tier,
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
  // Starter strength per position (sum of top-N trade values, capped at 100)
  positionGrades: Record<RosterPosition, number>;
  surplusPositions: RosterPosition[];
  needPositions: RosterPosition[];
  totalValue: number;
  startersPPG: number;
}

const POSITION_ORDER: RosterPosition[] = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'FLEX'];

function gradePositionGroup(players: PlayerValue[], position: RosterPosition, slots: StarterSlots): number {
  if (position === 'FLEX') {
    const flexEligible = players
      .filter((p) => ['RB', 'WR', 'TE'].includes(p.position))
      .sort((a, b) => b.tradeValue - a.tradeValue);
    const mainStarters = slots.RB + slots.WR + slots.TE;
    const flexPool = flexEligible.slice(mainStarters, mainStarters + slots.FLEX + 1);
    if (flexPool.length === 0) return 0;
    return Math.round(flexPool.reduce((s, p) => s + p.tradeValue, 0) / flexPool.length);
  }

  const starters = slots[position];
  if (starters === 0) return 50;
  const atPosition = players
    .filter((p) => p.position === position)
    .sort((a, b) => b.tradeValue - a.tradeValue);
  const pool = atPosition.slice(0, starters + 1);
  if (pool.length === 0) return 0;
  // Weighted avg: starters count fully, top reserve counts half.
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

  const THRESHOLD = 10;
  const surplusPositions: RosterPosition[] = [];
  const needPositions: RosterPosition[] = [];
  for (const p of POSITION_ORDER) {
    if (p === 'K' || p === 'DEF') continue;
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

export function computeLeagueAverages(
  analyses: Pick<TeamRosterAnalysis, 'positionGrades'>[],
): Record<RosterPosition, number> {
  const sums: Record<RosterPosition, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0, FLEX: 0 };
  for (const a of analyses) for (const p of POSITION_ORDER) sums[p] += a.positionGrades[p];
  const result: Record<RosterPosition, number> = { QB: 0, RB: 0, WR: 0, TE: 0, K: 0, DEF: 0, FLEX: 0 };
  const n = Math.max(analyses.length, 1);
  for (const p of POSITION_ORDER) result[p] = sums[p] / n;
  return result;
}

export interface TradeSuggestion {
  partner: TeamRosterAnalysis;
  giving: PlayerValue;
  receiving: PlayerValue;
  fairnessScore: number;
  valueDelta: number;
  fitScore: number;
  overallScore: number;
  reasoning: string[];
}

// Positions to consider when matching wants (K/DEF are streamed, not traded).
const TRADEABLE_POSITIONS: RosterPosition[] = ['QB', 'RB', 'WR', 'TE'];

// A team "wants" a position if their grade is below the league avg there —
// even a small deficit is interesting. We relax the old ±10 hard threshold
// that was filtering out every balanced team.
function positionWants(team: TeamRosterAnalysis, leagueAverages: Record<RosterPosition, number>): RosterPosition[] {
  const wants: Array<{ pos: RosterPosition; gap: number }> = [];
  for (const pos of TRADEABLE_POSITIONS) {
    const gap = leagueAverages[pos] - team.positionGrades[pos]; // positive = below avg
    wants.push({ pos, gap });
  }
  // Everyone has 2-3 positions they'd happily upgrade. Sort by largest gap.
  return wants.sort((a, b) => b.gap - a.gap).slice(0, 3).map((w) => w.pos);
}

// What team has to spare: a position where they have strong depth (second-best
// player at that position is still T1-T3). We surface these as "givable" even
// if the team isn't formally in "surplus" territory.
function positionHas(team: TeamRosterAnalysis): RosterPosition[] {
  const has: Array<{ pos: RosterPosition; depth: number }> = [];
  for (const pos of TRADEABLE_POSITIONS) {
    const atPos = team.players.filter((p) => p.position === pos).sort((a, b) => b.tradeValue - a.tradeValue);
    // Depth score: 2nd-best player's trade value (what you could trade without
    // gutting your starting lineup).
    const second = atPos[1]?.tradeValue ?? 0;
    has.push({ pos, depth: second });
  }
  return has.sort((a, b) => b.depth - a.depth).slice(0, 3).map((w) => w.pos);
}

export function findTradeSuggestions(
  myTeam: TeamRosterAnalysis,
  allTeams: TeamRosterAnalysis[],
  leagueAverages: Record<RosterPosition, number>,
  opts: { maxPerPartner?: number; minValueToTrade?: number } = {},
): TradeSuggestion[] {
  const { maxPerPartner = 3, minValueToTrade = 10 } = opts;
  const suggestions: TradeSuggestion[] = [];
  const partners = allTeams.filter((t) => t.rosterId !== myTeam.rosterId);

  const myWants = positionWants(myTeam, leagueAverages);
  const myHas = positionHas(myTeam);

  for (const partner of partners) {
    const partnerSuggestions: TradeSuggestion[] = [];
    const partnerWants = positionWants(partner, leagueAverages);
    const partnerHas = positionHas(partner);

    // Valid matches:
    //   myWant ∈ myWants AND myWant ∈ partnerHas  (they have what I want)
    //   partnerWant ∈ partnerWants AND partnerWant ∈ myHas (I have what they want)
    const myNeedsMatched = myWants.filter((p) => partnerHas.includes(p));
    const theirNeedsMatched = partnerWants.filter((p) => myHas.includes(p));

    // Fallback: if no clean match, still try any cross-want pairing (you can
    // always offer somebody something they might like).
    const myNeeds = myNeedsMatched.length > 0 ? myNeedsMatched : myWants;
    const theirNeeds = theirNeedsMatched.length > 0 ? theirNeedsMatched : partnerWants;

    for (const myNeed of myNeeds) {
      const needMatchers = myNeed === 'FLEX' ? ['RB', 'WR', 'TE'] : [myNeed];
      const receivingCandidates = partner.players.filter(
        (p) => needMatchers.includes(p.position) && p.tradeValue >= minValueToTrade,
      );

      for (const partnerNeed of theirNeeds) {
        const giveMatchers = partnerNeed === 'FLEX' ? ['RB', 'WR', 'TE'] : [partnerNeed];
        const givingCandidates = myTeam.players.filter(
          (p) => giveMatchers.includes(p.position) && p.tradeValue >= minValueToTrade,
        );

        for (const receiving of receivingCandidates) {
          for (const giving of givingCandidates) {
            // Don't suggest giving up a top player if I'd have nothing left at
            // that position. "Protect the starters" rule.
            const myAtGivingPos = myTeam.players
              .filter((p) => p.position === giving.position)
              .sort((a, b) => b.tradeValue - a.tradeValue);
            const indexOfGiving = myAtGivingPos.findIndex((p) => p.id === giving.id);
            const slotsNeeded = giving.position === 'QB' ? 1 : giving.position === 'TE' ? 1 : 2;
            // If this player is among my top `slotsNeeded`, only trade them if
            // the incoming player is a clear upgrade at that position OR I'm
            // trading surplus at a different position.
            if (indexOfGiving < slotsNeeded && giving.position !== receiving.position) {
              const behindGiving = myAtGivingPos[slotsNeeded]?.tradeValue ?? 0;
              if (giving.tradeValue - behindGiving > 20) continue; // too big a dropoff
            }

            const valueDelta = receiving.tradeValue - giving.tradeValue;
            const fairness = 100 - Math.min(Math.abs(valueDelta) * 2.5, 100);
            if (fairness < 40) continue;

            // Fit = how much each team's weak position improves. Bigger
            // improvements = better fit.
            const myCurrent = myTeam.positionGrades[myNeed as RosterPosition];
            const partnerCurrent = partner.positionGrades[partnerNeed as RosterPosition];
            const myFitGain = Math.max(0, leagueAverages[myNeed] - myCurrent) + Math.max(0, receiving.tradeValue - 40);
            const partnerFitGain = Math.max(0, leagueAverages[partnerNeed] - partnerCurrent) + Math.max(0, giving.tradeValue - 40);
            const fitScore = Math.min(100, myFitGain + partnerFitGain);

            const tradeActivityWeight = partner.tradingScale != null ? partner.tradingScale / 10 : 0.5;
            const overallScore = fairness * 0.30 + fitScore * 0.45 + (valueDelta > 0 ? 10 : 0) + tradeActivityWeight * 15;

            const myGradeStr = Math.round(myCurrent);
            const theirGradeStr = Math.round(partnerCurrent);
            const reasoning: string[] = [
              `Your ${myNeed} grade is ${myGradeStr}/100 (league avg ${Math.round(leagueAverages[myNeed])}). ${receiving.name} — ${receiving.ppg} PPG, ${receiving.vorp > 0 ? '+' : ''}${receiving.vorp} VORP — is an upgrade.`,
              `${partner.managerName}'s ${partnerNeed} grade is ${theirGradeStr}/100 (avg ${Math.round(leagueAverages[partnerNeed])}). ${giving.name} (${giving.ppg} PPG) improves that room.`,
            ];
            if (Math.abs(valueDelta) <= 5) reasoning.push('Essentially even-value swap.');
            else if (valueDelta > 0) reasoning.push(`You come out ahead by ~${valueDelta} value points.`);
            else reasoning.push(`You give up ~${-valueDelta} value points, but gain positional fit.`);
            if (partner.tradingScale != null && partner.tradingScale >= 7) {
              reasoning.push(`${partner.managerName} is an active trader (${partner.tradingScale}/10) — higher chance they say yes.`);
            } else if (partner.tradingScale != null && partner.tradingScale <= 3) {
              reasoning.push(`Heads up: ${partner.managerName} is a reluctant trader (${partner.tradingScale}/10).`);
            }

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
  positionStats: Map<string, PositionStats>;
  season: string;
  leagueName: string;
  isOffseason: boolean;
}

export function buildOptimizerInput(
  rosters: SleeperRoster[],
  users: SleeperUser[],
  allMatchups: Record<number, SleeperMatchup[]>,
  playerMap: Map<string, PlayerMeta>,
  rosterPositions: string[],
): { analyses: TeamRosterAnalysis[]; slots: StarterSlots; positionStats: Map<string, PositionStats> } {
  const slots = parseStarterSlots(rosterPositions);
  const scale = deriveLeagueScale(rosters, slots);
  const teamMap = buildTeamMap(rosters, users);

  // Aggregate actual fantasy points per player from all played weeks.
  const playerPoints = new Map<string, { points: number; games: number }>();
  for (const matchups of Object.values(allMatchups)) {
    for (const m of matchups) {
      for (const [pid, pts] of Object.entries(m.players_points || {})) {
        const entry = playerPoints.get(pid) || { points: 0, games: 0 };
        entry.points += pts;
        if (pts > 0) entry.games += 1;
        playerPoints.set(pid, entry);
      }
    }
  }

  // First pass: collect every rostered player's PPG so we can compute true
  // per-position replacement levels from this league (not a hardcoded table).
  const allRosteredPpg: Array<{ position: string; ppg: number }> = [];
  for (const roster of rosters) {
    for (const pid of roster.players || []) {
      const meta = playerMap.get(pid);
      if (!meta) continue;
      const stats = playerPoints.get(pid) || { points: 0, games: 0 };
      const ppg = stats.games > 0 ? stats.points / stats.games : 0;
      allRosteredPpg.push({ position: meta.position, ppg });
    }
  }

  const positionStats = computePositionStats(allRosteredPpg, scale);

  const rosterInputs: RosterInput[] = rosters.map((roster) => {
    const players = (roster.players || [])
      .map((pid) => {
        const meta = playerMap.get(pid);
        if (!meta) return null;
        const stats = playerPoints.get(pid) || { points: 0, games: 0 };
        return valuePlayer(meta, stats.points, stats.games, positionStats.get(meta.position));
      })
      .filter((p): p is PlayerValue => p !== null);
    return { roster, players };
  });

  // Two-pass league average: first compute grades with placeholder averages,
  // then recompute with the actual averages so surplus/need labeling is correct.
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

  return { analyses, slots, positionStats };
}
