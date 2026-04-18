'use client';

import { useState, useMemo } from 'react';

interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
  age: number;
  yearsExp: number;
  status: string;
  injuryStatus?: string | null;
  isRostered: boolean;
  rosteredBy: string;
}

const POSITIONS = ['All', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
const POS_COLORS: Record<string, string> = {
  QB: 'bg-red-500/20 text-red-400',
  RB: 'bg-green-500/20 text-green-400',
  WR: 'bg-blue-500/20 text-blue-400',
  TE: 'bg-orange-500/20 text-orange-400',
  K: 'bg-purple-500/20 text-purple-400',
  DEF: 'bg-gray-500/20 text-gray-400',
};

export default function PlayerPoolClient({ players }: { players: Player[] }) {
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('All');
  const [availFilter, setAvailFilter] = useState<'all' | 'available' | 'rostered'>('all');
  const [page, setPage] = useState(0);
  const perPage = 50;

  const filtered = useMemo(() => {
    return players.filter((p) => {
      if (posFilter !== 'All' && p.position !== posFilter) return false;
      if (availFilter === 'available' && p.isRostered) return false;
      if (availFilter === 'rostered' && !p.isRostered) return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.team.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [players, posFilter, availFilter, search]);

  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search players..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          className="px-4 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-gold w-full sm:w-64"
        />
        <div className="flex gap-1">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              onClick={() => { setPosFilter(pos); setPage(0); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                posFilter === pos ? 'bg-gold text-navy' : 'bg-surface text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {[
            { key: 'all' as const, label: 'All' },
            { key: 'available' as const, label: 'Free Agents' },
            { key: 'rostered' as const, label: 'Rostered' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => { setAvailFilter(f.key); setPage(0); }}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                availFilter === f.key ? 'bg-info text-white' : 'bg-surface text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="text-text-muted text-sm mb-4">{filtered.length} players found</div>

      {/* Player Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Player</th>
                <th>Pos</th>
                <th>Team</th>
                <th>Age</th>
                <th>Exp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((player) => (
                <tr key={player.id}>
                  <td className="font-medium">{player.name}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${POS_COLORS[player.position] || ''}`}>
                      {player.position}
                    </span>
                  </td>
                  <td className="text-text-secondary text-sm">{player.team}</td>
                  <td className="text-text-secondary text-sm">{player.age || '-'}</td>
                  <td className="text-text-secondary text-sm">{player.yearsExp > 0 ? `${player.yearsExp}yr` : 'R'}</td>
                  <td>
                    {player.injuryStatus && (
                      <span className="text-xs text-danger font-semibold mr-2" title={player.injuryStatus}>
                        {player.injuryStatus.slice(0, 3).toUpperCase()}
                      </span>
                    )}
                    {player.isRostered ? (
                      <span className="text-xs text-danger">Rostered — {player.rosteredBy}</span>
                    ) : (
                      <span className="text-xs text-success font-medium">Available</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-3 py-2 rounded-lg text-sm bg-surface text-text-secondary hover:bg-surface-hover disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-2 text-sm text-text-muted">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-2 rounded-lg text-sm bg-surface text-text-secondary hover:bg-surface-hover disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
