'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import SeasonTabs from '@/components/ui/SeasonTabs';
import ManagerAvatar from '@/components/ui/ManagerAvatar';

interface RecordEntry { rosterId: number; ownerId: string; name: string; photo: string; week: number; points: number; season?: string; }
interface BlowoutEntry { week: number; winnerId: string; winnerName: string; loserId: string; loserName: string; winnerPts: number; loserPts: number; margin: number; season?: string; }
interface SeasonLeader { rosterId: number; ownerId: string; name: string; photo: string; wins: number; losses: number; fpts: number; weeklyHighs: number; }

// "2023 · Week 5" on All-Time entries, plain "Week 5" inside a season tab
function weekLabel(e: { week: number; season?: string }): string {
  return e.season ? `${e.season} · Week ${e.week}` : `Week ${e.week}`;
}

// ESPN-only members have no team page — render plain text instead of a link
function NameLink({ ownerId, className, children }: { ownerId: string; className: string; children: React.ReactNode }) {
  if (!ownerId) return <span className={className.replace(/hover:\S+|focus\S*:\S+/g, '').trim()}>{children}</span>;
  return <Link href={`/teams/${ownerId}`} className={className}>{children}</Link>;
}

interface SeasonRecordData {
  topScores: RecordEntry[];
  bottomScores: RecordEntry[];
  biggestBlowouts: BlowoutEntry[];
  closestGames: BlowoutEntry[];
  seasonLeaders: SeasonLeader[];
}

export default function RecordsSeasonView({ seasonRecords }: { seasonRecords: Record<string, SeasonRecordData> }) {
  // "All-Time" leads, then years newest-first
  const seasons = useMemo(() => {
    const keys = Object.keys(seasonRecords);
    const years = keys.filter((k) => !isNaN(parseInt(k))).sort((a, b) => parseInt(b) - parseInt(a));
    return keys.includes('All-Time') ? ['All-Time', ...years] : years;
  }, [seasonRecords]);
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]);
  const data = seasonRecords[selectedSeason];

  if (!data) return null;

  return (
    <div>
      <SeasonTabs seasons={seasons} selected={selectedSeason} onChange={setSelectedSeason} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Scores */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2"><span className="text-xl">🔥</span><h3 className="font-bold">Highest Weekly Scores</h3></div>
          <div className="divide-y divide-border/20">
            {data.topScores.map((s, i) => (
              <div key={`${s.season || selectedSeason}-${s.name}-${s.week}`} className="px-5 py-3 flex items-center gap-3">
                <span className={`w-6 text-center font-bold text-sm ${i === 0 ? 'text-gold' : 'text-text-muted'}`}>{i + 1}</span>
                <ManagerAvatar src={s.photo} alt={s.name} size={32} />
                <div className="flex-1">
                  <NameLink ownerId={s.ownerId} className="font-medium text-sm hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded">{s.name}</NameLink>
                  <div className="text-text-muted text-xs">{weekLabel(s)}</div>
                </div>
                <span className="font-bold text-gold">{s.points.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Scores */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2"><span className="text-xl">💀</span><h3 className="font-bold">Lowest Weekly Scores</h3></div>
          <div className="divide-y divide-border/20">
            {data.bottomScores.map((s, i) => (
              <div key={`${s.season || selectedSeason}-${s.name}-${s.week}`} className="px-5 py-3 flex items-center gap-3">
                <span className="w-6 text-center font-bold text-sm text-text-muted">{i + 1}</span>
                <ManagerAvatar src={s.photo} alt={s.name} size={32} />
                <div className="flex-1">
                  <NameLink ownerId={s.ownerId} className="font-medium text-sm hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded">{s.name}</NameLink>
                  <div className="text-text-muted text-xs">{weekLabel(s)}</div>
                </div>
                <span className="font-bold text-danger">{s.points.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Biggest Blowouts */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2"><span className="text-xl">💥</span><h3 className="font-bold">Biggest Blowouts</h3></div>
          <div className="divide-y divide-border/20">
            {data.biggestBlowouts.map((g, i) => (
              <div key={`${g.season || selectedSeason}-${g.week}-${g.winnerName}`} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center font-bold text-sm text-text-muted">{i + 1}</span>
                    <NameLink ownerId={g.winnerId} className="font-medium text-sm text-success hover:underline">{g.winnerName}</NameLink>
                  </div>
                  <span className="text-success font-bold text-sm">{g.winnerPts.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center text-text-muted text-xs">vs</span>
                    <span className="text-sm text-text-secondary">{g.loserName}</span>
                  </div>
                  <span className="text-text-muted text-sm">{g.loserPts.toFixed(2)}</span>
                </div>
                <div className="text-text-muted text-xs mt-1 ml-8">{weekLabel(g)} &middot; Margin: {g.margin.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Closest Games */}
        <div className="glass-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2"><span className="text-xl">🤏</span><h3 className="font-bold">Closest Games</h3></div>
          <div className="divide-y divide-border/20">
            {data.closestGames.map((g, i) => (
              <div key={`${g.season || selectedSeason}-${g.week}-${g.winnerName}`} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center font-bold text-sm text-text-muted">{i + 1}</span>
                    <span className="font-medium text-sm">{g.winnerName}</span>
                  </div>
                  <span className="font-bold text-sm">{g.winnerPts.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 text-center text-text-muted text-xs">vs</span>
                    <span className="text-sm text-text-secondary">{g.loserName}</span>
                  </div>
                  <span className="text-text-muted text-sm">{g.loserPts.toFixed(2)}</span>
                </div>
                <div className="text-gold text-xs mt-1 ml-8 font-medium">{weekLabel(g)} &middot; Margin: {g.margin.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Season Leaders */}
        <div className="glass-card overflow-hidden lg:col-span-2">
          <div className="px-5 py-3 border-b border-border/30 flex items-center gap-2"><span className="text-xl">📊</span><h3 className="font-bold">{selectedSeason} Points Leaders</h3></div>
          <div className="overflow-x-auto">
            <table className="stats-table">
              <thead><tr><th>Rank</th><th>Manager</th><th>Record</th><th>Total Points</th><th>Weekly Highs</th></tr></thead>
              <tbody>
                {data.seasonLeaders.map((t, i) => (
                  <tr key={`${t.ownerId || t.name}-${t.rosterId}`}>
                    <td className="font-bold text-text-muted">{i + 1}</td>
                    <td>
                      <NameLink ownerId={t.ownerId} className="flex items-center gap-2 hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded">
                        <span className="flex items-center gap-2">
                          <ManagerAvatar src={t.photo} alt={t.name} size={28} />
                          <span className="font-medium">{t.name}</span>
                        </span>
                      </NameLink>
                    </td>
                    <td className="font-mono">{t.wins}-{t.losses}</td>
                    <td className="font-bold text-gold">{t.fpts.toFixed(2)}</td>
                    <td className="text-text-secondary">{t.weeklyHighs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
