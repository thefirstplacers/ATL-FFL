import type { Metadata } from 'next';
import { buildTeamMap, getAllTimeData, getAllTransactions } from '@/lib/sleeper';
import { ALL_LEAGUE_IDS } from '@/lib/constants';
import { getManagerDisplayName, warnUnknownOwner } from '@/lib/utils';
import { getPlayerNames } from '@/lib/players';
import PageHeader from '@/components/ui/PageHeader';
import TransactionsSeasonView from '@/components/TransactionsSeasonView';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Transactions · ATL FFL',
  description: 'Trades and waiver activity across every season of the ATL Fantasy Football League.',
};

interface ProcessedTransaction {
  id: string;
  type: string;
  timestamp: number;
  week: number;
  rosterNames: Record<number, string>;
  adds: Array<{ playerName: string; teamName: string; rosterId: number }>;
  drops: Array<{ playerName: string; teamName: string; rosterId: number }>;
  waiverBid: number;
}

export default async function TransactionsPage() {
  const [allTimeData, playerNames] = await Promise.all([
    getAllTimeData(ALL_LEAGUE_IDS),
    getPlayerNames(),
  ]);

  const seasonTransactions: Record<string, ProcessedTransaction[]> = {};

  // All season transaction fetches in parallel — avoids the previous sequential
  // loop that blocked the page for ~1s per season.
  const perSeason = await Promise.all(
    allTimeData.map(async (seasonData) => {
      const [transactions] = await Promise.all([getAllTransactions(seasonData.leagueId)]);
      return { seasonData, transactions };
    }),
  );

  for (const { seasonData, transactions } of perSeason) {
    const teamMap = buildTeamMap(seasonData.rosters, seasonData.users);

    seasonTransactions[seasonData.season] = transactions
      .filter((t) => t.status === 'complete')
      .map((t) => {
        const rosterNames: Record<number, string> = {};
        for (const rid of t.roster_ids) {
          const roster = seasonData.rosters.find((r) => r.roster_id === rid);
          const team = teamMap.get(rid);
          if (roster?.owner_id) warnUnknownOwner(roster.owner_id, team?.displayName);
          rosterNames[rid] = getManagerDisplayName(roster?.owner_id || '', team?.displayName || '');
        }

        const mapPlayers = (entries: Record<string, number> | null | undefined) =>
          entries
            ? Object.entries(entries).map(([playerId, rosterId]) => ({
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
          adds: mapPlayers(t.adds),
          drops: mapPlayers(t.drops),
          waiverBid: t.settings?.waiver_bid || 0,
        };
      });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Transactions" subtitle="Trades & Waiver Activity Across All Seasons" />
      <TransactionsSeasonView seasonTransactions={seasonTransactions} />
    </div>
  );
}
