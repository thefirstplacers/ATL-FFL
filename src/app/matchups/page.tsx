import type { Metadata } from 'next';
import { buildTeamMap, pairMatchups, getAllTimeDataWithMatchups, getWinnersBracket } from '@/lib/sleeper';
import { ALL_LEAGUE_IDS, TOTAL_WEEKS, REGULAR_SEASON_WEEKS, MANAGER_INFO } from '@/lib/constants';
import { getManagerDisplayName } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import MatchupsSeasonView from '@/components/MatchupsSeasonView';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Matchups',
  description: 'Week-by-week matchup results and playoff brackets across every season.',
};

interface MatchupTeam {
  rosterId: number;
  name: string;
  teamName: string;
  points: number;
  photo: string;
  ownerId: string;
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
  const [seasons, bracketEntries] = await Promise.all([
    getAllTimeDataWithMatchups(ALL_LEAGUE_IDS, TOTAL_WEEKS),
    Promise.all(
      ALL_LEAGUE_IDS.map(async (id) => [id, await getWinnersBracket(id).catch(() => [])] as const),
    ),
  ]);
  const bracketsByLeague = new Map(bracketEntries);

  const allSeasonMatchups: Record<string, { weeklyMatchups: Record<number, WeeklyMatchup[]>; bracketData: BracketEntry[] }> = {};

  seasons.forEach((seasonData) => {
    const teamMap = buildTeamMap(seasonData.rosters, seasonData.users);

    const weeklyMatchups: Record<number, WeeklyMatchup[]> = {};
    for (const [weekStr, matchups] of Object.entries(seasonData.allMatchups)) {
      const week = parseInt(weekStr);
      const paired = pairMatchups(matchups);
      weeklyMatchups[week] = paired.map(({ matchupId, team1, team2 }) => {
        const getTeamInfo = (m: typeof team1): MatchupTeam => {
          const team = teamMap.get(m.roster_id);
          const roster = seasonData.rosters.find((r) => r.roster_id === m.roster_id);
          const manager = roster ? MANAGER_INFO[roster.owner_id] : null;
          return {
            rosterId: m.roster_id,
            name: getManagerDisplayName(roster?.owner_id || '', team?.displayName || ''),
            teamName: team?.teamName || '',
            points: m.points,
            photo: manager?.photo || '/managers/question.jpg',
            ownerId: roster?.owner_id || '',
          };
        };
        return { matchupId, team1: getTeamInfo(team1), team2: getTeamInfo(team2) };
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
