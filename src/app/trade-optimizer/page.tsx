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
  const { analyses, positionStats } = buildOptimizerInput(
    rosters,
    users,
    allMatchups,
    playerMap,
    league.roster_positions,
  );

  // Serializable snapshot for the client
  const positionContext = Array.from(positionStats.values()).map((s) => ({
    position: s.position,
    replacementPPG: Math.round(s.replacementPPG * 10) / 10,
    stdDev: Math.round(s.stdDevVORP * 10) / 10,
    topPPG: s.ppgList[0] ?? 0,
  }));

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
      <div className="glass-card p-5 mb-6 text-text-secondary text-sm space-y-3">
        <div>
          <strong className="text-gold">Valuation method (VBD + z-score):</strong>{' '}
          Each player&apos;s value is their PPG minus the league&apos;s <em>replacement-level</em> PPG at that
          position — a.k.a. Value Over Replacement Player (VORP). 15 PPG at QB (near replacement) scores
          very differently than 15 PPG at TE (elite tier). Values are then divided by position standard
          deviation (z-score) so a +1σ asset at every position is comparable, with a PPR-weighted
          premium for TE and RB where scarcity is most extreme.
        </div>
        <div className="flex flex-wrap gap-3 pt-2 border-t border-border/30">
          <strong className="text-gold text-xs uppercase tracking-wider w-full sm:w-auto">Replacement PPG:</strong>
          {positionContext
            .filter((p) => ['QB', 'RB', 'WR', 'TE'].includes(p.position))
            .sort((a, b) => ['QB', 'RB', 'WR', 'TE'].indexOf(a.position) - ['QB', 'RB', 'WR', 'TE'].indexOf(b.position))
            .map((p) => (
              <span key={p.position} className="inline-flex items-center gap-2 bg-navy rounded-lg px-3 py-1 text-xs">
                <span className="font-bold text-gold">{p.position}</span>
                <span className="text-text-secondary">{p.replacementPPG} PPG</span>
                <span className="text-text-muted">(σ={p.stdDev})</span>
              </span>
            ))}
        </div>
      </div>
      <TradeOptimizerClient teams={analyses} leagueAverages={leagueAverages} isOffseason={isOffseason} />
    </div>
  );
}

function average(analyses: Array<{ positionGrades: Record<string, number> }>, pos: string): number {
  if (analyses.length === 0) return 0;
  return analyses.reduce((s, a) => s + (a.positionGrades[pos] || 0), 0) / analyses.length;
}
