import type { Metadata } from 'next';
import { buildTeamMap, getAllTimeDataWithMatchups } from '@/lib/sleeper';
import { ALL_LEAGUE_IDS, REGULAR_SEASON_WEEKS, MANAGER_INFO } from '@/lib/constants';
import { getManagerDisplayName, getManagerPhoto } from '@/lib/utils';
import { playedWeeksOnly } from '@/lib/matchups';
import type { SleeperRoster, SleeperUser, SleeperMatchup } from '@/lib/types';
import PageHeader from '@/components/ui/PageHeader';
import RankingsSeasonView from '@/components/RankingsSeasonView';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Power Rankings',
  description: 'Algorithmic power rankings combining win %, points scored, schedule strength, consistency, and recent form.',
};

interface RankingEntry {
  rosterId: number;
  ownerId: string;
  name: string;
  teamName: string;
  photo: string;
  wins: number;
  losses: number;
  fpts: number;
  powerScore: number;
  winPct: number;
  ptsScore: number;
  schedScore: number;
  consistScore: number;
  recentScore: number;
}

// Weights sum to 100; tuned so a dominant team (high W%, high PF, consistent
// scoring) separates clearly from a lucky one (high W%, low PF, volatile).
const WEIGHT_WIN = 30;
const WEIGHT_POINTS = 25;
const WEIGHT_SCHEDULE = 15;
const WEIGHT_CONSISTENCY = 15;
const WEIGHT_RECENT = 15;

// 30 pts is ~1 standard deviation for a typical fantasy team over a season.
// Larger values mean more volatile weekly scoring — clamp to [0, 1] so elite
// consistency (sub-30 σ) maps to 1.0 and chaos (σ > 30) maps to 0.
const CONSISTENCY_STDDEV_CAP = 30;

// Recent-form normalizer: the top scorer's season-average PPG × 1.2 gives us
// a slightly-above-best benchmark, so teams scoring close to the league leader
// over the last 4 weeks score near 1.0.
const RECENT_FORM_CEILING_MULTIPLIER = 1.2;

function computeRankings(
  rosters: SleeperRoster[],
  users: SleeperUser[],
  allMatchups: Record<number, SleeperMatchup[]>,
): RankingEntry[] {
  const teamMap = buildTeamMap(rosters, users);

  const fptsOf = (r: SleeperRoster) => (r.settings.fpts || 0) + ((r.settings.fpts_decimal || 0) / 100);
  const fptsAgainstOf = (r: SleeperRoster) =>
    (r.settings.fpts_against || 0) + ((r.settings.fpts_against_decimal || 0) / 100);

  const maxPF = Math.max(...rosters.map(fptsOf));
  const minPF = Math.min(...rosters.map(fptsOf));
  const maxPA = Math.max(...rosters.map(fptsAgainstOf));
  const minPA = Math.min(...rosters.map(fptsAgainstOf));

  const weeklyScoresByRoster: Record<number, number[]> = {};
  for (const matchups of Object.values(allMatchups)) {
    for (const m of matchups) {
      (weeklyScoresByRoster[m.roster_id] ??= []).push(m.points);
    }
  }

  return rosters
    .map((roster): RankingEntry => {
      const team = teamMap.get(roster.roster_id);
      const manager = MANAGER_INFO[roster.owner_id];
      const fpts = fptsOf(roster);
      const fptsAgainst = fptsAgainstOf(roster);
      const totalGames = roster.settings.wins + roster.settings.losses;

      const winPct = totalGames > 0 ? roster.settings.wins / totalGames : 0;
      const ptsNorm = maxPF !== minPF ? (fpts - minPF) / (maxPF - minPF) : 0.5;
      const schedNorm = maxPA !== minPA ? (fptsAgainst - minPA) / (maxPA - minPA) : 0.5;

      const scores = weeklyScoresByRoster[roster.roster_id] || [];
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const stdDev =
        scores.length > 0
          ? Math.sqrt(scores.reduce((sum, s) => sum + (s - avg) ** 2, 0) / scores.length)
          : 0;
      const consistencyNorm = 1 - Math.min(stdDev / CONSISTENCY_STDDEV_CAP, 1);

      const last4 = scores.slice(-4);
      const last4Avg = last4.length > 0 ? last4.reduce((a, b) => a + b, 0) / last4.length : 0;
      const ceiling = (maxPF / REGULAR_SEASON_WEEKS) * RECENT_FORM_CEILING_MULTIPLIER;
      const recentNorm = ceiling > 0 ? Math.min(last4Avg / ceiling, 1) : 0;

      const powerScore =
        winPct * WEIGHT_WIN +
        ptsNorm * WEIGHT_POINTS +
        schedNorm * WEIGHT_SCHEDULE +
        consistencyNorm * WEIGHT_CONSISTENCY +
        recentNorm * WEIGHT_RECENT;

      return {
        rosterId: roster.roster_id,
        ownerId: roster.owner_id,
        name: getManagerDisplayName(roster.owner_id, team?.displayName || ''),
        teamName: team?.teamName || '',
        photo: manager?.photo || getManagerPhoto(roster.owner_id),
        wins: roster.settings.wins,
        losses: roster.settings.losses,
        fpts,
        powerScore,
        winPct: winPct * 100,
        ptsScore: ptsNorm * 100,
        schedScore: schedNorm * 100,
        consistScore: consistencyNorm * 100,
        recentScore: recentNorm * 100,
      };
    })
    .sort((a, b) => b.powerScore - a.powerScore);
}

export default async function RankingsPage() {
  const seasons = await getAllTimeDataWithMatchups(ALL_LEAGUE_IDS, REGULAR_SEASON_WEEKS);

  const seasonRankings: Record<string, RankingEntry[]> = {};
  for (const s of seasons) {
    // A season with no played games would rank everyone 35.0 with fake perfect
    // consistency — hold its tab back until real scores exist
    const played = playedWeeksOnly(s.allMatchups);
    if (Object.keys(played).length === 0) continue;
    seasonRankings[s.season] = computeRankings(s.rosters, s.users, played);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Power Rankings" subtitle="Algorithm-Based Rankings by Season" />
      <div className="glass-card p-4 mb-6 text-text-secondary text-sm">
        <strong className="text-gold">Methodology:</strong> Win% ({WEIGHT_WIN}%) + Points Scored ({WEIGHT_POINTS}%) + Schedule Difficulty ({WEIGHT_SCHEDULE}%) + Consistency ({WEIGHT_CONSISTENCY}%) + Recent Form ({WEIGHT_RECENT}%)
      </div>
      <RankingsSeasonView seasonRankings={seasonRankings} />
    </div>
  );
}
