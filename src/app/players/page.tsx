import { getRosters, getUsers, buildTeamMap } from '@/lib/sleeper';
import { PREV_LEAGUE_ID, LEAGUE_ID, MANAGER_INFO } from '@/lib/constants';
import { getManagerDisplayName } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import PlayerPoolClient from '@/components/PlayerPoolClient';

export const revalidate = 3600;

async function getPlayers(): Promise<Record<string, { first_name: string; last_name: string; position: string; team: string | null; age: number; years_exp: number; status: string; fantasy_positions: string[] }>> {
  try {
    const res = await fetch('https://api.sleeper.app/v1/players/nfl', { next: { revalidate: 86400 } }); // cache 24 hrs
    return res.json();
  } catch {
    return {};
  }
}

export default async function PlayersPage() {
  const [players, rosters2025, users2025, rosters2026, users2026] = await Promise.all([
    getPlayers(),
    getRosters(PREV_LEAGUE_ID),
    getUsers(PREV_LEAGUE_ID),
    getRosters(LEAGUE_ID),
    getUsers(LEAGUE_ID),
  ]);

  const teamMap2026 = buildTeamMap(rosters2026, users2026);

  // Build set of rostered player IDs (current 2026 rosters)
  const rosteredPlayers = new Map<string, { rosterId: number; ownerName: string }>();
  for (const roster of rosters2026) {
    const team = teamMap2026.get(roster.roster_id);
    const ownerName = getManagerDisplayName(roster.owner_id, team?.displayName || '');
    for (const playerId of (roster.players || [])) {
      rosteredPlayers.set(playerId, { rosterId: roster.roster_id, ownerName });
    }
  }

  // Filter to relevant players (active NFL players with fantasy positions)
  const playerList = Object.entries(players)
    .filter(([, p]) => {
      if (!p.position || !p.team) return false;
      if (!['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].includes(p.position)) return false;
      if (p.status === 'Inactive' && !rosteredPlayers.has(p.first_name)) return false;
      return true;
    })
    .map(([id, p]) => {
      const rostered = rosteredPlayers.get(id);
      return {
        id,
        name: `${p.first_name} ${p.last_name}`,
        position: p.position,
        team: p.team || 'FA',
        age: p.age || 0,
        yearsExp: p.years_exp || 0,
        status: p.status || 'Active',
        isRostered: !!rostered,
        rosteredBy: rostered?.ownerName || '',
      };
    })
    .sort((a, b) => {
      // Sort by position priority, then name
      const posOrder: Record<string, number> = { QB: 1, RB: 2, WR: 3, TE: 4, K: 5, DEF: 6 };
      return (posOrder[a.position] || 99) - (posOrder[b.position] || 99) || a.name.localeCompare(b.name);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Player Pool" subtitle="Browse NFL players and check availability" />
      <PlayerPoolClient players={playerList} />
    </div>
  );
}
