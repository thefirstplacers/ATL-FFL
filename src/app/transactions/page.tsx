import { getAllTransactions, getRosters, getUsers, buildTeamMap } from '@/lib/sleeper';
import { PREV_LEAGUE_ID, MANAGER_INFO } from '@/lib/constants';
import { getManagerDisplayName } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import TransactionsList from '@/components/TransactionsList';

export const revalidate = 3600;

async function getPlayerNames(): Promise<Record<string, string>> {
  try {
    const res = await fetch('https://api.sleeper.app/v1/players/nfl', { next: { revalidate: 86400 } });
    const players = await res.json();
    const names: Record<string, string> = {};
    for (const [id, p] of Object.entries(players) as [string, { first_name: string; last_name: string }][]) {
      names[id] = `${p.first_name} ${p.last_name}`;
    }
    return names;
  } catch {
    return {};
  }
}

export default async function TransactionsPage() {
  const [transactions, rosters, users, playerNames] = await Promise.all([
    getAllTransactions(PREV_LEAGUE_ID),
    getRosters(PREV_LEAGUE_ID),
    getUsers(PREV_LEAGUE_ID),
    getPlayerNames(),
  ]);

  const teamMap = buildTeamMap(rosters, users);

  const processedTxns = transactions
    .filter((t) => t.status === 'complete')
    .map((t) => {
      const rosterNames: Record<number, string> = {};
      for (const rid of t.roster_ids) {
        const roster = rosters.find(r => r.roster_id === rid);
        const team = teamMap.get(rid);
        rosterNames[rid] = getManagerDisplayName(roster?.owner_id || '', team?.displayName || '');
      }

      const adds = t.adds
        ? Object.entries(t.adds).map(([playerId, rosterId]) => ({
            playerName: playerNames[playerId] || playerId,
            teamName: rosterNames[rosterId] || `Team ${rosterId}`,
            rosterId,
          }))
        : [];

      const drops = t.drops
        ? Object.entries(t.drops).map(([playerId, rosterId]) => ({
            playerName: playerNames[playerId] || playerId,
            teamName: rosterNames[rosterId] || `Team ${rosterId}`,
            rosterId,
          }))
        : [];

      return {
        id: t.transaction_id,
        type: t.type,
        timestamp: t.created,
        week: t.leg || 0,
        rosterNames,
        adds,
        drops,
        waiverBid: t.settings?.waiver_bid || 0,
      };
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Transactions" subtitle="2025 Season Trades & Waiver Activity" />
      <TransactionsList transactions={processedTxns} />
    </div>
  );
}
