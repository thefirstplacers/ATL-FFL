'use client';

import { useState } from 'react';

interface Team {
  rosterId: number;
  name: string;
  teamName: string;
  photo: string;
}

interface H2HRecord {
  wins: number;
  losses: number;
  totalPF: number;
  totalPA: number;
  games: Array<{ week: number; pts: number; oppPts: number }>;
}

export default function RivalryTool({ teams, h2hRecords }: { teams: Team[]; h2hRecords: Record<string, H2HRecord> }) {
  const [team1Id, setTeam1Id] = useState<number | null>(null);
  const [team2Id, setTeam2Id] = useState<number | null>(null);

  const key = team1Id && team2Id ? `${team1Id}-${team2Id}` : null;
  const record = key ? h2hRecords[key] : null;
  const team1 = teams.find(t => t.rosterId === team1Id);
  const team2 = teams.find(t => t.rosterId === team2Id);

  return (
    <div>
      {/* Team Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[{ label: 'Team 1', value: team1Id, setValue: setTeam1Id }, { label: 'Team 2', value: team2Id, setValue: setTeam2Id }].map((selector) => (
          <div key={selector.label}>
            <label className="text-text-muted text-sm mb-2 block">{selector.label}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {teams.map((team) => (
                <button
                  key={team.rosterId}
                  onClick={() => selector.setValue(team.rosterId)}
                  className={`flex items-center gap-2 p-3 rounded-lg text-sm transition-colors ${
                    selector.value === team.rosterId
                      ? 'bg-gold text-navy font-bold'
                      : 'bg-surface hover:bg-surface-hover text-text-secondary'
                  }`}
                >
                  <img src={team.photo} alt={team.name} className="w-7 h-7 rounded-full object-cover" />
                  <span className="truncate">{team.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Results */}
      {team1 && team2 && record && record.games.length > 0 ? (
        <div className="space-y-6">
          {/* H2H Summary */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <img src={team1.photo} alt={team1.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-2" />
                <div className="font-bold">{team1.name}</div>
                <div className="text-text-muted text-xs">{team1.teamName}</div>
              </div>
              <div className="text-center px-6">
                <div className="text-3xl font-black">
                  <span className={record.wins > record.losses ? 'text-success' : 'text-text-muted'}>{record.wins}</span>
                  <span className="text-text-muted mx-2">-</span>
                  <span className={record.losses > record.wins ? 'text-success' : 'text-text-muted'}>{record.losses}</span>
                </div>
                <div className="text-text-muted text-sm mt-1">Head to Head</div>
              </div>
              <div className="text-center flex-1">
                <img src={team2.photo} alt={team2.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-2" />
                <div className="font-bold">{team2.name}</div>
                <div className="text-text-muted text-xs">{team2.teamName}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-navy rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gold">{(record.totalPF / record.games.length).toFixed(1)}</div>
                <div className="text-text-muted text-xs">Avg Points ({team1.name})</div>
              </div>
              <div className="bg-navy rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-gold">{(record.totalPA / record.games.length).toFixed(1)}</div>
                <div className="text-text-muted text-xs">Avg Points ({team2.name})</div>
              </div>
            </div>
          </div>

          {/* Game History */}
          <div className="glass-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border/30">
              <h3 className="font-bold">Game History</h3>
            </div>
            <div className="divide-y divide-border/20">
              {record.games.map((game) => {
                const won = game.pts > game.oppPts;
                return (
                  <div key={game.week} className="px-5 py-3 flex items-center gap-4">
                    <span className="text-text-muted text-sm w-16">Week {game.week}</span>
                    <div className="flex-1 flex items-center justify-between">
                      <span className={`font-bold ${won ? 'text-success' : 'text-text-secondary'}`}>
                        {game.pts.toFixed(2)}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${won ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}>
                        {won ? 'W' : 'L'}
                      </span>
                      <span className={`font-bold ${!won ? 'text-success' : 'text-text-secondary'}`}>
                        {game.oppPts.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-text-muted text-xs w-20 text-right">
                      {Math.abs(game.pts - game.oppPts).toFixed(2)} diff
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : team1 && team2 ? (
        <div className="glass-card p-8 text-center text-text-muted">
          No head-to-head matchups found between these teams in the 2025 season.
        </div>
      ) : (
        <div className="glass-card p-8 text-center text-text-muted">
          Select two teams above to compare their head-to-head record.
        </div>
      )}
    </div>
  );
}
