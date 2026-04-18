'use client';

import { useMemo, useState } from 'react';
import ManagerAvatar from '@/components/ui/ManagerAvatar';

interface Team {
  ownerId: string;
  name: string;
  teamName: string;
  photo: string;
}

interface H2HRecord {
  wins: number;
  losses: number;
  totalPF: number;
  totalPA: number;
  games: Array<{ season: string; week: number; pts: number; oppPts: number }>;
}

export default function RivalryTool({ teams, h2hRecords }: { teams: Team[]; h2hRecords: Record<string, H2HRecord> }) {
  const [team1Id, setTeam1Id] = useState<string | null>(null);
  const [team2Id, setTeam2Id] = useState<string | null>(null);

  const key = team1Id && team2Id ? `${team1Id}-${team2Id}` : null;
  const record = key ? h2hRecords[key] : null;
  const team1 = teams.find((t) => t.ownerId === team1Id);
  const team2 = teams.find((t) => t.ownerId === team2Id);

  const gamesBySeason = useMemo(() => {
    const map: Record<string, H2HRecord['games']> = {};
    if (!record) return map;
    for (const game of record.games) (map[game.season] ??= []).push(game);
    return map;
  }, [record]);
  const seasonKeys = Object.keys(gamesBySeason).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[
          { label: 'Team 1', value: team1Id, setValue: setTeam1Id },
          { label: 'Team 2', value: team2Id, setValue: setTeam2Id },
        ].map((selector) => (
          <div key={selector.label}>
            <label className="text-text-muted text-sm mb-2 block font-medium">{selector.label}</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="radiogroup" aria-label={selector.label}>
              {teams.map((team) => {
                const isActive = selector.value === team.ownerId;
                return (
                  <button
                    key={team.ownerId}
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => selector.setValue(team.ownerId)}
                    className={`flex items-center gap-2 p-3 rounded-lg text-sm transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                      isActive ? 'bg-gold text-navy font-bold' : 'bg-surface hover:bg-surface-hover text-text-secondary'
                    }`}
                  >
                    <ManagerAvatar src={team.photo} alt={team.name} size={28} />
                    <span className="truncate">{team.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {team1 && team2 && record && record.games.length > 0 ? (
        <div className="space-y-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-center flex-1">
                <ManagerAvatar src={team1.photo} alt={team1.name} size={64} className="mx-auto mb-2" />
                <div className="font-bold">{team1.name}</div>
                <div className="text-text-muted text-xs">{team1.teamName}</div>
              </div>
              <div className="text-center px-6">
                <div className="text-3xl font-black">
                  <span className={record.wins > record.losses ? 'text-success' : record.wins < record.losses ? 'text-danger' : 'text-text-muted'}>
                    {record.wins}
                  </span>
                  <span className="text-text-muted mx-2">-</span>
                  <span className={record.losses > record.wins ? 'text-success' : record.losses < record.wins ? 'text-danger' : 'text-text-muted'}>
                    {record.losses}
                  </span>
                </div>
                <div className="text-text-muted text-sm mt-1">All-Time H2H</div>
                <div className="text-text-muted text-xs mt-1">
                  {record.games.length} games across {seasonKeys.length} season{seasonKeys.length > 1 ? 's' : ''}
                </div>
              </div>
              <div className="text-center flex-1">
                <ManagerAvatar src={team2.photo} alt={team2.name} size={64} className="mx-auto mb-2" />
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

          {seasonKeys.map((season) => (
            <div key={season} className="glass-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border/30 flex items-center justify-between">
                <h3 className="font-bold">{season} Season</h3>
                <span className="text-text-muted text-sm">
                  {gamesBySeason[season].filter((g) => g.pts > g.oppPts).length}-
                  {gamesBySeason[season].filter((g) => g.pts < g.oppPts).length}
                </span>
              </div>
              <div className="divide-y divide-border/20">
                {gamesBySeason[season].map((game) => {
                  const won = game.pts > game.oppPts;
                  return (
                    <div key={`${season}-${game.week}`} className="px-5 py-3 flex items-center gap-4">
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
          ))}
        </div>
      ) : team1 && team2 ? (
        <div className="glass-card p-8 text-center text-text-muted">
          No head-to-head matchups found between these teams across any season.
        </div>
      ) : (
        <div className="glass-card p-8 text-center text-text-muted">
          Select two teams above to compare their all-time head-to-head record.
        </div>
      )}
    </div>
  );
}
