import { getRosters, getUsers, getAllMatchups, getWinnersBracket, getLosersBracket, buildTeamMap, pairMatchups } from '@/lib/sleeper';
import { PREV_LEAGUE_ID, TOTAL_WEEKS, REGULAR_SEASON_WEEKS } from '@/lib/constants';
import { getManagerDisplayName, formatPoints } from '@/lib/utils';
import { MANAGER_INFO } from '@/lib/constants';
import PageHeader from '@/components/ui/PageHeader';
import MatchupWeekSelector from '@/components/MatchupWeekSelector';

export const revalidate = 3600;

export default async function MatchupsPage() {
  const [rosters, users, allMatchups, winnersBracket, losersBracket] = await Promise.all([
    getRosters(PREV_LEAGUE_ID),
    getUsers(PREV_LEAGUE_ID),
    getAllMatchups(PREV_LEAGUE_ID, TOTAL_WEEKS),
    getWinnersBracket(PREV_LEAGUE_ID),
    getLosersBracket(PREV_LEAGUE_ID),
  ]);

  const teamMap = buildTeamMap(rosters, users);

  // Process all weeks into paired matchups
  const weeklyMatchups: Record<number, Array<{
    matchupId: number;
    team1: { rosterId: number; name: string; teamName: string; points: number; photo: string };
    team2: { rosterId: number; name: string; teamName: string; points: number; photo: string };
  }>> = {};

  for (const [weekStr, matchups] of Object.entries(allMatchups)) {
    const week = parseInt(weekStr);
    const paired = pairMatchups(matchups);
    weeklyMatchups[week] = paired.map(({ matchupId, team1, team2 }) => {
      const getTeamInfo = (m: typeof team1) => {
        const team = teamMap.get(m.roster_id);
        const roster = rosters.find(r => r.roster_id === m.roster_id);
        const manager = roster ? MANAGER_INFO[roster.owner_id] : null;
        return {
          rosterId: m.roster_id,
          name: getManagerDisplayName(roster?.owner_id || '', team?.displayName || ''),
          teamName: team?.teamName || '',
          points: m.points,
          photo: manager?.photo || '/managers/question.jpg',
        };
      };
      return { matchupId, team1: getTeamInfo(team1), team2: getTeamInfo(team2) };
    });
  }

  // Process brackets
  const bracketData = winnersBracket.map((match) => {
    const t1Id = typeof match.t1 === 'number' ? match.t1 : 0;
    const t2Id = typeof match.t2 === 'number' ? match.t2 : 0;
    const getInfo = (id: number) => {
      const team = teamMap.get(id);
      const roster = rosters.find(r => r.roster_id === id);
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Matchups" subtitle="2025 Season Week-by-Week Results" />

      <MatchupWeekSelector
        weeklyMatchups={weeklyMatchups}
        totalWeeks={TOTAL_WEEKS}
        regularSeasonWeeks={REGULAR_SEASON_WEEKS}
        bracketData={bracketData}
      />
    </div>
  );
}
