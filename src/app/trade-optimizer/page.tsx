import type { Metadata } from 'next';
import { getLeague, getRosters, getUsers, getAllMatchups } from '@/lib/sleeper';
import { LEAGUE_ID, PREV_LEAGUE_ID, TOTAL_WEEKS } from '@/lib/constants';
import { getPlayerMap } from '@/lib/players';
import { buildOptimizerInput } from '@/lib/trades';
import PageHeader from '@/components/ui/PageHeader';
import TradeOptimizerClient from '@/components/TradeOptimizerClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Trade Target Optimizer · ATL FFL',
  description: 'Find trade targets for your team based on roster holes, positional surplus, and fair-value swaps.',
};

export default async function TradeOptimizerPage() {
  // Use current season if it has roster data (draft completed), otherwise fall
  // back to last season's finalized rosters so the optimizer is usable year-round.
  let league, rosters, users, allMatchups;
  let isOffseason = false;

  try {
    league = await getLeague(LEAGUE_ID);
    rosters = await getRosters(LEAGUE_ID);
    // If current league has no rostered players yet, fall back.
    const hasPlayers = rosters.some((r) => (r.players || []).length > 0);
    if (!hasPlayers) throw new Error('Current season has no rostered players yet');
    users = await getUsers(LEAGUE_ID);
    allMatchups = await getAllMatchups(LEAGUE_ID, TOTAL_WEEKS);
    // If no matchups have been played yet, pull points from last season.
    const hasScores = Object.values(allMatchups).some((ms) =>
      ms.some((m) => Object.keys(m.players_points || {}).length > 0),
    );
    if (!hasScores) {
      isOffseason = true;
      allMatchups = await getAllMatchups(PREV_LEAGUE_ID, TOTAL_WEEKS);
    }
  } catch {
    // Fallback: use previous season entirely
    isOffseason = true;
    [league, rosters, users, allMatchups] = await Promise.all([
      getLeague(PREV_LEAGUE_ID),
      getRosters(PREV_LEAGUE_ID),
      getUsers(PREV_LEAGUE_ID),
      getAllMatchups(PREV_LEAGUE_ID, TOTAL_WEEKS),
    ]);
  }

  const playerMap = await getPlayerMap();
  const { analyses } = buildOptimizerInput(
    rosters,
    users,
    allMatchups,
    playerMap,
    league.roster_positions,
  );

  const leagueAverages = {
    QB: average(analyses, 'QB'),
    RB: average(analyses, 'RB'),
    WR: average(analyses, 'WR'),
    TE: average(analyses, 'TE'),
    K: average(analyses, 'K'),
    DEF: average(analyses, 'DEF'),
    FLEX: average(analyses, 'FLEX'),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader
        title="Trade Target Optimizer"
        subtitle="Find trade partners whose roster holes match your surplus"
      />
      <div className="glass-card p-4 mb-6 text-text-secondary text-sm">
        <strong className="text-gold">How it works:</strong>{' '}
        Every player gets a 0-100 trade value based on PPG over replacement, positional scarcity, age curve, and injury status.
        Team grades compare each position group to the league average. Suggested trades match your surplus positions to partners&apos; needs (and vice versa), then rank by fairness + fit.
      </div>
      <TradeOptimizerClient teams={analyses} leagueAverages={leagueAverages} isOffseason={isOffseason} />
    </div>
  );
}

function average(analyses: Array<{ positionGrades: Record<string, number> }>, pos: string): number {
  if (analyses.length === 0) return 0;
  return analyses.reduce((s, a) => s + (a.positionGrades[pos] || 0), 0) / analyses.length;
}
