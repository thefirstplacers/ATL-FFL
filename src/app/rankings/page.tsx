import type { Metadata } from 'next';
import { buildTeamMap, getAllTimeDataWithMatchups } from '@/lib/sleeper';
import { ALL_LEAGUE_IDS, REGULAR_SEASON_WEEKS, MANAGER_INFO, LEAGUE_HISTORY } from '@/lib/constants';
import { getManagerDisplayName, getManagerPhoto } from '@/lib/utils';
import { playedWeeksOnly } from '@/lib/matchups';
import { ESPN_HISTORY, espnTeamInfoMap, espnWeeklyScoresByTeam } from '@/lib/espn-adapter';
import PageHeader from '@/components/ui/PageHeader';
import RankingsSeasonView from '@/components/RankingsSeasonView';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Power Rankings',
  description: 'Algorithmic power rankings combining win %, points scored, schedule strength, consistency, and recent form — plus all-time career rankings.',
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

// One team-season, era-agnostic — the scorer never learns the platform
interface TeamSeasonInput {
  rosterId: number;
  ownerId: string;
  name: string;
  teamName: string;
  photo: string;
  wins: number;
  losses: number;
  fpts: number;
  fptsAgainst: number;
  weeklyScores: number[];
}

// Weights sum to 100; tuned so a dominant team (high W%, high PF, consistent
// scoring) separates clearly from a lucky one (high W%, low PF, volatile).
const WEIGHT_WIN = 30;
const WEIGHT_POINTS = 25;
const WEIGHT_SCHEDULE = 15;
const WEIGHT_CONSISTENCY = 15;
const WEIGHT_RECENT = 15;

// 30 pts is ~1 standard deviation for a typical fantasy team over a season.
const CONSISTENCY_STDDEV_CAP = 30;
// Recent-form ceiling: top season-average PPG × 1.2.
const RECENT_FORM_CEILING_MULTIPLIER = 1.2;

