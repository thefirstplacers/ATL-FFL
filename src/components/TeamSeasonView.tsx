'use client';

import { useState } from 'react';

interface SeasonData {
  season: string;
  leagueId: string;
  rosterId: number;
  teamName: string;
  division: number;
  wins: number;
  losses: number;
  fpts: number;
  fptsAgainst: number;
  players: Array<{ id: string; name: string; position: string; team: string }>;
  weeklyResults: Array<{ week: number; points: number; opponentId: number; opponentName: string; opponentPoints: number; won: boolean }>;
  isChampion: boolean;
}

const POS_COLORS: Record<string, string> = {
  QB: 'bg-red-500/20 text-red-400',
  RB: 'bg-green-500/20 text-green-400',
  WR: 'bg-blue-500/20 text-blue-400',
  TE: 'bg-orange-500/20 text-orange-400',
  K: 'bg-purple-500/20 text-purple-400',
  DEF: 'bg-gray-500/20 text-gray-400',
};

const DIVISIONS: Record<number, string> = { 1: 'The Hokage', 2: 'The Emperors', 3: 'The Z Fighters' };

export default function TeamSeasonView({ seasonsData }: { seasonsData: SeasonData[] }) {
  const [selectedSeason, setSelectedSeason] = useState(seasonsData.length - 1);
  const data = seasonsData[selectedSeason];

  if (!data) return <div className="glass-card p-8 text-center text-text-muted">No season data available.</div>;

  const avgPts = data.weeklyResults.length > 0
    ? data.weeklyResults.reduce((s, r) => s + r.points, 0) / data.weeklyResults.length
    : 0;
  const highWeek = data.weeklyResults.reduce((max, r) => r.points > max.points ? r : max, { points: 0, week: 0 } as { points: number; week: number });

  return (
    <div>
      {/* Season Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {seasonsData.map((s, i) => (
          <button
            key={s.season}
            onClick={() => setSelectedSeason(i)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedSeason === i ? 'bg-gold text-navy' : 'bg-surface text-text-secondary hover:bg-surface-hover'
            }`}
          >
            {s.season}
            {s.isChampion && <span>🏆</span>}
          </button>
        ))}
      </div>

      {/* Season Summary */}
      <div className="glass-card p-5 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-bold">{data.season} Season</h2>
          <span className="text-text-muted">&quot;{data.teamName}&quot;</span>
          <span className="text-text-muted text-sm">{DIVISIONS[data.division] || `Div ${data.division}`}</span>
          {data.isChampion && <span className="px-2 py-1 rounded bg-gold/20 text-gold text-xs font-bold">CHAMPION 🏆</span>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
          <div className="bg-navy rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{data.wins}-{data.losses}</div>
            <div className="text-text-muted text-xs">Record</div>
          </div>
          <div className="bg-navy rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-gold">{data.fpts.toFixed(2)}</div>
            <div className="text-text-muted text-xs">Points For</div>
          </div>
          <div className="bg-navy rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-text-secondary">{data.fptsAgainst.toFixed(2)}</div>
            <div className="text-text-muted text-xs">Points Against</div>
          </div>
          <div className="bg-navy rounded-lg p-3 text-center">
            <div className="text-lg font-bold">{data.weeklyResults.length > 0 ? avgPts.toFixed(1) : '—'}</div>
            <div className="text-text-muted text-xs">Avg/Week</div>
          </div>
          <div className="bg-navy rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-success">{highWeek.week > 0 ? `↑${highWeek.points.toFixed(1)}` : '—'}</div>
            <div className="text-text-muted text-xs">{highWeek.week > 0 ? `Best (Wk ${highWeek.week})` : 'Best Week'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roster */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/30">
            <h3 className="font-bold">Roster ({data.players.length} players)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="stats-table">
              <thead>
                <tr><th>Player</th><th>Pos</th><th>NFL Team</th></tr>
              </thead>
              <tbody>
                {data.players.map((player) => (
                  <tr key={player.id}>
                    <td className="font-medium">{player.name}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${POS_COLORS[player.position] || 'bg-surface text-text-muted'}`}>
                        {player.position}
                      </span>
                    </td>
                    <td className="text-text-secondary text-sm">{player.team}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weekly Results */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/30">
            <h3 className="font-bold">Weekly Results</h3>
          </div>
          <div className="divide-y divide-border/20">
            {data.weeklyResults.map((result) => (
              <div key={result.week} className={`px-5 py-3 flex items-center gap-3 ${result.won ? '' : 'opacity-75'}`}>
                <span className="text-text-muted text-sm w-12">Wk {result.week}</span>
                <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${result.won ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                  {result.won ? 'W' : 'L'}
                </span>
                <div className="flex-1">
                  <span className="font-bold">{result.points.toFixed(2)}</span>
                  <span className="text-text-muted mx-2">vs</span>
                  <span className="text-text-secondary">{result.opponentName}</span>
                </div>
                <span className="text-text-muted text-sm">{result.opponentPoints.toFixed(2)}</span>
              </div>
            ))}
            {data.weeklyResults.length === 0 && (
              <div className="px-5 py-8 text-center text-text-muted">No matchup data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
