import Link from 'next/link';
import { getRosters, getUsers, buildTeamMap } from '@/lib/sleeper';
import { PREV_LEAGUE_ID, DIVISIONS, DIVISION_COLORS, MANAGER_INFO } from '@/lib/constants';
import { getManagerDisplayName, formatPoints, formatRecord } from '@/lib/utils';
import { NFL_TEAMS, FAVORITE_TEAM_MAP } from '@/lib/nfl';
import PageHeader from '@/components/ui/PageHeader';

export const revalidate = 3600;

export default async function TeamsPage() {
  const [rosters, users] = await Promise.all([
    getRosters(PREV_LEAGUE_ID),
    getUsers(PREV_LEAGUE_ID),
  ]);

  const teamMap = buildTeamMap(rosters, users);

  const teams = rosters.map((roster) => {
    const team = teamMap.get(roster.roster_id);
    const manager = MANAGER_INFO[roster.owner_id];
    const fpts = (roster.settings.fpts || 0) + ((roster.settings.fpts_decimal || 0) / 100);
    const division = parseInt(roster.metadata?.division || '1');
    const favTeamKey = manager?.favoriteTeam ? FAVORITE_TEAM_MAP[manager.favoriteTeam] : null;
    const favTeam = favTeamKey ? NFL_TEAMS[favTeamKey] : null;

    return {
      rosterId: roster.roster_id,
      ownerId: roster.owner_id,
      name: getManagerDisplayName(roster.owner_id, team?.displayName || ''),
      teamName: team?.teamName || '',
      division,
      wins: roster.settings.wins,
      losses: roster.settings.losses,
      fpts,
      photo: manager?.photo || '/managers/question.jpg',
      location: manager?.location || '',
      bio: manager?.bio || '',
      mode: manager?.mode || '',
      favTeam,
      favTeamColor: favTeam?.color || '#666',
      isChampion: roster.roster_id === 9,
    };
  }).sort((a, b) => b.wins - a.wins || b.fpts - a.fpts);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Teams & Managers" subtitle="Meet the 12 managers of the ATL FFL" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.rosterId} className={`glass-card overflow-hidden hover:scale-[1.02] transition-transform ${team.isChampion ? 'ring-2 ring-gold' : ''}`}>
            {/* Division banner */}
            <div className="h-1.5" style={{ backgroundColor: DIVISION_COLORS[team.division] }} />

            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={team.photo}
                    alt={team.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-border"
                  />
                  {team.isChampion && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gold rounded-full flex items-center justify-center text-xs">🏆</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{team.name}</h3>
                  <p className="text-text-muted text-sm truncate">&quot;{team.teamName}&quot;</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: DIVISION_COLORS[team.division] + '20', color: DIVISION_COLORS[team.division] }}>
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
                <div className="bg-navy rounded-lg p-2">
                  <div className="text-lg font-bold" style={{ color: team.favTeamColor }}>{team.favTeam?.abbr || '?'}</div>
                  <div className="text-text-muted text-xs">Fav Team</div>
                </div>
              </div>

              {team.mode && (
                <div className="mt-3 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    team.mode === 'Win Now' ? 'bg-success/20 text-success' :
                    team.mode === 'Rebuild' ? 'bg-info/20 text-info' :
                    'bg-gold/20 text-gold'
                  }`}>
                    {team.mode}
                  </span>
                  {team.bio && <span className="text-text-muted text-xs truncate">{team.bio}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
