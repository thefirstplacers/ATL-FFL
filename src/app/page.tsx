import Link from 'next/link';
import { getRosters, getUsers, getAllMatchups, buildTeamMap, pairMatchups } from '@/lib/sleeper';
import { PREV_LEAGUE_ID, LEAGUE_NAME, LEAGUE_EST, LEAGUE_HISTORY, DIVISIONS, DIVISION_COLORS, DRAFT_DATE, REGULAR_SEASON_WEEKS, MANAGER_INFO } from '@/lib/constants';
import { getManagerDisplayName, formatPoints, formatRecord } from '@/lib/utils';
import { getWinnerLoser } from '@/lib/matchups';
import CountdownTimer from '@/components/CountdownTimer';

export const revalidate = 3600;

export default async function HomePage() {
  const [rosters, users, allMatchups] = await Promise.all([
    getRosters(PREV_LEAGUE_ID),
    getUsers(PREV_LEAGUE_ID),
    getAllMatchups(PREV_LEAGUE_ID, REGULAR_SEASON_WEEKS),
  ]);

  const teamMap = buildTeamMap(rosters, users);

  const championRosterId = Object.values(LEAGUE_HISTORY).find((h) => h.season === 2025)?.championRosterId;
  const championRoster = rosters.find((r) => r.roster_id === championRosterId);
  const championInfo = championRoster ? teamMap.get(championRoster.roster_id) : null;
  const championManager = championRoster ? MANAGER_INFO[championRoster.owner_id] : null;

  const fptsOf = (r: typeof rosters[number]) =>
    (r.settings.fpts || 0) + ((r.settings.fpts_decimal || 0) / 100);

  const sortedByPoints = [...rosters].sort((a, b) => fptsOf(b) - fptsOf(a));
  const topScorer = sortedByPoints[0];
  const topScorerTeam = teamMap.get(topScorer.roster_id);

  const sortedByWins = [...rosters].sort((a, b) => b.settings.wins - a.settings.wins || fptsOf(b) - fptsOf(a));
  const bestRecord = sortedByWins[0];
  const bestRecordTeam = teamMap.get(bestRecord.roster_id);

  let highestWeekScore = { rosterId: 0, week: 0, points: 0 };
  let biggestBlowout = { week: 0, margin: 0, winnerId: 0, loserId: 0, winnerPts: 0, loserPts: 0 };
  let closestGame = { week: 0, margin: Infinity, team1Id: 0, team2Id: 0, team1Pts: 0, team2Pts: 0 };

  for (const [weekStr, matchups] of Object.entries(allMatchups)) {
    const week = parseInt(weekStr);
    for (const m of matchups) {
      if (m.points > highestWeekScore.points) {
        highestWeekScore = { rosterId: m.roster_id, week, points: m.points };
      }
    }
    for (const { team1, team2 } of pairMatchups(matchups)) {
      const { winner, loser, margin, isTie } = getWinnerLoser(team1, team2);
      if (isTie) continue;
      if (margin > biggestBlowout.margin) {
        biggestBlowout = { week, margin, winnerId: winner.roster_id, loserId: loser.roster_id, winnerPts: winner.points, loserPts: loser.points };
      }
      if (margin < closestGame.margin && margin > 0) {
        closestGame = { week, margin, team1Id: team1.roster_id, team2Id: team2.roster_id, team1Pts: team1.points, team2Pts: team2.points };
      }
    }
  }

  const divisionTeams: Record<number, Array<{ rosterId: number; name: string; teamName: string; wins: number; losses: number }>> = {};
  for (const roster of rosters) {
    const div = (roster.settings as Record<string, number>).division || 1;
    if (!divisionTeams[div]) divisionTeams[div] = [];
    const team = teamMap.get(roster.roster_id);
    divisionTeams[div].push({
      rosterId: roster.roster_id,
      name: getManagerDisplayName(roster.owner_id, team?.displayName || ''),
      teamName: team?.teamName || '',
      wins: roster.settings.wins,
      losses: roster.settings.losses,
    });
  }
  for (const div of Object.values(divisionTeams)) div.sort((a, b) => b.wins - a.wins);

  const championHistoryEntries = Object.values(LEAGUE_HISTORY).sort((a, b) => b.season - a.season);
  const currentSeason = new Date().getFullYear();
  const yearsActive = currentSeason - LEAGUE_EST + 1;

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-light to-navy py-16 md:py-24">
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gold rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-info rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block mb-4 px-4 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm font-medium">
            Season {yearsActive} &middot; Est. {LEAGUE_EST}
          </div>
          <h1 className="text-5xl md:text-7xl font-black mb-4">
            <span className="gradient-text">{LEAGUE_NAME}</span>
          </h1>
          <p className="text-text-secondary text-xl mb-8 max-w-2xl mx-auto">
            12 Teams &middot; 3 Divisions &middot; 1 Champion
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/standings" className="px-6 py-3 bg-gold hover:bg-gold-light text-navy font-bold rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy">
              View Standings
            </Link>
            <Link href="/matchups" className="px-6 py-3 bg-surface hover:bg-surface-hover border border-border rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy">
              Matchup History
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="glass-card animate-pulse-gold p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-3xl shrink-0" aria-hidden="true">
            🏆
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="text-gold text-sm font-semibold uppercase tracking-wider">2025 League Champion</div>
            <h2 className="text-2xl md:text-3xl font-bold mt-1">
              {championManager?.name}{championManager?.coManagerName ? ` & ${championManager.coManagerName}` : ''}
              <span className="text-text-secondary font-normal ml-2">&quot;{championInfo?.teamName}&quot;</span>
            </h2>
            <p className="text-text-secondary mt-1">
              {formatRecord(championRoster?.settings.wins || 0, championRoster?.settings.losses || 0, 0)} Regular Season &middot;{' '}
              {formatPoints(fptsOf(championRoster!))} Total Points
            </p>
          </div>
          <Link href="/matchups" className="px-4 py-2 bg-gold/10 border border-gold/30 text-gold rounded-lg hover:bg-gold/20 transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-gold">
            View Playoff Run →
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/30">
            <h2 className="text-xl font-bold">Championship History</h2>
            <p className="text-text-muted text-sm">League est. {LEAGUE_EST} (ESPN) &middot; Moved to Sleeper in 2022</p>
          </div>
          <div className="divide-y divide-border/20">
            {championHistoryEntries.map((entry) => (
              <div key={entry.season} className="px-6 py-3 flex items-center gap-4">
                <span className="text-gold font-bold w-12">{entry.season}</span>
                <span className="text-lg" aria-hidden="true">🏆</span>
                <div className="flex-1">
                  <span className="font-medium">{entry.champion}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 bg-surface/50 text-text-muted text-xs">
            Pre-2022 seasons were played on ESPN and data is not available in Sleeper API
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="glass-card p-6 text-center">
          <h3 className="text-gold font-semibold uppercase tracking-wider text-sm mb-3">Next Draft Countdown</h3>
          <CountdownTimer targetDate={DRAFT_DATE} />
          <p className="text-text-muted mt-3 text-sm">Keeper deadline approaching &middot; 1 keeper per team</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-8">
        <h2 className="text-2xl font-bold mb-6">2025 Season Highlights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-5">
            <div className="text-text-muted text-sm mb-1">🏆 Top Scorer</div>
            <div className="text-xl font-bold">{getManagerDisplayName(topScorer.owner_id, topScorerTeam?.displayName || '')}</div>
            <div className="text-gold font-semibold">{formatPoints(fptsOf(topScorer))} pts</div>
          </div>
          <div className="glass-card p-5">
            <div className="text-text-muted text-sm mb-1">🔥 Best Record</div>
            <div className="text-xl font-bold">{getManagerDisplayName(bestRecord.owner_id, bestRecordTeam?.displayName || '')}</div>
            <div className="text-gold font-semibold">{formatRecord(bestRecord.settings.wins, bestRecord.settings.losses, 0)}</div>
          </div>
          <div className="glass-card p-5">
            <div className="text-text-muted text-sm mb-1">💥 Highest Week</div>
            <div className="text-xl font-bold">{getManagerDisplayName(
              rosters.find((r) => r.roster_id === highestWeekScore.rosterId)?.owner_id || '',
              teamMap.get(highestWeekScore.rosterId)?.displayName || '',
            )}</div>
            <div className="text-gold font-semibold">{formatPoints(highestWeekScore.points)} (Wk {highestWeekScore.week})</div>
          </div>
          <div className="glass-card p-5">
            <div className="text-text-muted text-sm mb-1">🤏 Closest Game</div>
            <div className="text-sm font-bold">
              {teamMap.get(closestGame.team1Id)?.teamName} vs {teamMap.get(closestGame.team2Id)?.teamName}
            </div>
            <div className="text-gold font-semibold">
              {formatPoints(closestGame.team1Pts)} - {formatPoints(closestGame.team2Pts)} (Wk {closestGame.week})
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mt-8 mb-12">
        <h2 className="text-2xl font-bold mb-6">Divisions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((divNum) => (
            <div key={divNum} className="glass-card overflow-hidden">
              <div className="px-5 py-3 font-bold text-sm uppercase tracking-wider" style={{ backgroundColor: DIVISION_COLORS[divNum] + '33', color: '#fff', borderBottom: `2px solid ${DIVISION_COLORS[divNum]}` }}>
                {DIVISIONS[divNum]}
              </div>
              <div className="p-4 space-y-3">
                {(divisionTeams[divNum] || []).map((team, i) => (
                  <div key={team.rosterId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted text-sm w-4">{i + 1}.</span>
                      <div>
                        <div className="font-medium text-sm">{team.name}</div>
                        <div className="text-text-muted text-xs">{team.teamName}</div>
                      </div>
                    </div>
                    <span className="text-text-secondary text-sm font-mono">{team.wins}-{team.losses}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/trade-optimizer', label: 'Trade Optimizer', icon: '🔀', desc: 'Find your best trade targets' },
            { href: '/players', label: 'Player Pool', icon: '🏈', desc: 'Browse all players' },
            { href: '/news', label: 'Latest News', icon: '📰', desc: 'NFL & Fantasy updates' },
            { href: '/rivalry', label: 'Rivalry', icon: '⚔️', desc: 'Head-to-head battles' },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="glass-card p-5 text-center hover:scale-[1.02] transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy">
              <div className="text-3xl mb-2" aria-hidden="true">{item.icon}</div>
              <div className="font-bold text-sm">{item.label}</div>
              <div className="text-text-muted text-xs mt-1">{item.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
