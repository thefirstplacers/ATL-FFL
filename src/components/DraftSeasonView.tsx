'use client';

import { useState } from 'react';
import Link from 'next/link';

interface DraftPickData {
  pickNo: number;
  round: number;
  playerName: string;
  position: string;
  nflTeam: string;
  draftedBy: string;
  ownerId: string;
}

const POS_COLORS: Record<string, string> = {
  QB: 'bg-red-500/20 text-red-400',
  RB: 'bg-green-500/20 text-green-400',
  WR: 'bg-blue-500/20 text-blue-400',
  TE: 'bg-orange-500/20 text-orange-400',
  K: 'bg-purple-500/20 text-purple-400',
  DEF: 'bg-gray-500/20 text-gray-400',
};

export default function DraftSeasonView({ seasonDrafts }: { seasonDrafts: Record<string, DraftPickData[]> }) {
  const seasons = Object.keys(seasonDrafts).sort((a, b) => parseInt(b) - parseInt(a));
  const [selectedSeason, setSelectedSeason] = useState(seasons[0] || '');

  const picks = seasonDrafts[selectedSeason] || [];

  if (seasons.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-text-muted">No draft data available from the Sleeper API.</p>
      </div>
    );
  }

  // Group by round
  const rounds: Record<number, DraftPickData[]> = {};
  for (const pick of picks) {
    if (!rounds[pick.round]) rounds[pick.round] = [];
    rounds[pick.round].push(pick);
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold">Draft Results</h2>
        <div className="flex gap-2 flex-wrap">
          {seasons.map((season) => (
            <button
              key={season}
              onClick={() => setSelectedSeason(season)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSeason === season ? 'bg-gold text-navy' : 'bg-surface text-text-secondary hover:bg-surface-hover'
              }`}
            >
              {season}
            </button>
          ))}
        </div>
      </div>

      {picks.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(rounds).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([round, roundPicks]) => (
            <div key={round} className="glass-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border/30">
                <h3 className="font-bold text-gold">Round {round}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>Pick</th>
                      <th>Player</th>
                      <th>Pos</th>
                      <th>NFL Team</th>
                      <th>Drafted By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roundPicks.map((pick) => (
                      <tr key={pick.pickNo}>
                        <td className="font-bold text-text-muted">{pick.pickNo}</td>
                        <td className="font-medium">{pick.playerName}</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${POS_COLORS[pick.position] || 'bg-surface text-text-muted'}`}>
                            {pick.position}
                          </span>
                        </td>
                        <td className="text-text-secondary">{pick.nflTeam}</td>
                        <td>
                          <Link href={`/teams/${pick.ownerId}`} className="text-gold hover:underline">
                            {pick.draftedBy}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-8 text-center">
          <p className="text-text-muted">No draft pick data available for the {selectedSeason} season.</p>
        </div>
      )}
    </div>
  );
}