function scoreSeason(teams: TeamSeasonInput[], regularSeasonWeeks: number): RankingEntry[] {
  const maxPF = Math.max(...teams.map((t) => t.fpts));
  const minPF = Math.min(...teams.map((t) => t.fpts));
  const maxPA = Math.max(...teams.map((t) => t.fptsAgainst));
  const minPA = Math.min(...teams.map((t) => t.fptsAgainst));

  return teams
    .map((t): RankingEntry => {
      const totalGames = t.wins + t.losses;
      const winPct = totalGames > 0 ? t.wins / totalGames : 0;
      const ptsNorm = maxPF !== minPF ? (t.fpts - minPF) / (maxPF - minPF) : 0.5;
      const schedNorm = maxPA !== minPA ? (t.fptsAgainst - minPA) / (maxPA - minPA) : 0.5;

      const scores = t.weeklyScores;
      const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const stdDev =
        scores.length > 0
          ? Math.sqrt(scores.reduce((sum, s) => sum + (s - avg) ** 2, 0) / scores.length)
          : 0;
      const consistencyNorm = 1 - Math.min(stdDev / CONSISTENCY_STDDEV_CAP, 1);

      const last4 = scores.slice(-4);
      const last4Avg = last4.length > 0 ? last4.reduce((a, b) => a + b, 0) / last4.length : 0;
      const ceiling = (maxPF / regularSeasonWeeks) * RECENT_FORM_CEILING_MULTIPLIER;
      const recentNorm = ceiling > 0 ? Math.min(last4Avg / ceiling, 1) : 0;

      const powerScore =
        winPct * WEIGHT_WIN +
        ptsNorm * WEIGHT_POINTS +
        schedNorm * WEIGHT_SCHEDULE +
        consistencyNorm * WEIGHT_CONSISTENCY +
        recentNorm * WEIGHT_RECENT;

      return {
        rosterId: t.rosterId,
        ownerId: t.ownerId,
        name: t.name,
        teamName: t.teamName,
        photo: t.photo,
        wins: t.wins,
        losses: t.losses,
        fpts: t.fpts,
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

// ---- All-Time career ranking ----
// Career Power Score = 30·win% + 25·avg season scoring (normalized 0-1 within
// each season so ESPN-era and Sleeper-era point scales are comparable) +
// 20·championships (capped at 3) + 15·best single season + 10·longevity.
const CAREER_WEIGHTS = { win: 30, avgPts: 25, titles: 20, peak: 15, longevity: 10 };

interface CareerAgg {
  ownerId: string;
  name: string;
  photo: string;
  wins: number;
  losses: number;
  fpts: number;
  titles: number;
  seasons: number;
  ptsNormSum: number;
  bestPtsNorm: number;
  firstSeason: number;
}

export default async function RankingsPage() {
  const seasons = await getAllTimeDataWithMatchups(ALL_LEAGUE_IDS, REGULAR_SEASON_WEEKS);

  const seasonRankings: Record<string, RankingEntry[]> = {};
  const careers = new Map<string, CareerAgg>();

  const addCareer = (
    key: string,
    seed: Omit<CareerAgg, 'wins' | 'losses' | 'fpts' | 'titles' | 'seasons' | 'ptsNormSum' | 'bestPtsNorm'>,
    seasonYear: number,
    wins: number,
    losses: number,
    fpts: number,
    ptsNorm: number,
    isChampion: boolean,
  ) => {
    let c = careers.get(key);
    if (!c) {
      c = { ...seed, wins: 0, losses: 0, fpts: 0, titles: 0, seasons: 0, ptsNormSum: 0, bestPtsNorm: 0, firstSeason: seasonYear };
      careers.set(key, c);
    }
    c.wins += wins;
    c.losses += losses;
    c.fpts += fpts;
    c.seasons += 1;
    c.ptsNormSum += ptsNorm;
    c.bestPtsNorm = Math.max(c.bestPtsNorm, ptsNorm);
    c.firstSeason = Math.min(c.firstSeason, seasonYear);
    if (isChampion) c.titles += 1;
  };

  const normWithin = (values: number[], v: number) => {
    const max = Math.max(...values);
    const min = Math.min(...values);
    return max !== min ? (v - min) / (max - min) : 0.5;
  };

  // ESPN era (2020-21)
  for (const [seasonYear, espn] of Object.entries(ESPN_HISTORY)) {
    const infoMap = espnTeamInfoMap(espn);
    const weekly = espnWeeklyScoresByTeam(espn);
    const inputs: TeamSeasonInput[] = espn.teams.map((t) => {
      const info = infoMap.get(t.teamId)!;
      return {
        rosterId: t.teamId,
        ownerId: info.ownerId,
        name: info.name,
        teamName: t.teamName,
        photo: info.photo,
        wins: t.wins,
        losses: t.losses,
        fpts: t.pointsFor,
        fptsAgainst: t.pointsAgainst,
        weeklyScores: weekly.get(t.teamId) || [],
      };
    });
    seasonRankings[seasonYear] = scoreSeason(inputs, espn.regularSeasonWeeks);

    // Group same-owner teams within the season before career aggregation
    // (2020 has Bill's and Grayson's teams both under Bill & Grayson): W/L sum,
    // the season counts once, scoring uses the owner's better team so the
    // within-season normalization stays comparable.
    const allPF = espn.teams.map((t) => t.pointsFor);
    const grouped = new Map<string, { info: NonNullable<ReturnType<typeof infoMap.get>>; wins: number; losses: number; pf: number; bestNorm: number; title: boolean }>();
    for (const t of espn.teams) {
      const info = infoMap.get(t.teamId)!;
      const key = info.ownerId || `espn:${info.name}`;
      const g = grouped.get(key) || { info, wins: 0, losses: 0, pf: 0, bestNorm: 0, title: false };
      g.wins += t.wins;
      g.losses += t.losses;
      g.pf += t.pointsFor;
      g.bestNorm = Math.max(g.bestNorm, normWithin(allPF, t.pointsFor));
      g.title = g.title || t.finalRank === 1;
      grouped.set(key, g);
    }
    for (const [key, g] of grouped) {
      addCareer(
        key,
        { ownerId: g.info.ownerId, name: g.info.name, photo: g.info.photo, firstSeason: parseInt(seasonYear) },
        parseInt(seasonYear),
        g.wins,
        g.losses,
        g.pf,
        g.bestNorm,
        g.title,
      );
    }
  }

  // Sleeper era (2022+)
  for (const s of seasons) {
    const teamMap = buildTeamMap(s.rosters, s.users);
    const played = playedWeeksOnly(s.allMatchups);
    const champInfo = Object.values(LEAGUE_HISTORY).find((h) => h.id === s.leagueId);
    const fptsOf = (r: (typeof s.rosters)[number]) => (r.settings.fpts || 0) + ((r.settings.fpts_decimal || 0) / 100);
    const fptsAgainstOf = (r: (typeof s.rosters)[number]) =>
      (r.settings.fpts_against || 0) + ((r.settings.fpts_against_decimal || 0) / 100);

    const hasGames = Object.keys(played).length > 0;
    if (hasGames) {
      const weeklyByRoster: Record<number, number[]> = {};
      for (const week of Object.keys(played).map(Number).sort((a, b) => a - b)) {
        for (const m of played[week]) (weeklyByRoster[m.roster_id] ??= []).push(m.points);
      }
      const inputs: TeamSeasonInput[] = s.rosters.map((r) => ({
        rosterId: r.roster_id,
        ownerId: r.owner_id,
        name: getManagerDisplayName(r.owner_id, teamMap.get(r.roster_id)?.displayName || ''),
        teamName: teamMap.get(r.roster_id)?.teamName || '',
        photo: MANAGER_INFO[r.owner_id]?.photo || getManagerPhoto(r.owner_id),
        wins: r.settings.wins,
        losses: r.settings.losses,
        fpts: fptsOf(r),
        fptsAgainst: fptsAgainstOf(r),
        weeklyScores: weeklyByRoster[r.roster_id] || [],
      }));
      seasonRankings[s.season] = scoreSeason(inputs, REGULAR_SEASON_WEEKS);
    }

    // Career: count only seasons with actual games (2026 joins after Week 1)
    if (hasGames) {
      const allPF = s.rosters.map(fptsOf);
      for (const r of s.rosters) {
        addCareer(
          r.owner_id,
          {
            ownerId: r.owner_id,
            name: getManagerDisplayName(r.owner_id, teamMap.get(r.roster_id)?.displayName || ''),
            photo: MANAGER_INFO[r.owner_id]?.photo || getManagerPhoto(r.owner_id),
            firstSeason: parseInt(s.season),
          },
          parseInt(s.season),
          r.settings.wins,
          r.settings.losses,
          fptsOf(r),
          normWithin(allPF, fptsOf(r)),
          r.roster_id === champInfo?.championRosterId,
        );
      }
    }
  }

  // All-Time tab
  const maxSeasons = Math.max(...[...careers.values()].map((c) => c.seasons), 1);
  seasonRankings['All-Time'] = [...careers.values()]
    .map((c, i): RankingEntry => {
      const winPct = c.wins + c.losses > 0 ? c.wins / (c.wins + c.losses) : 0;
      const avgPtsNorm = c.ptsNormSum / c.seasons;
      const titlesNorm = Math.min(c.titles, 3) / 3;
      const longevity = c.seasons / maxSeasons;
      const powerScore =
        winPct * CAREER_WEIGHTS.win +
        avgPtsNorm * CAREER_WEIGHTS.avgPts +
        titlesNorm * CAREER_WEIGHTS.titles +
        c.bestPtsNorm * CAREER_WEIGHTS.peak +
        longevity * CAREER_WEIGHTS.longevity;
      return {
        rosterId: i,
        ownerId: c.ownerId,
        name: c.name,
        teamName: `${c.seasons} season${c.seasons === 1 ? '' : 's'} · since ${c.firstSeason}${c.titles > 0 ? ` · ${'🏆'.repeat(c.titles)}` : ''}`,
        photo: c.photo,
        wins: c.wins,
        losses: c.losses,
        fpts: Math.round(c.fpts * 100) / 100,
        powerScore,
        winPct: winPct * 100,
        ptsScore: avgPtsNorm * 100,
        schedScore: c.titles,
        consistScore: c.bestPtsNorm * 100,
        recentScore: c.seasons,
      };
    })
    .sort((a, b) => b.powerScore - a.powerScore);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Power Rankings" subtitle="Algorithm-based rankings for every season — plus all-time careers" />
      <div className="glass-card p-4 mb-6 text-text-secondary text-sm space-y-1">
        <div>
          <strong className="text-gold">Season tabs:</strong> Win% ({WEIGHT_WIN}%) + Points Scored ({WEIGHT_POINTS}%) + Schedule Difficulty ({WEIGHT_SCHEDULE}%) + Consistency ({WEIGHT_CONSISTENCY}%) + Recent Form ({WEIGHT_RECENT}%)
        </div>
        <div>
          <strong className="text-gold">All-Time:</strong> Career Win% ({CAREER_WEIGHTS.win}%) + Avg Season Scoring ({CAREER_WEIGHTS.avgPts}%, normalized within each season so eras compare fairly) + Championships ({CAREER_WEIGHTS.titles}%) + Best Season ({CAREER_WEIGHTS.peak}%) + Longevity ({CAREER_WEIGHTS.longevity}%)
        </div>
      </div>
      <RankingsSeasonView
        seasonRankings={seasonRankings}
        metricLabels={{ 'All-Time': ['Win%', 'Scoring', 'Titles', 'Peak', 'Seasons'] }}
      />
    </div>
  );
}
