// Original matchup projection engine — no third-party projections.
//
// Per player: a recency-weighted points-per-game estimate computed in THIS
// league's exact scoring settings, blending current-season weekly actuals
// (exponential decay) with a prior from last season's baseline
// (src/lib/projection-baseline.json, regenerated offline), Bayesian-shrunk
// toward the positional mean for thin samples, then adjusted by the
// opponent's positional defense factor and the player's injury status.
// Matchup win probability comes from a normal model over the two teams'
// summed player variances.
import { unstable_cache } from 'next/cache';
import baselineJson from './projection-baseline.json';

interface BaselinePlayer { n: string; p: string; g: number; ppg: number; var: number }
interface Baseline {
  posMean: Record<string, number>;
  defFactor: Record<string, Record<string, number>>;
  players: Record<string, BaselinePlayer>;
}
const BASE = baselineJson as unknown as Baseline;

const DECAY = 0.88;          // per-week recency decay on current-season games
const PRIOR_MAX_WEIGHT = 4;  // last season counts as at most this many games
const SHRINK_K = 3;          // pseudo-games of positional-mean shrinkage
const ROOKIE_FACTOR = 0.55;  // no-data players start below the positional mean

function normCdf(z: number): number {
  // Abramowitz-Stegun erf approximation
  const t = 1 / (1 + 0.3275911 * Math.abs(z) / Math.SQRT2);
  const erf = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(z * z) / 2);
  return z >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

const getState = () =>
  unstable_cache(
    async () => {
      const res = await fetch('https://api.sleeper.app/v1/state/nfl', { cache: 'no-store' });
      return (await res.json()) as { week: number; season: string };
    },
    ['nfl-state'],
    { revalidate: 1800 },
  )();

// Weekly actuals are ~2MB (past the fetch-cache limit) — cache the processed
// per-player scored map instead, keyed by season/week/scoring signature.
const getWeekScores = (season: string, week: number, scoring: Record<string, number>, scoringKey: string) =>
  unstable_cache(
    async (): Promise<Record<string, number>> => {
      const res = await fetch(`https://api.sleeper.com/stats/nfl/${season}/${week}?season_type=regular`, { cache: 'no-store' });
      if (!res.ok) return {};
      const rows = (await res.json()) as Array<{ player_id: string; stats?: Record<string, number> }>;
      const out: Record<string, number> = {};
      for (const row of rows) {
        const st = row.stats;
        if (!st) continue;
        let pts = 0;
        for (const [k, v] of Object.entries(scoring)) pts += (st[k] || 0) * v;
        if (pts !== 0) out[row.player_id] = Math.round(pts * 100) / 100;
      }
      return out;
    },
    ['week-scores', season, String(week), scoringKey],
    { revalidate: 6 * 60 * 60 },
  )();

const getWeekOpponents = (season: string, week: number) =>
  unstable_cache(
    async (): Promise<Record<string, string>> => {
      const res = await fetch(`https://api.sleeper.app/schedule/nfl/regular/${season}`, { cache: 'no-store' });
      if (!res.ok) return {};
      const games = (await res.json()) as Array<{ week: number; home: string; away: string }>;
      const out: Record<string, string> = {};
      for (const g of games) {
        if (g.week !== week) continue;
        out[g.home] = g.away;
        out[g.away] = g.home;
      }
      return out;
    },
    ['week-opponents', season, String(week)],
    { revalidate: 24 * 60 * 60 },
  )();

export interface PlayerLike { position: string; team: string; injuryStatus: string | null }

export interface ProjectionEngine {
  targetWeek: number;
  proj: (pid: string, meta: PlayerLike | undefined) => number;
  sd: (pid: string, meta: PlayerLike | undefined) => number;
  winProb: (teamAProj: number, teamAVar: number, teamBProj: number, teamBVar: number) => number;
}

export async function getProjectionEngine(
  scoring: Record<string, number>,
  season: string,
): Promise<ProjectionEngine> {
  const cleanScoring: Record<string, number> = {};
  for (const [k, v] of Object.entries(scoring || {})) if (v) cleanScoring[k] = v;
  const scoringKey = Object.entries(cleanScoring).sort().map(([k, v]) => `${k}:${v}`).join('|').slice(0, 180);

  const state = await getState().catch(() => ({ week: 1, season }));
  const targetWeek = Math.max(1, state.week || 1);
  const playedWeeks = Array.from({ length: Math.max(0, targetWeek - 1) }, (_, i) => i + 1);

  const [weeklyScores, opponents] = await Promise.all([
    Promise.all(
      playedWeeks.map((w) =>
        getWeekScores(season, w, cleanScoring, scoringKey).catch((): Record<string, number> => ({})),
      ),
    ),
    getWeekOpponents(season, targetWeek).catch((): Record<string, string> => ({})),
  ]);

  const injuryMult = (status: string | null | undefined): number => {
    if (!status) return 1;
    if (['Out', 'IR', 'PUP', 'Sus', 'COV', 'NA'].includes(status)) return 0;
    if (status === 'Doubtful') return 0.25;
    if (status === 'Questionable') return 0.85;
    return 1;
  };

  const proj = (pid: string, meta: PlayerLike | undefined): number => {
    const prior = BASE.players[pid];
    const pos = meta?.position || prior?.p || 'WR';
    const posMean = BASE.posMean[pos] ?? 8;

    let wSum = 0;
    let wPts = 0;
    weeklyScores.forEach((wk, idx) => {
      const pts = wk[pid];
      if (pts === undefined) return;
      const age = playedWeeks.length - idx; // 1 = most recent
      const w = Math.pow(DECAY, age - 1);
      wSum += w;
      wPts += w * pts;
    });
    if (prior) {
      const w0 = Math.min(Math.min(prior.g, 8) * 0.5, PRIOR_MAX_WEIGHT);
      wSum += w0;
      wPts += w0 * prior.ppg;
    }

    let est: number;
    if (wSum === 0) {
      est = posMean * ROOKIE_FACTOR;
    } else {
      const blended = wPts / wSum;
      est = (wSum * blended + SHRINK_K * posMean) / (wSum + SHRINK_K);
    }

    const opp = meta?.team ? opponents[meta.team] : undefined;
    const factor = opp ? BASE.defFactor[opp]?.[pos] ?? 1 : 1;
    return Math.max(0, Math.round(est * factor * injuryMult(meta?.injuryStatus) * 10) / 10);
  };

  const sd = (pid: string, meta: PlayerLike | undefined): number => {
    const prior = BASE.players[pid];
    if (prior && prior.var > 0) return Math.sqrt(prior.var);
    const p = proj(pid, meta);
    return Math.max(3, p * 0.85);
  };

  const winProb = (aProj: number, aVar: number, bProj: number, bVar: number): number => {
    const sigma = Math.sqrt(Math.max(1, aVar + bVar));
    return normCdf((aProj - bProj) / sigma);
  };

  return { targetWeek, proj, sd, winProb };
}
