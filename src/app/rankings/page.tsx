import { getRosters, getUsers, getAllMatchups, buildTeamMap, pairMatchups } from '@/lib/sleeper';
import { PREV_LEAGUE_ID, REGULAR_SEASON_WEEKS, MANAGER_INFO } from '@/lib/constants';
import { getManagerDisplayName, formatPoints } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';

export const revalidate = 3600;

export default async function RankingsPage() {
  const [rosters, users, allMatchups] = await Promise.all([
    getRosters(PREV_LEAGUE_ID),
    getUsers(PREV_LEAGUE_ID),
    getAllMatchups(PREV_LEAGUE_ID, REGULAR_SEASON_WEEKS),
  ]);

  const teamMap = buildTeamMap(rosters, users);

  // Calculate power rankings
  // Factors: Win%, Points For (normalized), Points Against (inverted/normalized), Consistency, Recent Form
  const maxPF = Math.max(...rosters.map(r => (r.settings.fpts || 0) + ((r.settings.fpts_decimal || 0) / 100)));
  const minPF = Math.min(...rosters.map(r => (r.settings.fpts || 0) + ((r.settings.fpts_decimal || 0) / 100)));
  const maxPA = Math.max(...rosters.map(r => (r.settings.fpts_against || 0) + ((r.settings.fpts_against_decimal || 0) / 100)));
  const minPA = Math.min(...rosters.map(r => (r.settings.fpts_against || 0) + ((r.settings.fpts_against_decimal || 0) / 100)));

  // Weekly scores for consistency calc
  const weeklyScoresByRoster: Record<number, number[]> = {};
  for (const [, matchups] of Object.entries(allMatchups)) {
    for (const m of matchups) {
      if (!weeklyScoresByRoster[m.roster_id]) weeklyScoresByRoster[m.roster_id] = [];
      weeklyScoresByRoster[m.roster_id].push(m.points);
    }
  }

  const rankings = rosters.map((roster) => {
    const team = teamMap.get(roster.roster_id);
    const manager = MANAGER_INFO[roster.owner_id];
    const fpts = (roster.settings.fpts || 0) + ((roster.settings.fpts_decimal || 0) / 100);
    const fptsAgainst = (roster.settings.fpts_against || 0) + ((roster.settings.fpts_against_decimal || 0) / 100);
    const totalGames = roster.settings.wins + roster.settings.losses;

    // Win percentage (30% weight)
    const winPct = totalGames > 0 ? roster.settings.wins / totalGames : 0;

    // Points normalized (25% weight)
    const ptsNorm = maxPF !== minPF ? (fpts - minPF) / (maxPF - minPF) : 0.5;

    // Schedule difficulty - PA normalized (15% weight, higher PA = harder schedule)
    const schedNorm = maxPA !== minPA ? (fptsAgainst - minPA) / (maxPA - minPA) : 0.5;

    // Consistency - lower std dev is better (15% weight)
    const scores = weeklyScoresByRoster[roster.roster_id] || [];
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const stdDev = scores.length > 0
      ? Math.sqrt(scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / scores.length)
      : 0;
    const maxStdDev = 30; // rough max
    const consistencyNorm = 1 - Math.min(stdDev / maxStdDev, 1);

    // Recent form - last 4 weeks (15% weight)
    const last4 = scores.slice(-4);
    const last4Avg = last4.length > 0 ? last4.reduce((a, b) => a + b, 0) / last4.length : 0;
    const recentNorm = maxPF > 0 ? (last4Avg / (maxPF / REGULAR_SEASON_WEEKS * 1.2)) : 0;

    const powerScore = (
      winPct * 30 +
      ptsNorm * 25 +
      schedNorm * 15 +
      consistencyNorm * 15 +
      Math.min(recentNorm, 1) * 15
    );

    return {
      rosterId: roster.roster_id,
      ownerId: roster.owner_id,
      name: getManagerDisplayName(roster.owner_id, team?.displayName || ''),
      teamName: team?.teamName || '',
      photo: manager?.photo || '/managers/question.jpg',
      wins: roster.settings.wins,
      losses: roster.settings.losses,
      fpts,
      fptsAgainst,
      powerScore,
      winPct: (winPct * 100),
      ptsScore: (ptsNorm * 100),
      schedScore: (schedNorm * 100),
      consistScore: (consistencyNorm * 100),
      recentScore: (Math.min(recentNorm, 1) * 100),
      avg,
      stdDev,
    };
  }).sort((a, b) => b.powerScore - a.powerScore);

  const maxPower = rankings[0]?.powerScore || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Power Rankings" subtitle="2025 Season - Algorithm-Based Rankings" />

      <div className="glass-card p-4 mb-6 text-text-secondary text-sm">
        <strong className="text-gold">Methodology:</strong> Win% (30%) + Points Scored (25%) + Schedule Difficulty (15%) + Consistency (15%) + Recent Form (15%)
      </div>

      <div className="space-y-4">
        {rankings.map((team, i) => {
          const barWidth = (team.powerScore / maxPower) * 100;
          return (
            <div key={team.rosterId} className="glass-card p-5">
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                  i === 0 ? 'bg-gold text-navy' :
                  i === 1 ? 'bg-gray-300 text-navy' :
                  i === 2 ? 'bg-amber-700 text-white' :
                  'bg-navy-lighter text-text-muted'
                }`}>
                  {i + 1}
                </div>
                <img src={team.photo} alt={team.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{team.name}</h3>
                  <p className="text-text-muted text-sm">{team.teamName} &middot; {team.wins}-{team.losses}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-gold">{team.powerScore.toFixed(1)}</div>
                  <div className="text-text-muted text-xs">Power Score</div>
                </div>
              </div>

              {/* Power bar */}
              <div className="w-full bg-navy rounded-full h-3 mb-3">
                <div className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold transition-all" style={{ width: `${barWidth}%` }} />
              </div>

              {/* Stat breakdown */}
              <div className="grid grid-cols-5 gap-3 text-center">
                {[
                  { label: 'Win%', value: team.winPct.toFixed(0), color: 'text-success' },
                  { label: 'Scoring', value: team.ptsScore.toFixed(0), color: 'text-gold' },
                  { label: 'Schedule', value: team.schedScore.toFixed(0), color: 'text-info' },
                  { label: 'Consistency', value: team.consistScore.toFixed(0), color: 'text-purple-400' },
                  { label: 'Recent', value: team.recentScore.toFixed(0), color: 'text-orange-400' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-text-muted text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
