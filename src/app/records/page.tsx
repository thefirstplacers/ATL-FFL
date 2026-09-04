import type { Metadata } from 'next';
import { buildTeamMap, pairMatchups, getAllTimeDataWithMatchups } from '@/lib/sleeper';
import { ALL_LEAGUE_IDS, REGULAR_SEASON_WEEKS, MANAGER_INFO } from '@/lib/constants';
import { getManagerDisplayName } from '@/lib/utils';
import { getWinnerLoser } from '@/lib/matchups';
import { ESPN_HISTORY, espnTeamInfoMap } from '@/lib/espn-adapter';
import PageHeader from '@/components/ui/PageHeader';
import RecordsSeasonView from '@/components/RecordsSeasonView';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Records & Awards',
  description: 'Top single-week scores, biggest blowouts, closest games, and season leaders across every year.',
};

interface RecordEntry {
  rosterId: number;
  ownerId: string;
  name: string;
  photo: string;
  week: number;
  points: number;
  season?: string; // set on All-Time entries so the year shows
}

interface BlowoutEntry {
  week: number;
  winnerId: string;
  winnerName: string;
  loserId: string;
  loserName: string;
  winnerPts: number;
  loserPts: number;
  margin: number;
  season?: string;
}

interface SeasonLeader {
  rosterId: number;
  ownerId: string;
  name: string;
  photo: string;
  wins: number;
  losses: number;
  fpts: number;
  weeklyHighs: number;
}

interface CareerTotals {
  ownerId: string;
  name: string;
  photo: string;
  wins: number;
  losses: number;
  fpts: number;
  weeklyHighs: number;
}

