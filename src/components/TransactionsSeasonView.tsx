'use client';

import { useMemo, useState } from 'react';
import SeasonTabs from '@/components/ui/SeasonTabs';

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

const typeLabels: Record<string, { label: string; color: string; icon: string }> = {
  trade: { label: 'Trade', color: 'bg-purple-500/20 text-purple-400', icon: '🔄' },
  waiver: { label: 'Waiver', color: 'bg-blue-500/20 text-blue-400', icon: '📋' },
  free_agent: { label: 'Free Agent', color: 'bg-green-500/20 text-green-400', icon: '✅' },
  commissioner: { label: 'Commissioner', color: 'bg-gold/20 text-gold', icon: '⚙️' },
};

export default function TransactionsSeasonView({ seasonTransactions }: { seasonTransactions: Record<string, ProcessedTransaction[]> }) {
  const seasons = useMemo(() => Object.keys(seasonTransactions).sort((a, b) => parseInt(b) - parseInt(a)), [seasonTransactions]);
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]);
  const [filter, setFilter] = useState<'all' | 'trade' | 'waiver' | 'free_agent'>('all');
  const [page, setPage] = useState(0);
  const perPage = 25;

  const transactions = seasonTransactions[selectedSeason] || [];
  const filtered = filter === 'all' ? transactions : transactions.filter((t) => t.type === filter);
  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const handleSeasonChange = (season: string) => {
    setSelectedSeason(season);
    setPage(0);
  };

  return (
    <div>
      <SeasonTabs seasons={seasons} selected={selectedSeason} onChange={handleSeasonChange} />

      <div className="flex gap-2 mb-6 flex-wrap" role="group" aria-label="Transaction type">
        {[
          { key: 'all' as const, label: 'All' },
          { key: 'trade' as const, label: 'Trades' },
          { key: 'waiver' as const, label: 'Waivers' },
          { key: 'free_agent' as const, label: 'Free Agent' },
        ].map((f) => (
          <button
            key={f.key}
            aria-pressed={filter === f.key}
            onClick={() => { setFilter(f.key); setPage(0); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${filter === f.key ? 'bg-info text-navy' : 'bg-surface text-text-secondary hover:bg-surface-hover'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="text-text-muted text-sm mb-4">{filtered.length} transactions in {selectedSeason}</div>

      <div className="space-y-3">
        {paginated.map((txn) => {
          const info = typeLabels[txn.type] || { label: txn.type, color: 'bg-surface text-text-secondary', icon: '📄' };
          return (
            <div key={txn.id} className="glass-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-lg">{info.icon}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${info.color}`}>{info.label}</span>
                <span className="text-text-muted text-xs">
                  {new Date(txn.timestamp).toLocaleDateString()} &middot; Week {txn.week}
                </span>
                {txn.waiverBid > 0 && <span className="text-gold text-xs font-bold">${txn.waiverBid} FAAB</span>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {txn.adds.length > 0 && (
                  <div>
                    {txn.adds.map((add, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-success font-bold text-xs">+ADD</span>
                        <span className="font-medium">{add.playerName}</span>
                        <span className="text-text-muted">→ {add.teamName}</span>
                      </div>
                    ))}
                  </div>
                )}
                {txn.drops.length > 0 && (
                  <div>
                    {txn.drops.map((drop, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-danger font-bold text-xs">-DROP</span>
                        <span className="font-medium text-text-secondary">{drop.playerName}</span>
                        <span className="text-text-muted">← {drop.teamName}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}
            className="px-3 py-2 rounded-lg text-sm bg-surface text-text-secondary hover:bg-surface-hover disabled:opacity-50">Prev</button>
          <span className="px-3 py-2 text-sm text-text-muted">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}
            className="px-3 py-2 rounded-lg text-sm bg-surface text-text-secondary hover:bg-surface-hover disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
