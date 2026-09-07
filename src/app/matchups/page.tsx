import type { Metadata } from 'next';
import { buildTeamMap, pairMatchups, getAllTimeDataWithMatchups, getWinnersBracket } from '@/lib/sleeper';
import { ALL_LEAGUE_IDS, TOTAL_WEEKS, REGULAR_SEASON_WEEKS, MANAGER_INFO } from '@/lib/constants';
import { getManagerDisplayName } from '@/lib/utils';
import { getPlayerMap } from '@/lib/players';
import { getProjectionEngine, type ProjectionEngine } from '@/lib/projections';
import { LEAGUE_ID } from '@/lib/constants';
import { ESPN_HISTORY, espnTeamInfoMap } from '@/lib/espn-adapter';
import PageHeader from '@/components/ui/PageHeader';
import MatchupsSeasonView from '@/components/MatchupsSeasonView';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Matchups',
  description: 'Week-by-week matchup results and playoff brackets across every season.',
};

interface LineupSlot {
  slot: string;
  name: string;
  pos: string;
  pts: number;
  proj?: number;
}

interface MatchupTeam {
  rosterId: number;
  name: string;
  teamName: string;
  points: number;
  photo: string;
  ownerId: string;
  lineup: LineupSlot[];
  projTotal?: number;
  projWinPct?: number;
}

interface WeeklyMatchup {
  matchupId: number;
  team1: MatchupTeam;
  team2: MatchupTeam;
}

interface BracketEntry {
  round: number;
  matchNum: number;
  team1: { rosterId: number; name: string; teamName: string; photo: string } | null;
  team2: { rosterId: number; name: string; teamName: string; photo: string } | null;
  winnerId: number;
  loserId: number;
}

