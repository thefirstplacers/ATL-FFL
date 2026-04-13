import { getRosters, getUsers, getAllMatchups, buildTeamMap, pairMatchups } from '@/lib/sleeper';
import { PREV_LEAGUE_ID, REGULAR_SEASON_WEEKS, MANAGER_INFO } from '@/lib/constants';
import { getManagerDisplayName, formatPoints } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import RivalryTool from '@/components/RivalryTool';

export const revalidate = 3600;

export default async function RivalryPage() {
  const [rosters, users, allMatchups] = await Promise.all([
    getRosters(PREV_LEAGUE_ID),
    getUsers(PREV_LEAGUE_ID),
    getAllMatchups(PREV_LEAGUE_ID, REGULAR_SEASON_WEEKS),
  ]);

  const teamMap = buildTeamMap(rosters, users);

  // Build head-to-head records
  const h2hRecords: Record<string, { wins: number; losses: number; totalPF: number; totalPA: number; games: Array<{ week: number; pts: number; oppPts: number }> }> = {};

  for (const [weekStr, matchups] of Object.entries(allMatchups)) {
    const week = parseInt(weekStr);
    const paired = pairMatchups(matchups);
    for (const { team1, team2 } of paired) {
      const key1 = `${team1.roster_id}-${team2.roster_id}`;
      const key2 = `${team2.roster_id}-${team1.roster_id}`;
      if (!h2hRecords[key1]) h2hRecords[key1] = { wins: 0, losses: 0, totalPF: 0, totalPA: 0, games: [] };
      if (!h2hRecords[key2]) h2hRecords[key2] = { wins: 0, losses: 0, totalPF: 0, totalPA: 0, games: [] };

      h2hRecords[key1].totalPF += team1.points;
      h2hRecords[key1].totalPA += team2.points;
      h2hRecords[key1].games.push({ week, pts: team1.points, oppPts: team2.points });

      h2hRecords[key2].totalPF += team2.points;
      h2hRecords[key2].totalPA += team1.points;
      h2hRecords[key2].games.push({ week, pts: team2.points, oppPts: team1.points });

      if (team1.points > team2.points) {
        h2hRecords[key1].wins++;
        h2hRecords[key2].losses++;
      } else {
        h2hRecords[key2].wins++;
        h2hRecords[key1].losses++;
      }
    }
  }

  // Build team list for selector
  const teamList = rosters.map((roster) => {
    const team = teamMap.get(roster.roster_id);
    const manager = MANAGER_INFO[roster.owner_id];
    return {
      rosterId: roster.roster_id,
      name: getManagerDisplayName(roster.owner_id, team?.displayName || ''),
      teamName: team?.teamName || '',
      photo: manager?.photo || '/managers/question.jpg',
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Rivalry" subtitle="Head-to-Head Matchup Comparisons (2025)" />
      <RivalryTool teams={teamList} h2hRecords={h2hRecords} />
    </div>
  );
}
