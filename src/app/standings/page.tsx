import { getRosters, getUsers, buildTeamMap } from '@/lib/sleeper';
import { PREV_LEAGUE_ID, DIVISIONS, DIVISION_COLORS } from '@/lib/constants';
import { getManagerDisplayName, formatPoints, formatRecord, getWinPercentage } from '@/lib/utils';
import { MANAGER_INFO } from '@/lib/constants';
import PageHeader from '@/components/ui/PageHeader';

export const revalidate = 3600;

export default async function StandingsPage() {
  const [rosters, users] = await Promise.all([
    getRosters(PREV_LEAGUE_ID),
    getUsers(PREV_LEAGUE_ID),
  ]);

  const teamMap = buildTeamMap(rosters, users);

  // Build standings data
  const standings = rosters.map((roster) => {
    const team = teamMap.get(roster.roster_id);
    const fpts = (roster.settings.fpts || 0) + ((roster.settings.fpts_decimal || 0) / 100);
    const fptsAgainst = (roster.settings.fpts_against || 0) + ((roster.settings.fpts_against_decimal || 0) / 100);
    const division = parseInt(roster.metadata?.division || '1');
    return {
      rosterId: roster.roster_id,
      ownerId: roster.owner_id,
      name: getManagerDisplayName(roster.owner_id, team?.displayName || ''),
      teamName: team?.teamName || '',
      division,
      wins: roster.settings.wins,
      losses: roster.settings.losses,
      ties: roster.settings.ties || 0,
      fpts,
      fptsAgainst,
      winPct: getWinPercentage(roster.settings.wins, roster.settings.losses, roster.settings.ties || 0),
      diff: fpts - fptsAgainst,
    };
  });

  // Sort overall by wins, then points
  const overallStandings = [...standings].sort((a, b) => b.wins - a.wins || b.fpts - a.fpts);

  // Division standings
  const divisionStandings: Record<number, typeof standings> = {};
  for (const team of standings) {
    if (!divisionStandings[team.division]) divisionStandings[team.division] = [];
    divisionStandings[team.division].push(team);
  }
  for (const div of Object.values(divisionStandings)) {
    div.sort((a, b) => b.wins - a.wins || b.fpts - a.fpts);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Standings" subtitle="2025 Season Final Standings" />

      {/* Overall Standings */}
      <div className="glass-card overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-border/30">
          <h2 className="text-xl font-bold">Overall Standings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Division</th>
                <th>W</th>
                <th>L</th>
                <th>Win %</th>
                <th>PF</th>
                <th>PA</th>
                <th>Diff</th>
              </tr>
            </thead>
            <tbody>
              {overallStandings.map((team, i) => {
                const manager = MANAGER_INFO[team.ownerId];
                const isChampion = team.rosterId === 9;
                const isPlayoff = i < 6;
                return (
                  <tr key={team.rosterId} className={isChampion ? 'bg-gold/5' : ''}>
                    <td className="font-bold text-text-muted">
                      {i + 1}
                      {isChampion && ' 🏆'}
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={manager?.photo || '/managers/question.jpg'}
                          alt={team.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium">{team.name}</div>
                          <div className="text-text-muted text-xs">{team.teamName}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: DIVISION_COLORS[team.division] + '20', color: DIVISION_COLORS[team.division] }}>
                        {DIVISIONS[team.division]}
                      </span>
                    </td>
                    <td className="font-bold text-success">{team.wins}</td>
                    <td className="font-bold text-danger">{team.losses}</td>
                    <td className="text-text-secondary">{(team.winPct * 100).toFixed(0)}%</td>
                    <td className="font-mono">{formatPoints(team.fpts)}</td>
                    <td className="font-mono text-text-secondary">{formatPoints(team.fptsAgainst)}</td>
                    <td className={`font-mono font-bold ${team.diff > 0 ? 'text-success' : 'text-danger'}`}>
                      {team.diff > 0 ? '+' : ''}{formatPoints(team.diff)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-surface/50 text-text-muted text-sm">
          Top 6 teams qualified for playoffs &middot; Division winners get top 3 seeds
        </div>
      </div>

      {/* Division Standings */}
      <h2 className="text-xl font-bold mb-4">Division Standings</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((divNum) => (
          <div key={divNum} className="glass-card overflow-hidden">
            <div className="px-4 py-3 font-bold uppercase tracking-wider text-sm" style={{ backgroundColor: DIVISION_COLORS[divNum] + '20', color: DIVISION_COLORS[divNum], borderBottom: `2px solid ${DIVISION_COLORS[divNum]}` }}>
              {DIVISIONS[divNum]}
            </div>
            <div className="divide-y divide-border/20">
              {(divisionStandings[divNum] || []).map((team, i) => (
                <div key={team.rosterId} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-text-muted font-bold w-4">{i + 1}</span>
                    <div>
                      <div className="font-medium text-sm">{team.name}</div>
                      <div className="text-text-muted text-xs">{team.teamName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm">{formatRecord(team.wins, team.losses, team.ties)}</div>
                    <div className="text-text-muted text-xs">{formatPoints(team.fpts)} PF</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Points Comparison */}
      <div className="glass-card p-6 mt-8">
        <h2 className="text-xl font-bold mb-4">Points Scored Comparison</h2>
        <div className="space-y-3">
          {overallStandings.map((team) => {
            const maxPts = Math.max(...overallStandings.map(t => t.fpts));
            const pct = (team.fpts / maxPts) * 100;
            return (
              <div key={team.rosterId} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium truncate">{team.name}</div>
                <div className="flex-1 bg-navy rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold flex items-center justify-end pr-2"
                    style={{ width: `${pct}%` }}
                  >
                    <span className="text-navy text-xs font-bold">{formatPoints(team.fpts)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
