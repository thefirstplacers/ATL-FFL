import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getRosters, getUsers, buildTeamMap } from '@/lib/sleeper';
import { PREV_LEAGUE_ID, LEAGUE_ID, LEAGUE_HISTORY, DIVISIONS, DIVISION_COLORS, MANAGER_INFO } from '@/lib/constants';
import { getManagerDisplayName, formatPoints, formatRecord } from '@/lib/utils';
import { NFL_TEAMS, FAVORITE_TEAM_MAP, getTeamLogoUrl, MODE_STYLES } from '@/lib/nfl';
import PageHeader from '@/components/ui/PageHeader';
import ManagerAvatar from '@/components/ui/ManagerAvatar';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Teams & Managers',
  description: 'Meet the 12 managers and their teams in the ATL Fantasy Football League.',
};

export default async function TeamsPage() {
  // Pull current season rosters for the most up-to-date team names, and prior
  // season rosters for finalized records (the current season may be in pre-draft).
  const [currentRosters, currentUsers, prevRosters, prevUsers] = await Promise.all([
    getRosters(LEAGUE_ID).catch(() => []),
    getUsers(LEAGUE_ID).catch(() => []),
    getRosters(PREV_LEAGUE_ID),
    getUsers(PREV_LEAGUE_ID),
  ]);

  const prevTeamMap = buildTeamMap(prevRosters, prevUsers);
  const currentTeamMap = buildTeamMap(currentRosters, currentUsers);
  // Reigning champion = the most recent LEAGUE_HISTORY entry with a real
  // roster id (ESPN-era entries use 0), so this survives every season rollover
  const prevChampionRosterId = Object.values(LEAGUE_HISTORY)
    .filter((h) => h.championRosterId > 0)
    .sort((a, b) => b.season - a.season)[0]?.championRosterId;

  const teams = prevRosters
    .map((roster) => {
      const team = prevTeamMap.get(roster.roster_id);
      const manager = MANAGER_INFO[roster.owner_id];
      const currentTeam = [...currentTeamMap.values()].find((t) => t.ownerId === roster.owner_id);
      const fpts = (roster.settings.fpts || 0) + ((roster.settings.fpts_decimal || 0) / 100);
      const division = (roster.settings as Record<string, number>).division || 1;
      const favTeamKey = manager?.favoriteTeam ? FAVORITE_TEAM_MAP[manager.favoriteTeam] : null;
      const favTeam = favTeamKey ? NFL_TEAMS[favTeamKey] : null;

      return {
        rosterId: roster.roster_id,
        ownerId: roster.owner_id,
        name: getManagerDisplayName(roster.owner_id, team?.displayName || ''),
        teamName: currentTeam?.teamName || team?.teamName || '',
        division,
        wins: roster.settings.wins,
        losses: roster.settings.losses,
        fpts,
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
    .sort((a, b) => b.wins - a.wins || b.fpts - a.fpts);

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
                  <div className="text-lg font-bold">{formatRecord(team.wins, team.losses, 0)}</div>
                  <div className="text-text-muted text-xs">Record</div>
                </div>
                <div className="bg-navy rounded-lg p-2">
                  <div className="text-lg font-bold text-gold">{formatPoints(team.fpts)}</div>
                  <div className="text-text-muted text-xs">Points</div>
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
