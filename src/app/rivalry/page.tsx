import type { Metadata } from 'next';
import { buildTeamMap, pairMatchups, getAllTimeDataWithMatchups } from '@/lib/sleeper';
import { ALL_LEAGUE_IDS, REGULAR_SEASON_WEEKS, MANAGER_INFO } from '@/lib/constants';
import { getManagerDisplayName } from '@/lib/utils';
import { getWinnerLoser, isPlayedWeek } from '@/lib/matchups';
import { ESPN_HISTORY, espnTeamInfoMap } from '@/lib/espn-adapter';
import PageHeader from '@/components/ui/PageHeader';
import RivalryTool from '@/components/RivalryTool';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Rivalry',
  description: 'All-time head-to-head records between any two managers, with game-by-game history.',
};

export default async function RivalryPage() {
  const seasons = await getAllTimeDataWithMatchups(ALL_LEAGUE_IDS, REGULAR_SEASON_WEEKS);

  const latestSeason = seasons[seasons.length - 1];
  if (!latestSeason) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <PageHeader title="Rivalry" subtitle="All-Time Head-to-Head Records" />
        <div className="glass-card p-8 text-center text-text-muted">
          League data is temporarily unavailable — try again in a minute.
        </div>
      </div>
    );
  }
  const teamMap = buildTeamMap(latestSeason.rosters, latestSeason.users);

  const ownerSet = new Set<string>();
  const teamList: Array<{ ownerId: string; name: string; teamName: string; photo: string }> = [];
  for (const roster of latestSeason.rosters) {
    if (ownerSet.has(roster.owner_id)) continue;
    ownerSet.add(roster.owner_id);
    const team = teamMap.get(roster.roster_id);
    const manager = MANAGER_INFO[roster.owner_id];
    teamList.push({
      ownerId: roster.owner_id,
      name: getManagerDisplayName(roster.owner_id, team?.displayName || ''),
      teamName: team?.teamName || '',
      photo: manager?.photo || '/managers/question.jpg',
    });
  }
  teamList.sort((a, b) => a.name.localeCompare(b.name));

  const h2hRecords: Record<string, { wins: number; losses: number; totalPF: number; totalPA: number; games: Array<{ season: string; week: number; pts: number; oppPts: number }> }> = {};

  for (const seasonData of seasons) {
    const rosterOwnerMap = new Map<number, string>(seasonData.rosters.map((r) => [r.roster_id, r.owner_id]));

    for (const [weekStr, matchups] of Object.entries(seasonData.allMatchups)) {
      const week = parseInt(weekStr);
      if (!isPlayedWeek(matchups)) continue;
      for (const { team1, team2 } of pairMatchups(matchups)) {
        const owner1 = rosterOwnerMap.get(team1.roster_id);
        const owner2 = rosterOwnerMap.get(team2.roster_id);
        if (!owner1 || !owner2) continue;

        const key1 = `${owner1}-${owner2}`;
        const key2 = `${owner2}-${owner1}`;
        const rec1 = (h2hRecords[key1] ??= { wins: 0, losses: 0, totalPF: 0, totalPA: 0, games: [] });
        const rec2 = (h2hRecords[key2] ??= { wins: 0, losses: 0, totalPF: 0, totalPA: 0, games: [] });

        rec1.totalPF += team1.points;
        rec1.totalPA += team2.points;
        rec1.games.push({ season: seasonData.season, week, pts: team1.points, oppPts: team2.points });

        rec2.totalPF += team2.points;
        rec2.totalPA += team1.points;
        rec2.games.push({ season: seasonData.season, week, pts: team2.points, oppPts: team1.points });

        const { winner, isTie } = getWinnerLoser(team1, team2);
        if (isTie) continue;
        if (winner === team1) { rec1.wins++; rec2.losses++; }
        else { rec2.wins++; rec1.losses++; }
      }
    }
  }

  // ESPN era (2020-21): fold continuing members' games into all-time H2H.
  // Games involving a departed member (no Sleeper identity) are skipped —
  // that member is never selectable in the tool anyway.
  for (const [seasonYear, espn] of Object.entries(ESPN_HISTORY)) {
    const infoMap = espnTeamInfoMap(espn);
    for (const m of espn.matchups) {
      const home = infoMap.get(m.homeTeamId);
      const away = infoMap.get(m.awayTeamId);
      if (!home?.ownerId || !away?.ownerId) continue;
      // 2020 Bill-vs-Grayson games collapse to the same merged identity —
      // a self-rivalry makes no sense, skip them
      if (home.ownerId === away.ownerId) continue;

      const key1 = `${home.ownerId}-${away.ownerId}`;
      const key2 = `${away.ownerId}-${home.ownerId}`;
      const rec1 = (h2hRecords[key1] ??= { wins: 0, losses: 0, totalPF: 0, totalPA: 0, games: [] });
      const rec2 = (h2hRecords[key2] ??= { wins: 0, losses: 0, totalPF: 0, totalPA: 0, games: [] });

      rec1.totalPF += m.homePts;
      rec1.totalPA += m.awayPts;
      rec1.games.push({ season: seasonYear, week: m.week, pts: m.homePts, oppPts: m.awayPts });

      rec2.totalPF += m.awayPts;
      rec2.totalPA += m.homePts;
      rec2.games.push({ season: seasonYear, week: m.week, pts: m.awayPts, oppPts: m.homePts });

      if (m.homePts === m.awayPts) continue;
      if (m.homePts > m.awayPts) { rec1.wins++; rec2.losses++; }
      else { rec2.wins++; rec1.losses++; }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader
        title="Rivalry"
        subtitle={`All-Time Head-to-Head Records (2020-${seasons[seasons.length - 1]?.season}) · ESPN era included`}
      />
      <RivalryTool teams={teamList} h2hRecords={h2hRecords} />
    </div>
  );
}
