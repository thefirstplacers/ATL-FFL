import type { Metadata } from 'next';
import { buildTeamMap, getAllTimeData } from '@/lib/sleeper';
import { DIVISIONS, DIVISION_COLORS, ALL_LEAGUE_IDS, LEAGUE_HISTORY, MANAGER_INFO } from '@/lib/constants';
import { getManagerDisplayName, getWinPercentage, warnUnknownOwner } from '@/lib/utils';
import { ESPN_HISTORY, espnTeamInfoMap } from '@/lib/espn-adapter';
import PageHeader from '@/components/ui/PageHeader';
import StandingsSeasonView from '@/components/StandingsSeasonView';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Standings',
  description: 'Season and all-time standings for the ATL Fantasy Football League, with division breakdowns and championship history.',
};

export interface StandingsTeam {
  rosterId: number;
  ownerId: string;
  name: string;
  teamName: string;
  photo: string;
  division: number;
  wins: number;
  losses: number;
  ties: number;
  fpts: number;
  fptsAgainst: number;
  winPct: number;
  diff: number;
  isChampion: boolean;
}

export default async function StandingsPage() {
  const allTimeData = await getAllTimeData(ALL_LEAGUE_IDS);

  const seasonStandings: Record<string, StandingsTeam[]> = {};

  for (const seasonData of allTimeData) {
    const teamMap = buildTeamMap(seasonData.rosters, seasonData.users);
    const champInfo = Object.values(LEAGUE_HISTORY).find((h) => h.id === seasonData.leagueId);

    seasonStandings[seasonData.season] = seasonData.rosters
      .map((roster) => {
        const team = teamMap.get(roster.roster_id);
        const manager = MANAGER_INFO[roster.owner_id];
        warnUnknownOwner(roster.owner_id, team?.displayName);
        const fpts = (roster.settings.fpts || 0) + ((roster.settings.fpts_decimal || 0) / 100);
        const fptsAgainst =
          (roster.settings.fpts_against || 0) + ((roster.settings.fpts_against_decimal || 0) / 100);
        const division = (roster.settings as Record<string, number>).division || 1;
        return {
          rosterId: roster.roster_id,
          ownerId: roster.owner_id,
          name: getManagerDisplayName(roster.owner_id, team?.displayName || ''),
          teamName: team?.teamName || '',
          photo: manager?.photo || '/managers/question.jpg',
          division,
          wins: roster.settings.wins,
          losses: roster.settings.losses,
          ties: roster.settings.ties || 0,
          fpts,
          fptsAgainst,
          winPct: getWinPercentage(roster.settings.wins, roster.settings.losses, roster.settings.ties || 0),
          diff: fpts - fptsAgainst,
          isChampion: roster.roster_id === champInfo?.championRosterId,
        };
      })
      .sort((a, b) => b.wins - a.wins || b.fpts - a.fpts);
  }

  // ESPN era (2020-21): static final standings, no divisions.
  // division 0 tells the view to hide division UI; continuing members keep
  // their Sleeper identity (and team-page link), departed members render by name.
  for (const [season, espn] of Object.entries(ESPN_HISTORY)) {
    const infoMap = espnTeamInfoMap(espn);
    seasonStandings[season] = espn.teams.map((r) => {
      const info = infoMap.get(r.teamId)!;
      return {
        rosterId: r.finalRank,
        ownerId: info.ownerId,
        name: info.name,
        teamName: r.teamName,
        photo: info.photo,
        division: 0,
        wins: r.wins,
        losses: r.losses,
        ties: r.ties,
        fpts: r.pointsFor,
        fptsAgainst: r.pointsAgainst,
        winPct: getWinPercentage(r.wins, r.losses, r.ties),
        diff: r.pointsFor - r.pointsAgainst,
        isChampion: r.finalRank === 1,
      };
    });
  }

  const allTimeRecords: Record<string, { ownerId: string; name: string; photo: string; wins: number; losses: number; totalPF: number; seasons: number; championships: number }> = {};
  for (const seasonData of allTimeData) {
    const teamMap = buildTeamMap(seasonData.rosters, seasonData.users);
    const champRosterId = Object.values(LEAGUE_HISTORY).find((h) => h.id === seasonData.leagueId)?.championRosterId;
    for (const roster of seasonData.rosters) {
      const key = roster.owner_id;
      if (!allTimeRecords[key]) {
        const manager = MANAGER_INFO[roster.owner_id];
        allTimeRecords[key] = {
          ownerId: key,
          name: getManagerDisplayName(key, teamMap.get(roster.roster_id)?.displayName || ''),
          photo: manager?.photo || '/managers/question.jpg',
          wins: 0,
          losses: 0,
          totalPF: 0,
          seasons: 0,
          championships: 0,
        };
      }
      allTimeRecords[key].wins += roster.settings.wins;
      allTimeRecords[key].losses += roster.settings.losses;
      allTimeRecords[key].totalPF += (roster.settings.fpts || 0) + ((roster.settings.fpts_decimal || 0) / 100);
      // Don't count a season that hasn't kicked off yet toward "Seasons"
      if (roster.settings.wins + roster.settings.losses + (roster.settings.ties || 0) > 0) {
        allTimeRecords[key].seasons++;
      }
      if (roster.roster_id === champRosterId) allTimeRecords[key].championships++;
    }
  }

  // Fold the ESPN era into the all-time table: continuing members merge into
  // their Sleeper identity; ESPN-only members get their own (unlinked) rows.
  for (const espn of Object.values(ESPN_HISTORY)) {
    const infoMap = espnTeamInfoMap(espn);
    for (const t of espn.teams) {
      const info = infoMap.get(t.teamId)!;
      const key = info.ownerId || `espn:${info.name}`;
      if (!allTimeRecords[key]) {
        allTimeRecords[key] = {
          ownerId: info.ownerId,
          name: info.name,
          photo: info.photo,
          wins: 0,
          losses: 0,
          totalPF: 0,
          seasons: 0,
          championships: 0,
        };
      }
      allTimeRecords[key].wins += t.wins;
      allTimeRecords[key].losses += t.losses;
      allTimeRecords[key].totalPF += t.pointsFor;
      allTimeRecords[key].seasons++;
      if (t.finalRank === 1) allTimeRecords[key].championships++;
    }
  }

  const allTimeList = Object.values(allTimeRecords).sort((a, b) => b.wins - a.wins || b.totalPF - a.totalPF);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Standings" subtitle="Season Standings & All-Time Records" />
      <StandingsSeasonView
        seasonStandings={seasonStandings}
        allTimeRecords={allTimeList}
        divisions={DIVISIONS}
        divisionColors={DIVISION_COLORS}
      />
    </div>
  );
}
