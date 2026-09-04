'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import SeasonTabs from '@/components/ui/SeasonTabs';
import ManagerAvatar from '@/components/ui/ManagerAvatar';

interface StandingsTeam {
  rosterId: number;
  ownerId: string;
  name: string;
  teamName: string;
  photo: string;
  division: number;
  wins: number;
  losses: number;
  ties: number;
  fpts: number;
  fptsAgainst: number;
  winPct: number;
  diff: number;
  isChampion: boolean;
}

interface AllTimeRecord {
  ownerId: string;
  name: string;
  photo: string;
  wins: number;
  losses: number;
  totalPF: number;
  seasons: number;
  championships: number;
}

export default function StandingsSeasonView({
  seasonStandings,
  allTimeRecords,
  divisions,
  divisionColors,
}: {
  seasonStandings: Record<string, StandingsTeam[]>;
  allTimeRecords: AllTimeRecord[];
  divisions: Record<number, string>;
  divisionColors: Record<number, string>;
}) {
  const seasons = useMemo(
    () => Object.keys(seasonStandings).sort((a, b) => parseInt(b) - parseInt(a)),
    [seasonStandings],
  );
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]);
  const standings = seasonStandings[selectedSeason] || [];
  // ESPN-era seasons carry division 0 (no division data) and empty ownerIds
  const isEspnEra = standings.length > 0 && standings.every((t) => t.division === 0);

  const divisionStandings = useMemo(() => {
    const byDiv: Record<number, StandingsTeam[]> = {};
    for (const team of standings) {
      (byDiv[team.division] ??= []).push(team);
    }
    for (const div of Object.values(byDiv)) div.sort((a, b) => b.wins - a.wins || b.fpts - a.fpts);
    return byDiv;
  }, [standings]);

  const maxPts = Math.max(...standings.map((t) => t.fpts), 1);

  return (
    <div>
      <SeasonTabs seasons={seasons} selected={selectedSeason} onChange={setSelectedSeason} />

      <div className="glass-card overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-border/30">
          <h2 className="text-xl font-bold">{selectedSeason} {isEspnEra ? 'Final Standings' : 'Overall Standings'}</h2>
          {isEspnEra && <p className="text-text-muted text-sm">ESPN era &middot; ranked by final playoff finish</p>}
        </div>
        <div className="overflow-x-auto">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                {!isEspnEra && <th>Division</th>}
                <th>W</th>
                <th>L</th>
                <th>Win %</th>
                <th>PF</th>
                <th>PA</th>
                <th>Diff</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, i) => (
                <tr key={team.rosterId} className={team.isChampion ? 'bg-gold/5' : ''}>
                  <td className="font-bold text-text-secondary">
                    {i + 1}{team.isChampion && <span aria-label="Champion"> 🏆</span>}
                  </td>
                  <td>
                    {team.ownerId ? (
                      <Link
                        href={`/teams/${team.ownerId}`}
                        className="flex items-center gap-3 hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
                      >
                        <ManagerAvatar src={team.photo} alt={team.name} size={32} />
                        <div>
                          <div className="font-medium">{team.name}</div>
                          <div className="text-text-muted text-xs">{team.teamName}</div>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-center gap-3">
                        <ManagerAvatar src={team.photo} alt={team.name} size={32} />
                        <div>
                          <div className="font-medium">{team.name}</div>
                          <div className="text-text-muted text-xs">{team.teamName}</div>
                        </div>
                      </div>
                    )}
                  </td>
                  {!isEspnEra && (
                    <td>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: (divisionColors[team.division] || '#666') + '33',
                          color: '#fff',
                        }}
                      >
                        {divisions[team.division] || `Div ${team.division}`}
                      </span>
                    </td>
                  )}
                  <td className="font-bold text-success">{team.wins}</td>
                  <td className="font-bold text-danger">{team.losses}</td>
                  <td className="text-text-secondary">{(team.winPct * 100).toFixed(0)}%</td>
                  <td className="font-mono">{team.fpts.toFixed(2)}</td>
                  <td className="font-mono text-text-secondary">{team.fptsAgainst.toFixed(2)}</td>
                  <td className={`font-mono font-bold ${team.diff > 0 ? 'text-success' : team.diff < 0 ? 'text-danger' : 'text-text-muted'}`}>
                    {team.diff > 0 ? '+' : ''}{team.diff.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-surface/50 text-text-muted text-sm">
          {isEspnEra
            ? 'Played on ESPN before the league moved to Sleeper in 2022'
            : 'Top 6 teams qualified for playoffs · Division winners get top 3 seeds'}
        </div>
      </div>

      {!isEspnEra && (<>
      <h2 className="text-xl font-bold mb-4">{selectedSeason} Division Standings</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {Object.keys(divisionStandings).sort().map((divStr) => {
          const divNum = parseInt(divStr);
          return (
            <div key={divNum} className="glass-card overflow-hidden">
              <div
                className="px-4 py-3 font-bold uppercase tracking-wider text-sm"
                style={{
                  backgroundColor: (divisionColors[divNum] || '#666') + '33',
                  color: '#fff',
                  borderBottom: `2px solid ${divisionColors[divNum] || '#666'}`,
                }}
              >
                {divisions[divNum] || `Division ${divNum}`}
              </div>
              <div className="divide-y divide-border/20">
                {divisionStandings[divNum].map((team, i) => (
                  <div key={team.rosterId} className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-text-muted font-bold w-4">{i + 1}</span>
                      <div>
                        <div className="font-medium text-sm">{team.name}</div>
                        <div className="text-text-muted text-xs">{team.teamName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">{team.wins}-{team.losses}</div>
                      <div className="text-text-muted text-xs">{team.fpts.toFixed(2)} PF</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      </>)}

      <div className="glass-card p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">{selectedSeason} Points Scored</h2>
        {maxPts <= 1 ? (
          <p className="text-text-muted text-sm">No games played yet — the bars fill in after Week 1.</p>
        ) : (
        <div className="space-y-3">
          {standings.map((team) => {
            const pct = (team.fpts / maxPts) * 100;
            return (
              <div key={team.rosterId} className="flex items-center gap-4">
                <div className="w-32 text-sm font-medium truncate">{team.name}</div>
                <div className="flex-1 bg-navy rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold flex items-center justify-end pr-2"
                    style={{ width: `${pct}%` }}
                  >
                    <span className="text-navy text-xs font-bold">{team.fpts.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border/30">
          <h2 className="text-xl font-bold">
            All-Time Records{seasons.length > 0 && ` (${seasons[seasons.length - 1]}-${seasons[0]})`}
          </h2>
          <p className="text-text-muted text-sm">Every season of the league &middot; ESPN era (2020-21) included</p>
        </div>
        <div className="overflow-x-auto">
          <table className="stats-table">
            <thead>
              <tr><th>Rank</th><th>Manager</th><th>Seasons</th><th>W</th><th>L</th><th>Win %</th><th>Total PF</th><th>Titles</th></tr>
            </thead>
            <tbody>
              {allTimeRecords.map((team, i) => (
                <tr key={team.ownerId || team.name}>
                  <td className="font-bold text-text-secondary">{i + 1}</td>
                  <td>
                    {team.ownerId ? (
                      <Link
                        href={`/teams/${team.ownerId}`}
                        className="flex items-center gap-2 hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
                      >
                        <ManagerAvatar src={team.photo} alt={team.name} size={28} />
                        <span className="font-medium">{team.name}</span>
                      </Link>
                    ) : (
                      <span className="flex items-center gap-2">
                        <ManagerAvatar src={team.photo} alt={team.name} size={28} />
                        <span className="font-medium">{team.name}</span>
                      </span>
                    )}
                  </td>
                  <td className="text-text-secondary">{team.seasons}</td>
                  <td className="font-bold text-success">{team.wins}</td>
                  <td className="font-bold text-danger">{team.losses}</td>
                  <td className="text-text-secondary">
                    {((team.wins / Math.max(team.wins + team.losses, 1)) * 100).toFixed(0)}%
                  </td>
                  <td className="font-mono">{team.totalPF.toFixed(2)}</td>
                  <td>
                    {team.championships > 0 ? (
                      <span className="text-gold font-bold" aria-label={`${team.championships} titles`}>
                        {'🏆'.repeat(team.championships)}
                      </span>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
