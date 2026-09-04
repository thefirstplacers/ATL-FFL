import type { Metadata } from 'next';
import { buildTeamMap, pairMatchups, getAllTimeDataWithMatchups } from '@/lib/sleeper';
import { ALL_LEAGUE_IDS, REGULAR_SEASON_WEEKS, MANAGER_INFO } from '@/lib/constants';
import { getManagerDisplayName } from '@/lib/utils';
import { getWinnerLoser } from '@/lib/matchups';
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

export default async function RecordsPage() {
  const seasons = await getAllTimeDataWithMatchups(ALL_LEAGUE_IDS, REGULAR_SEASON_WEEKS);

  const seasonRecords: Record<string, {
    topScores: RecordEntry[];
    bottomScores: RecordEntry[];
    biggestBlowouts: BlowoutEntry[];
    closestGames: BlowoutEntry[];
    seasonLeaders: SeasonLeader[];
  }> = {};

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

    seasonRecords[seasonData.season] = {
      topScores: [...weeklyScores].sort((a, b) => b.points - a.points).slice(0, 10),
      bottomScores: [...weeklyScores].filter((s) => s.points > 0).sort((a, b) => a.points - b.points).slice(0, 10),
      biggestBlowouts: [...blowouts].sort((a, b) => b.margin - a.margin).slice(0, 10),
      closestGames: [...blowouts].filter((g) => g.margin > 0).sort((a, b) => a.margin - b.margin).slice(0, 10),
      seasonLeaders,
    };
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Records & Awards" subtitle="Season Records Across All Years" />
      <RecordsSeasonView seasonRecords={seasonRecords} />
    </div>
  );
}
