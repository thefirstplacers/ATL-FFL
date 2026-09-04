'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import SeasonTabs from '@/components/ui/SeasonTabs';
import ManagerAvatar from '@/components/ui/ManagerAvatar';

interface RankingEntry {
  rosterId: number;
  ownerId: string;
  name: string;
  teamName: string;
  photo: string;
  wins: number;
  losses: number;
  fpts: number;
  powerScore: number;
  winPct: number;
  ptsScore: number;
  schedScore: number;
  consistScore: number;
  recentScore: number;
}

const DEFAULT_METRIC_LABELS: [string, string, string, string, string] = ['Win%', 'Scoring', 'Schedule', 'Consistency', 'Recent'];

export default function RankingsSeasonView({
  seasonRankings,
  metricLabels = {},
}: {
  seasonRankings: Record<string, RankingEntry[]>;
  metricLabels?: Record<string, [string, string, string, string, string]>;
}) {
  // "All-Time" leads, then years newest-first
  const seasons = useMemo(() => {
    const keys = Object.keys(seasonRankings);
    const years = keys.filter((k) => !isNaN(parseInt(k))).sort((a, b) => parseInt(b) - parseInt(a));
    return keys.includes('All-Time') ? ['All-Time', ...years] : years;
  }, [seasonRankings]);
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]);
  const rankings = useMemo(() => seasonRankings[selectedSeason] || [], [seasonRankings, selectedSeason]);
  const maxPower = rankings[0]?.powerScore || 1;
  const labels = metricLabels[selectedSeason] || DEFAULT_METRIC_LABELS;

  return (
    <div>
      <SeasonTabs seasons={seasons} selected={selectedSeason} onChange={setSelectedSeason} />

      <div className="space-y-4">
        {rankings.map((team, i) => {
          const barWidth = (team.powerScore / maxPower) * 100;
          return (
            <div key={`${team.ownerId || team.name}-${team.rosterId}`} className="glass-card p-5">
              <div className="flex items-center gap-4 mb-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                    i === 0
                      ? 'bg-gold text-navy'
                      : i === 1
                      ? 'bg-gray-300 text-navy'
                      : i === 2
                      ? 'bg-amber-700 text-white'
                      : 'bg-navy-lighter text-text-secondary'
                  }`}
                  aria-label={`Rank ${i + 1}`}
                >
                  {i + 1}
                </div>
                <ManagerAvatar src={team.photo} alt={team.name} size={48} />
                <div className="flex-1">
                  {team.ownerId ? (
                    <Link
                      href={`/teams/${team.ownerId}`}
                      className="font-bold text-lg hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
                    >
                      {team.name}
                    </Link>
                  ) : (
                    <span className="font-bold text-lg">{team.name}</span>
                  )}
                  <p className="text-text-muted text-sm">
                    {team.teamName} &middot; {team.wins}-{team.losses}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-gold">{team.powerScore.toFixed(1)}</div>
                  <div className="text-text-muted text-xs">Power Score</div>
                </div>
              </div>

              <div
                className="w-full bg-navy rounded-full h-3 mb-3"
                role="progressbar"
                aria-valuenow={Math.round(team.powerScore)}
                aria-valuemin={0}
                aria-valuemax={Math.round(maxPower)}
              >
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold-dark to-gold transition-all"
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              <div className="grid grid-cols-5 gap-3 text-center">
                {[
                  { label: labels[0], value: team.winPct.toFixed(0), color: 'text-success' },
                  { label: labels[1], value: team.ptsScore.toFixed(0), color: 'text-gold' },
                  { label: labels[2], value: team.schedScore.toFixed(0), color: 'text-info' },
                  { label: labels[3], value: team.consistScore.toFixed(0), color: 'text-purple-400' },
                  { label: labels[4], value: team.recentScore.toFixed(0), color: 'text-orange-400' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-text-muted text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
