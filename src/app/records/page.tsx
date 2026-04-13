import { getRosters, getUsers, getAllMatchups, buildTeamMap, pairMatchups } from '@/lib/sleeper';
import { PREV_LEAGUE_ID, REGULAR_SEASON_WEEKS, MANAGER_INFO } from '@/lib/constants';
import { getManagerDisplayName, formatPoints } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';

export const revalidate = 3600;

export default async function RecordsPage() {
  const [rosters, users, allMatchups] = await Promise.all([
    getRosters(PREV_LEAGUE_ID),
    getUsers(PREV_LEAGUE_ID),
    getAllMatchups(PREV_LEAGUE_ID, REGULAR_SEASON_WEEKS),
  ]);

  const teamMap = buildTeamMap(rosters, users);

  // Calculate records
  const weeklyScores: Array<{ rosterId: number; week: number; points: number }> = [];
  const weeklyWinners: Array<{ week: number; rosterId: number; points: number }> = [];
  const blowouts: Array<{ week: number; winnerId: number; loserId: number; margin: number; winnerPts: number; loserPts: number }> = [];
  const nailbiters: Array<{ week: number; t1Id: number; t2Id: number; margin: number; t1Pts: number; t2Pts: number }> = [];

  for (const [weekStr, matchups] of Object.entries(allMatchups)) {
    const week = parseInt(weekStr);
    let weekHigh = { rosterId: 0, points: 0 };

    for (const m of matchups) {
      weeklyScores.push({ rosterId: m.roster_id, week, points: m.points });
      if (m.points > weekHigh.points) {
        weekHigh = { rosterId: m.roster_id, points: m.points };
      }
    }
    if (weekHigh.rosterId) weeklyWinners.push({ week, ...weekHigh });

    const paired = pairMatchups(matchups);
    for (const { team1, team2 } of paired) {
      const margin = Math.abs(team1.points - team2.points);
      const winner = team1.points > team2.points ? team1 : team2;
      const loser = team1.points > team2.points ? team2 : team1;
      blowouts.push({ week, winnerId: winner.roster_id, loserId: loser.roster_id, margin, winnerPts: winner.points, loserPts: loser.points });
      nailbiters.push({ week, t1Id: team1.roster_id, t2Id: team2.roster_id, margin, t1Pts: team1.points, t2Pts: team2.points });
    }
  }

  // Sort for records
  const topScores = [...weeklyScores].sort((a, b) => b.points - a.points).slice(0, 10);
  const bottomScores = [...weeklyScores].sort((a, b) => a.points - b.points).slice(0, 10);
  const biggestBlowouts = [...blowouts].sort((a, b) => b.margin - a.margin).slice(0, 10);
  const closestGames = [...nailbiters].filter(g => g.margin > 0).sort((a, b) => a.margin - b.margin).slice(0, 10);

  // Season totals
  const seasonTotals = rosters.map((r) => ({
    rosterId: r.roster_id,
    ownerId: r.owner_id,
    fpts: (r.settings.fpts || 0) + ((r.settings.fpts_decimal || 0) / 100),
    wins: r.settings.wins,
    losses: r.settings.losses,
  })).sort((a, b) => b.fpts - a.fpts);

  // Weekly award winners count
  const weeklyWinCounts: Record<number, number> = {};
  for (const w of weeklyWinners) {
    weeklyWinCounts[w.rosterId] = (weeklyWinCounts[w.rosterId] || 0) + 1;
  }
  const topWeeklyWinners = Object.entries(weeklyWinCounts)
    .map(([rosterId, count]) => ({ rosterId: parseInt(rosterId), count }))
    .sort((a, b) => b.count - a.count);

  const getName = (rosterId: number) => {
    const roster = rosters.find(r => r.roster_id === rosterId);
    const team = teamMap.get(rosterId);
    return getManagerDisplayName(roster?.owner_id || '', team?.displayName || '');
  };

  const getPhoto = (rosterId: number) => {
    const roster = rosters.find(r => r.roster_id === rosterId);
    return roster ? (MANAGER_INFO[roster.owner_id]?.photo || '/managers/question.jpg') : '/managers/question.jpg';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Records & Awards" subtitle="2025 Season Records" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Highest Single Week Scores */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2">
            <span className="text-xl">🔥</span>
            <h3 className="font-bold">Highest Single Week Scores</h3>
          </div>
          <div className="divide-y divide-border/20">
            {topScores.map((score, i) => (
              <div key={`${score.rosterId}-${score.week}`} className="px-5 py-3 flex items-center gap-3">
                <span className={`w-6 text-center font-bold text-sm ${i === 0 ? 'text-gold' : 'text-text-muted'}`}>{i + 1}</span>
                <img src={getPhoto(score.rosterId)} alt="" className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="font-medium text-sm">{getName(score.rosterId)}</div>
                  <div className="text-text-muted text-xs">Week {score.week}</div>
                </div>
                <span className="font-bold text-gold">{formatPoints(score.points)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lowest Single Week Scores */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2">
            <span className="text-xl">💀</span>
            <h3 className="font-bold">Lowest Single Week Scores</h3>
          </div>
          <div className="divide-y divide-border/20">
            {bottomScores.map((score, i) => (
              <div key={`${score.rosterId}-${score.week}`} className="px-5 py-3 flex items-center gap-3">
                <span className="w-6 text-center font-bold text-sm text-text-muted">{i + 1}</span>
                <img src={getPhoto(score.rosterId)} alt="" className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="font-medium text-sm">{getName(score.rosterId)}</div>
                  <div className="text-text-muted text-xs">Week {score.week}</div>
                </div>
                <span className="font-bold text-danger">{formatPoints(score.points)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Biggest Blowouts */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2">
            <span className="text-xl">💥</span>
            <h3 className="font-bold">Biggest Blowouts</h3>
          </div>
          <div className="divide-y divide-border/20">
            {biggestBlowouts.map((game, i) => (
              <div key={`${game.week}-${game.winnerId}`} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center font-bold text-sm text-text-muted">{i + 1}</span>
                    <span className="font-medium text-sm text-success">{getName(game.winnerId)}</span>
                  </div>
                  <span className="text-success font-bold text-sm">{formatPoints(game.winnerPts)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center text-text-muted text-xs">vs</span>
                    <span className="text-sm text-text-secondary">{getName(game.loserId)}</span>
                  </div>
                  <span className="text-text-muted text-sm">{formatPoints(game.loserPts)}</span>
                </div>
                <div className="text-text-muted text-xs mt-1 ml-8">Week {game.week} &middot; Margin: {formatPoints(game.margin)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Closest Games */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2">
            <span className="text-xl">🤏</span>
            <h3 className="font-bold">Closest Games</h3>
          </div>
          <div className="divide-y divide-border/20">
            {closestGames.map((game, i) => {
              const winner = game.t1Pts > game.t2Pts ? { id: game.t1Id, pts: game.t1Pts } : { id: game.t2Id, pts: game.t2Pts };
              const loser = game.t1Pts > game.t2Pts ? { id: game.t2Id, pts: game.t2Pts } : { id: game.t1Id, pts: game.t1Pts };
              return (
                <div key={`${game.week}-${game.t1Id}`} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-center font-bold text-sm text-text-muted">{i + 1}</span>
                      <span className="font-medium text-sm">{getName(winner.id)}</span>
                    </div>
                    <span className="font-bold text-sm">{formatPoints(winner.pts)}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-center text-text-muted text-xs">vs</span>
                      <span className="text-sm text-text-secondary">{getName(loser.id)}</span>
                    </div>
                    <span className="text-text-muted text-sm">{formatPoints(loser.pts)}</span>
                  </div>
                  <div className="text-gold text-xs mt-1 ml-8 font-medium">Week {game.week} &middot; Margin: {formatPoints(game.margin)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Season Scoring Leaders */}
        <div className="glass-card overflow-hidden lg:col-span-2">
          <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h3 className="font-bold">Season Points Leaders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="stats-table">
              <thead>
                <tr><th>Rank</th><th>Manager</th><th>Record</th><th>Total Points</th><th>Weekly Highs Won</th></tr>
              </thead>
              <tbody>
                {seasonTotals.map((team, i) => (
                  <tr key={team.rosterId}>
                    <td className="font-bold text-text-muted">{i + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <img src={getPhoto(team.rosterId)} alt="" className="w-7 h-7 rounded-full object-cover" />
                        <span className="font-medium">{getName(team.rosterId)}</span>
                      </div>
                    </td>
                    <td className="font-mono">{team.wins}-{team.losses}</td>
                    <td className="font-bold text-gold">{formatPoints(team.fpts)}</td>
                    <td className="text-text-secondary">{weeklyWinCounts[team.rosterId] || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
