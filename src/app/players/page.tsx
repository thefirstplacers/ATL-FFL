import type { Metadata } from 'next';
import { getRosters, getUsers, buildTeamMap } from '@/lib/sleeper';
import { LEAGUE_ID, PREV_LEAGUE_ID } from '@/lib/constants';
import { getManagerDisplayName } from '@/lib/utils';
import { getPlayerMap, isFantasyRelevant } from '@/lib/players';
import PageHeader from '@/components/ui/PageHeader';
import PlayerPoolClient from '@/components/PlayerPoolClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Player Pool · ATL FFL',
  description: 'Browse every NFL player available in the league. Filter by position and see who is rostered.',
};

export default async function PlayersPage() {
  const [playerMap, currentRosters, currentUsers] = await Promise.all([
    getPlayerMap(),
    getRosters(LEAGUE_ID).catch(() => getRosters(PREV_LEAGUE_ID)),
    getUsers(LEAGUE_ID).catch(() => getUsers(PREV_LEAGUE_ID)),
  ]);

  const teamMap = buildTeamMap(currentRosters, currentUsers);

  const rosteredPlayers = new Map<string, { rosterId: number; ownerName: string }>();
  for (const roster of currentRosters) {
    const team = teamMap.get(roster.roster_id);
    const ownerName = getManagerDisplayName(roster.owner_id, team?.displayName || '');
    for (const playerId of roster.players || []) {
      rosteredPlayers.set(playerId, { rosterId: roster.roster_id, ownerName });
    }
  }

  const posOrder: Record<string, number> = { QB: 1, RB: 2, WR: 3, TE: 4, K: 5, DEF: 6 };
  const playerList = [...playerMap.values()]
    .filter(isFantasyRelevant)
    .map((p) => {
      const rostered = rosteredPlayers.get(p.id);
      return {
        id: p.id,
        name: p.name,
        position: p.position,
        team: p.team,
        age: p.age,
        yearsExp: p.yearsExp,
        status: p.status,
        injuryStatus: p.injuryStatus,
        isRostered: !!rostered,
        rosteredBy: rostered?.ownerName || '',
      };
    })
    .sort((a, b) => (posOrder[a.position] || 99) - (posOrder[b.position] || 99) || a.name.localeCompare(b.name));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Player Pool" subtitle="Browse NFL players and check availability" />
      <PlayerPoolClient players={playerList} />
    </div>
  );
}
