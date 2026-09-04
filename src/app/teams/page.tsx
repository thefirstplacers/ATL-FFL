import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getRosters, getUsers, buildTeamMap, getAllTimeData } from '@/lib/sleeper';
import { PREV_LEAGUE_ID, LEAGUE_ID, ALL_LEAGUE_IDS, LEAGUE_HISTORY, DIVISIONS, DIVISION_COLORS, MANAGER_INFO } from '@/lib/constants';
import { getManagerDisplayName, formatRecord } from '@/lib/utils';
import { ESPN_HISTORY } from '@/lib/espn-adapter';
import { NFL_TEAMS, FAVORITE_TEAM_MAP, getTeamLogoUrl, MODE_STYLES } from '@/lib/nfl';
import PageHeader from '@/components/ui/PageHeader';
import ManagerAvatar from '@/components/ui/ManagerAvatar';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Teams & Managers',
  description: 'Meet the 12 managers and their teams in the ATL Fantasy Football League.',
};

export default async function TeamsPage() {
  // Current rosters drive the card list; every past season (plus the ESPN era)
  // feeds the all-time career records shown on each card.
  const [allTime, currentRosters, currentUsers, prevRosters, prevUsers] = await Promise.all([
    getAllTimeData(ALL_LEAGUE_IDS),
    getRosters(LEAGUE_ID).catch(() => []),
    getUsers(LEAGUE_ID).catch(() => []),
    getRosters(PREV_LEAGUE_ID),
    getUsers(PREV_LEAGUE_ID),
  ]);

  const prevTeamMap = buildTeamMap(prevRosters, prevUsers);
  const currentTeamMap = buildTeamMap(currentRosters, currentUsers);
  // Reigning champion = the most recent LEAGUE_HISTORY entry with a real
  // roster id (ESPN-era entries use 0), so this survives every season rollover
  const reigning = Object.values(LEAGUE_HISTORY)
    .filter((h) => h.championRosterId > 0)
    .sort((a, b) => b.season - a.season)[0];
  const prevChampionRosterId = reigning?.championRosterId;

  // All-time career records per owner: every Sleeper season + mapped ESPN era
  const careers = new Map<string, { wins: number; losses: number; titles: number }>();
  const addCareer = (ownerId: string, wins: number, losses: number, title: boolean) => {
    const c = careers.get(ownerId) || { wins: 0, losses: 0, titles: 0 };
    c.wins += wins;
    c.losses += losses;
    if (title) c.titles += 1;
    careers.set(ownerId, c);
  };
  for (const seasonData of allTime) {
    const champInfo = Object.values(LEAGUE_HISTORY).find((h) => h.id === seasonData.leagueId);
    for (const r of seasonData.rosters) {
      addCareer(r.owner_id, r.settings.wins, r.settings.losses, r.roster_id === champInfo?.championRosterId);
    }
  }
  for (const espn of Object.values(ESPN_HISTORY)) {
    for (const t of espn.teams) {
      if (t.sleeperOwnerId) addCareer(t.sleeperOwnerId, t.wins, t.losses, t.finalRank === 1);
    }
  }
  const currentSeasonYear = allTime[allTime.length - 1]?.season || '';
  const currentByOwner = new Map(currentRosters.map((r) => [r.owner_id, r]));

  const teams = prevRosters
    .map((roster) => {
      const team = prevTeamMap.get(roster.roster_id);
      const manager = MANAGER_INFO[roster.owner_id];
      const currentTeam = [...currentTeamMap.values()].find((t) => t.ownerId === roster.owner_id);
      const careerRec = careers.get(roster.owner_id) || { wins: 0, losses: 0, titles: 0 };
      const currentRoster = currentByOwner.get(roster.owner_id);
      const division = ((currentRoster?.settings || roster.settings) as Record<string, number>).division || 1;
      const favTeamKey = manager?.favoriteTeam ? FAVORITE_TEAM_MAP[manager.favoriteTeam] : null;
      const favTeam = favTeamKey ? NFL_TEAMS[favTeamKey] : null;

      return {
        rosterId: roster.roster_id,
        ownerId: roster.owner_id,
        name: getManagerDisplayName(roster.owner_id, team?.displayName || ''),
        teamName: currentTeam?.teamName || team?.teamName || '',
        division,
        wins: careerRec.wins,
        losses: careerRec.losses,
        titles: careerRec.titles,
        seasonWins: currentRoster?.settings.wins ?? 0,
        seasonLosses: currentRoster?.settings.losses ?? 0,
        photo: manager?.photo || '/managers/question.jpg',
        location: manager?.location || '',
        bio: manager?.bio || '',
        mode: manager?.mode || '',
        favTeam,
        favTeamAbbr: favTeamKey || '',
        favTeamColor: favTeam?.color || '#666',
        favTeamLogo: favTeamKey ? getTeamLogoUrl(favTeamKey) : '',
        isChampion: roster.roster_id === prevChampionRosterId,
      };
    })
    .sort((a, b) => b.titles - a.titles || b.wins - a.wins);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Teams & Managers" subtitle="Meet the 12 managers of the ATL FFL" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <Link
            key={team.rosterId}
            href={`/teams/${team.ownerId}`}
            className={`glass-card overflow-hidden hover:scale-[1.02] transition-transform block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy ${team.isChampion ? 'ring-2 ring-gold' : ''}`}
          >
            <div className="h-1.5" style={{ backgroundColor: DIVISION_COLORS[team.division] }} />

            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <ManagerAvatar
                    src={team.photo}
                    alt={team.name}
                    size={64}
                    className="border-2 border-border"
                  />
                  {team.isChampion && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gold rounded-full flex items-center justify-center text-xs" aria-hidden="true">
                      🏆
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{team.name}</h3>
                  <p className="text-text-muted text-sm truncate">&quot;{team.teamName}&quot;</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: DIVISION_COLORS[team.division] + '33', color: '#fff' }}>
                      {DIVISIONS[team.division]}
                    </span>
                    {team.location && <span className="text-text-muted text-xs">📍 {team.location}</span>}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="bg-navy rounded-lg p-2">
                  <div className="text-lg font-bold">
                    {formatRecord(team.wins, team.losses, 0)}
                    {team.titles > 0 && <span className="text-gold text-sm ml-1" aria-label={`${team.titles} championships`}>{'🏆'.repeat(team.titles)}</span>}
                  </div>
                  <div className="text-text-muted text-xs">All-Time</div>
                </div>
                <div className="bg-navy rounded-lg p-2">
                  <div className="text-lg font-bold text-gold">{formatRecord(team.seasonWins, team.seasonLosses, 0)}</div>
                  <div className="text-text-muted text-xs">{currentSeasonYear} Season</div>
                </div>
                <div className="bg-navy rounded-lg p-2 flex flex-col items-center justify-center">
                  {team.favTeamLogo ? (
                    <Image src={team.favTeamLogo} alt={team.favTeam?.name || ''} width={32} height={32} className="object-contain" />
                  ) : (
                    <div className="text-lg font-bold text-text-muted">?</div>
                  )}
                  <div className="text-text-muted text-xs">Fav Team</div>
                </div>
              </div>

              {team.mode && (
                <div className="mt-3 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    MODE_STYLES[team.mode]?.bg || 'bg-surface'
                  } ${MODE_STYLES[team.mode]?.color || 'text-text-secondary'}`}>
                    {team.mode}
                  </span>
                  {team.bio && <span className="text-text-muted text-xs truncate">{team.bio}</span>}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