export default async function RecordsPage() {
  const seasons = await getAllTimeDataWithMatchups(ALL_LEAGUE_IDS, REGULAR_SEASON_WEEKS);

  const seasonRecords: Record<string, {
    topScores: RecordEntry[];
    bottomScores: RecordEntry[];
    biggestBlowouts: BlowoutEntry[];
    closestGames: BlowoutEntry[];
    seasonLeaders: SeasonLeader[];
  }> = {};

  // Cross-era accumulators for the All-Time tab. Identity = current Sleeper
  // owner_id for continuing members; ESPN-only members key on their name.
  const allScores: RecordEntry[] = [];
  const allBlowouts: BlowoutEntry[] = [];
  const careers = new Map<string, CareerTotals>();
  const career = (ownerId: string, name: string, photo: string): CareerTotals => {
    const key = ownerId || `espn:${name}`;
    let c = careers.get(key);
    if (!c) {
      c = { ownerId, name, photo, wins: 0, losses: 0, fpts: 0, weeklyHighs: 0 };
      careers.set(key, c);
    }
    return c;
  };

  // ---- ESPN era (2020-21): static weekly data ----
  for (const [seasonYear, espn] of Object.entries(ESPN_HISTORY)) {
    const infoMap = espnTeamInfoMap(espn);
    const weeklyScores: RecordEntry[] = [];
    const blowouts: BlowoutEntry[] = [];
    const weeklyWinners: Record<number, number> = {};

    const weeks = new Map<number, typeof espn.matchups>();
    for (const m of espn.matchups) {
      const arr = weeks.get(m.week) || [];
      arr.push(m);
      weeks.set(m.week, arr);
    }
    for (const [week, games] of weeks) {
      let weekHigh = { teamId: 0, points: 0 };
      for (const g of games) {
        for (const [teamId, points] of [[g.homeTeamId, g.homePts], [g.awayTeamId, g.awayPts]] as const) {
          const info = infoMap.get(teamId);
          if (!info) continue;
          weeklyScores.push({
            rosterId: teamId,
            ownerId: info.ownerId,
            name: info.name,
            photo: info.photo,
            week,
            points,
          });
          if (points > weekHigh.points) weekHigh = { teamId, points };
        }
        const home = infoMap.get(g.homeTeamId);
        const away = infoMap.get(g.awayTeamId);
        if (!home || !away || g.homePts === g.awayPts) continue;
        const [w, l, wPts, lPts] = g.homePts > g.awayPts
          ? [home, away, g.homePts, g.awayPts]
          : [away, home, g.awayPts, g.homePts];
        blowouts.push({
          week,
          margin: Math.abs(g.homePts - g.awayPts),
          winnerId: w.ownerId,
          winnerName: w.name,
          loserId: l.ownerId,
          loserName: l.name,
          winnerPts: wPts,
          loserPts: lPts,
        });
      }
      if (weekHigh.teamId) weeklyWinners[weekHigh.teamId] = (weeklyWinners[weekHigh.teamId] || 0) + 1;
    }

    const seasonLeaders: SeasonLeader[] = espn.teams
      .map((t) => {
        const info = infoMap.get(t.teamId)!;
        return {
          rosterId: t.teamId,
          ownerId: info.ownerId,
          name: info.name,
          photo: info.photo,
          wins: t.wins,
          losses: t.losses,
          fpts: t.pointsFor,
          weeklyHighs: weeklyWinners[t.teamId] || 0,
        };
      })
      .sort((a, b) => b.fpts - a.fpts);

    for (const t of seasonLeaders) {
      const c = career(t.ownerId, t.name, t.photo);
      c.wins += t.wins;
      c.losses += t.losses;
      c.fpts += t.fpts;
      c.weeklyHighs += t.weeklyHighs;
    }
    allScores.push(...weeklyScores.map((s) => ({ ...s, season: seasonYear })));
    allBlowouts.push(...blowouts.map((b) => ({ ...b, season: seasonYear })));

    seasonRecords[seasonYear] = {
      topScores: [...weeklyScores].sort((a, b) => b.points - a.points).slice(0, 10),
      bottomScores: [...weeklyScores].filter((s) => s.points > 0).sort((a, b) => a.points - b.points).slice(0, 10),
      biggestBlowouts: [...blowouts].sort((a, b) => b.margin - a.margin).slice(0, 10),
      closestGames: [...blowouts].filter((g) => g.margin > 0).sort((a, b) => a.margin - b.margin).slice(0, 10),
      seasonLeaders,
    };
  }

  // ---- Sleeper era (2022+): live data ----
  for (const seasonData of seasons) {
    const teamMap = buildTeamMap(seasonData.rosters, seasonData.users);
    const rosterById = new Map(seasonData.rosters.map((r) => [r.roster_id, r]));

    const weeklyScores: RecordEntry[] = [];
    const blowouts: BlowoutEntry[] = [];
    const weeklyWinners: Record<number, number> = {};

    for (const [weekStr, matchups] of Object.entries(seasonData.allMatchups)) {
      const week = parseInt(weekStr);
      // Scheduled-but-unplayed weeks come back with 0 points on every roster —
      // skip them so a fresh season doesn't seed fake 0-pt records
      if (matchups.every((m) => !m.points)) continue;
      let weekHigh = { rosterId: 0, points: 0 };

      for (const m of matchups) {
        const roster = rosterById.get(m.roster_id);
        weeklyScores.push({
          rosterId: m.roster_id,
          ownerId: roster?.owner_id || '',
          name: getManagerDisplayName(roster?.owner_id || '', teamMap.get(m.roster_id)?.displayName || ''),
          photo: MANAGER_INFO[roster?.owner_id || '']?.photo || '/managers/question.jpg',
          week,
          points: m.points,
        });
        if (m.points > weekHigh.points) weekHigh = { rosterId: m.roster_id, points: m.points };
      }
      if (weekHigh.rosterId) weeklyWinners[weekHigh.rosterId] = (weeklyWinners[weekHigh.rosterId] || 0) + 1;

      for (const { team1, team2 } of pairMatchups(matchups)) {
        const { winner, loser, margin, isTie } = getWinnerLoser(team1, team2);
        if (isTie) continue;
        const wRoster = rosterById.get(winner.roster_id);
        const lRoster = rosterById.get(loser.roster_id);
        blowouts.push({
          week,
          margin,
          winnerId: wRoster?.owner_id || '',
          winnerName: getManagerDisplayName(wRoster?.owner_id || '', teamMap.get(winner.roster_id)?.displayName || ''),
          loserId: lRoster?.owner_id || '',
          loserName: getManagerDisplayName(lRoster?.owner_id || '', teamMap.get(loser.roster_id)?.displayName || ''),
          winnerPts: winner.points,
          loserPts: loser.points,
        });
      }
    }

    const seasonLeaders: SeasonLeader[] = seasonData.rosters
      .map((r) => ({
        rosterId: r.roster_id,
        ownerId: r.owner_id,
        name: getManagerDisplayName(r.owner_id, teamMap.get(r.roster_id)?.displayName || ''),
        photo: MANAGER_INFO[r.owner_id]?.photo || '/managers/question.jpg',
        wins: r.settings.wins,
        losses: r.settings.losses,
        fpts: (r.settings.fpts || 0) + ((r.settings.fpts_decimal || 0) / 100),
        weeklyHighs: weeklyWinners[r.roster_id] || 0,
      }))
      .sort((a, b) => b.fpts - a.fpts);

    for (const t of seasonLeaders) {
      const c = career(t.ownerId, t.name, t.photo);
      c.wins += t.wins;
      c.losses += t.losses;
      c.fpts += t.fpts;
      c.weeklyHighs += t.weeklyHighs;
    }
    allScores.push(...weeklyScores.map((s) => ({ ...s, season: seasonData.season })));
    allBlowouts.push(...blowouts.map((b) => ({ ...b, season: seasonData.season })));

    seasonRecords[seasonData.season] = {
      topScores: [...weeklyScores].sort((a, b) => b.points - a.points).slice(0, 10),
      bottomScores: [...weeklyScores].filter((s) => s.points > 0).sort((a, b) => a.points - b.points).slice(0, 10),
      biggestBlowouts: [...blowouts].sort((a, b) => b.margin - a.margin).slice(0, 10),
      closestGames: [...blowouts].filter((g) => g.margin > 0).sort((a, b) => a.margin - b.margin).slice(0, 10),
      seasonLeaders,
    };
  }

  // ---- All-Time tab: every era combined ----
  seasonRecords['All-Time'] = {
    topScores: [...allScores].sort((a, b) => b.points - a.points).slice(0, 10),
    bottomScores: [...allScores].filter((s) => s.points > 0).sort((a, b) => a.points - b.points).slice(0, 10),
    biggestBlowouts: [...allBlowouts].sort((a, b) => b.margin - a.margin).slice(0, 10),
    closestGames: [...allBlowouts].filter((g) => g.margin > 0).sort((a, b) => a.margin - b.margin).slice(0, 10),
    seasonLeaders: [...careers.values()]
      .map((c, i) => ({
        rosterId: i,
        ownerId: c.ownerId,
        name: c.name,
        photo: c.photo,
        wins: c.wins,
        losses: c.losses,
        fpts: Math.round(c.fpts * 100) / 100,
        weeklyHighs: c.weeklyHighs,
      }))
      .sort((a, b) => b.fpts - a.fpts),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Records & Awards" subtitle="League records — every season since 2020, ESPN era included" />
      <RecordsSeasonView seasonRecords={seasonRecords} />
    </div>
  );
}