export default async function MatchupsPage() {
  // Brackets are keyed by the statically-known league ids, so they can load in
  // parallel with the season data instead of waiting on it
  const [seasons, bracketEntries, playerMap] = await Promise.all([
    getAllTimeDataWithMatchups(ALL_LEAGUE_IDS, TOTAL_WEEKS),
    Promise.all(
      ALL_LEAGUE_IDS.map(async (id) => [id, await getWinnersBracket(id).catch(() => [])] as const),
    ),
    getPlayerMap(),
  ]);
  const bracketsByLeague = new Map(bracketEntries);

  // Our own projection engine (see lib/projections.ts) for the current
  // season's upcoming games — original model, not Sleeper's projections
  const currentSeason = seasons.find((s) => s.leagueId === LEAGUE_ID);
  let engine: ProjectionEngine | null = null;
  if (currentSeason) {
    engine = await getProjectionEngine(
      (currentSeason.league.scoring_settings || {}) as Record<string, number>,
      currentSeason.season,
    ).catch(() => null);
  }

  const allSeasonMatchups: Record<string, { weeklyMatchups: Record<number, WeeklyMatchup[]>; bracketData: BracketEntry[] }> = {};

  seasons.forEach((seasonData) => {
    const teamMap = buildTeamMap(seasonData.rosters, seasonData.users);
    // Starter slot labels in lineup order (starters[] aligns with these)
    const starterSlots = (seasonData.league.roster_positions || []).filter(
      (p) => p !== 'BN' && p !== 'IR' && p !== 'TAXI',
    );

    const weeklyMatchups: Record<number, WeeklyMatchup[]> = {};
    for (const [weekStr, matchups] of Object.entries(seasonData.allMatchups)) {
      const week = parseInt(weekStr);
      const paired = pairMatchups(matchups);
      weeklyMatchups[week] = paired.map(({ matchupId, team1, team2 }) => {
        const getTeamInfo = (m: typeof team1): MatchupTeam => {
          const team = teamMap.get(m.roster_id);
          const roster = seasonData.rosters.find((r) => r.roster_id === m.roster_id);
          const manager = roster ? MANAGER_INFO[roster.owner_id] : null;
          const lineup: LineupSlot[] = (m.starters || []).map((pid, i) => {
            const p = pid && pid !== '0' ? playerMap.get(pid) : undefined;
            return {
              slot: starterSlots[i] || 'FLEX',
              name: p?.name || (pid && pid !== '0' ? pid : 'Empty'),
              pos: p?.position || '',
              pts: Math.round(((m.players_points || {})[pid] ?? m.starters_points?.[i] ?? 0) * 100) / 100,
            };
          });
          return {
            rosterId: m.roster_id,
            name: getManagerDisplayName(roster?.owner_id || '', team?.displayName || ''),
            teamName: team?.teamName || '',
            points: m.points,
            photo: manager?.photo || '/managers/question.jpg',
            ownerId: roster?.owner_id || '',
            lineup,
          };
        };
        const t1 = getTeamInfo(team1);
        const t2 = getTeamInfo(team2);

        // Project unplayed current-season games with our own model
        const unplayed = t1.points === 0 && t2.points === 0;
        // Only the upcoming week — future weeks get their own projections
        // (with their own opponents) when their time comes
        if (engine && seasonData.leagueId === LEAGUE_ID && unplayed && week === engine.targetWeek) {
          const enrich = (t: MatchupTeam, starters: string[]) => {
            let total = 0;
            let variance = 0;
            t.lineup.forEach((slotEntry, i) => {
              const pid = starters[i];
              const meta = pid && pid !== '0' ? playerMap.get(pid) : undefined;
              const p = pid && pid !== '0' ? engine!.proj(pid, meta) : 0;
              slotEntry.proj = p;
              total += p;
              const s = pid && pid !== '0' ? engine!.sd(pid, meta) : 0;
              variance += s * s;
            });
            t.projTotal = Math.round(total * 10) / 10;
            return variance;
          };
          const v1 = enrich(t1, team1.starters || []);
          const v2 = enrich(t2, team2.starters || []);
          const p = engine.winProb(t1.projTotal || 0, v1, t2.projTotal || 0, v2);
          t1.projWinPct = Math.round(p * 100);
          t2.projWinPct = 100 - t1.projWinPct;
        }
        return { matchupId, team1: t1, team2: t2 };
      });
    }

    const bracketData: BracketEntry[] = (bracketsByLeague.get(seasonData.leagueId) || []).map((match) => {
      const t1Id = typeof match.t1 === 'number' ? match.t1 : 0;
      const t2Id = typeof match.t2 === 'number' ? match.t2 : 0;
      const getInfo = (id: number) => {
        const team = teamMap.get(id);
        const roster = seasonData.rosters.find((r) => r.roster_id === id);
        const manager = roster ? MANAGER_INFO[roster.owner_id] : null;
        return {
          rosterId: id,
          name: getManagerDisplayName(roster?.owner_id || '', team?.displayName || ''),
          teamName: team?.teamName || '',
          photo: manager?.photo || '/managers/question.jpg',
        };
      };
      return {
        round: match.r,
        matchNum: match.m,
        team1: t1Id ? getInfo(t1Id) : null,
        team2: t2Id ? getInfo(t2Id) : null,
        winnerId: match.w,
        loserId: match.l,
      };
    });

    allSeasonMatchups[seasonData.season] = { weeklyMatchups, bracketData };
  });

  // ESPN era (2020-21): static weekly results, no bracket view
  for (const [seasonYear, espn] of Object.entries(ESPN_HISTORY)) {
    const infoMap = espnTeamInfoMap(espn);
    const weeklyMatchups: Record<number, WeeklyMatchup[]> = {};
    for (const m of espn.matchups) {
      const home = infoMap.get(m.homeTeamId);
      const away = infoMap.get(m.awayTeamId);
      if (!home || !away) continue;
      const toTeam = (info: typeof home, points: number): MatchupTeam => ({
        rosterId: info.teamId,
        name: info.name,
        teamName: info.teamName,
        points,
        photo: info.photo,
        ownerId: info.ownerId,
        lineup: [], // ESPN era has no per-player lineup data
      });
      const arr = weeklyMatchups[m.week] ?? (weeklyMatchups[m.week] = []);
      arr.push({
        matchupId: arr.length + 1,
        team1: toTeam(home, m.homePts),
        team2: toTeam(away, m.awayPts),
      });
    }
    allSeasonMatchups[seasonYear] = { weeklyMatchups, bracketData: [] };
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Matchups" subtitle="Week-by-Week Results Across All Seasons" />
      <MatchupsSeasonView
        allSeasonMatchups={allSeasonMatchups}
        totalWeeks={TOTAL_WEEKS}
        regularSeasonWeeks={REGULAR_SEASON_WEEKS}
      />
    </div>
  );
}
