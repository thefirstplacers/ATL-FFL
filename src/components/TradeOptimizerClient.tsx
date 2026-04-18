'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import ManagerAvatar from '@/components/ui/ManagerAvatar';
import type { TeamRosterAnalysis, TradeSuggestion, RosterPosition } from '@/lib/trades';
import { findTradeSuggestions } from '@/lib/trades';

interface Props {
  teams: TeamRosterAnalysis[];
  leagueAverages: Record<RosterPosition, number>;
  isOffseason: boolean;
}

const POS_COLORS: Record<string, string> = {
  QB: 'bg-red-500/20 text-red-300',
  RB: 'bg-green-500/20 text-green-300',
  WR: 'bg-blue-500/20 text-blue-300',
  TE: 'bg-orange-500/20 text-orange-300',
  K: 'bg-purple-500/20 text-purple-300',
  DEF: 'bg-gray-500/20 text-gray-300',
  FLEX: 'bg-yellow-500/20 text-yellow-300',
};

function Badge({ position }: { position: string }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${POS_COLORS[position] || 'bg-surface text-text-muted'}`}>
      {position}
    </span>
  );
}

const TIER_LABEL: Record<number, { label: string; className: string }> = {
  1: { label: 'Elite', className: 'bg-gold/20 text-gold' },
  2: { label: 'Strong Starter', className: 'bg-success/20 text-success' },
  3: { label: 'Starter/Flex', className: 'bg-info/20 text-info' },
  4: { label: 'Depth', className: 'bg-text-secondary/20 text-text-secondary' },
  5: { label: 'Replacement', className: 'bg-danger/10 text-text-muted' },
};

function TierPill({ tier }: { tier: number }) {
  const t = TIER_LABEL[tier] || TIER_LABEL[5];
  return (
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${t.className}`}>
      T{tier} {t.label}
    </span>
  );
}

function GradeBar({ grade, avg }: { grade: number; avg: number }) {
  const diff = grade - avg;
  const color =
    diff >= 10 ? 'bg-success' : diff <= -10 ? 'bg-danger' : 'bg-info';
  const pct = Math.max(0, Math.min(100, grade));
  return (
    <div className="w-full bg-navy rounded-full h-2 overflow-hidden" aria-hidden="true">
      <div className={`h-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function TradeOptimizerClient({ teams, leagueAverages, isOffseason }: Props) {
  const sortedTeams = useMemo(
    () => [...teams].sort((a, b) => a.managerName.localeCompare(b.managerName)),
    [teams],
  );
  const [myTeamId, setMyTeamId] = useState<number | null>(sortedTeams[0]?.rosterId ?? null);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'explorer' | 'compare'>('suggestions');
  const [compareTeamId, setCompareTeamId] = useState<number | null>(null);

  const myTeam = useMemo(() => teams.find((t) => t.rosterId === myTeamId), [teams, myTeamId]);
  const compareTeam = useMemo(() => teams.find((t) => t.rosterId === compareTeamId), [teams, compareTeamId]);

  const suggestions: TradeSuggestion[] = useMemo(() => {
    if (!myTeam) return [];
    return findTradeSuggestions(myTeam, teams, leagueAverages, { maxPerPartner: 2 }).slice(0, 20);
  }, [myTeam, teams, leagueAverages]);

  const tabs: Array<{ id: typeof activeTab; label: string }> = [
    { id: 'suggestions', label: '💡 Suggested Trades' },
    { id: 'explorer', label: '🔍 Team Explorer' },
    { id: 'compare', label: '⚖️ Compare Rosters' },
  ];

  const positions: RosterPosition[] = ['QB', 'RB', 'WR', 'TE', 'FLEX'];

  return (
    <div>
      {isOffseason && (
        <div className="glass-card p-4 mb-6 bg-info/5 border-info/20 text-text-secondary text-sm flex items-start gap-3">
          <span className="text-info text-lg" aria-hidden="true">ℹ</span>
          <div>
            <div className="font-medium text-info mb-1">Offseason mode</div>
            <div>
              Trade values are derived from the most recently completed season&rsquo;s actual fantasy production. Suggestions still apply as long as rosters haven&rsquo;t been reset.
            </div>
          </div>
        </div>
      )}

      {/* My Team Selector */}
      <div className="glass-card p-5 mb-6">
        <label className="text-text-muted text-sm mb-3 block font-medium">Select your team</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {sortedTeams.map((team) => (
            <button
              key={team.rosterId}
              onClick={() => setMyTeamId(team.rosterId)}
              className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                myTeamId === team.rosterId
                  ? 'bg-gold text-navy font-bold'
                  : 'bg-surface hover:bg-surface-hover text-text-secondary'
              }`}
            >
              <ManagerAvatar src={team.photo} alt={team.managerName} size={28} />
              <span className="truncate text-xs">{team.managerName}</span>
            </button>
          ))}
        </div>
      </div>

      {!myTeam ? (
        <div className="glass-card p-8 text-center text-text-muted">Select a team above to start.</div>
      ) : (
        <>
          {/* My team snapshot */}
          <div className="glass-card p-5 mb-6">
            <div className="flex items-center gap-4 mb-5">
              <ManagerAvatar src={myTeam.photo} alt={myTeam.managerName} size={64} />
              <div className="flex-1">
                <h2 className="text-xl font-bold">{myTeam.managerName}</h2>
                <p className="text-text-muted text-sm">
                  &quot;{myTeam.teamName}&quot;
                  {myTeam.mode && <span className="ml-2 text-info">{myTeam.mode}</span>}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-gold">{myTeam.totalValue}</div>
                <div className="text-text-muted text-xs">Total Value</div>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {positions.map((pos) => {
                const grade = Math.round(myTeam.positionGrades[pos]);
                const avg = Math.round(leagueAverages[pos]);
                const diff = grade - avg;
                return (
                  <div key={pos} className="bg-navy rounded-lg p-3">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-bold text-text-secondary">{pos}</span>
                      <span className={`text-xs font-bold ${diff >= 10 ? 'text-success' : diff <= -10 ? 'text-danger' : 'text-text-muted'}`}>
                        {diff > 0 ? '+' : ''}{diff}
                      </span>
                    </div>
                    <div className="text-lg font-bold mb-1">{grade}</div>
                    <GradeBar grade={grade} avg={avg} />
                    <div className="text-text-muted text-xs mt-1">avg {avg}</div>
                  </div>
                );
              })}
            </div>
            {(myTeam.surplusPositions.length > 0 || myTeam.needPositions.length > 0) && (
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {myTeam.surplusPositions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted text-xs">Surplus:</span>
                    {myTeam.surplusPositions.map((p) => <Badge key={p} position={p} />)}
                  </div>
                )}
                {myTeam.needPositions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-text-muted text-xs">Need:</span>
                    {myTeam.needPositions.map((p) => (
                      <span key={p} className="px-2 py-0.5 rounded text-xs font-bold bg-danger/20 text-danger">
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={activeTab === t.id}
                onClick={() => setActiveTab(t.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                  activeTab === t.id ? 'bg-gold text-navy' : 'bg-surface text-text-secondary hover:bg-surface-hover'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'suggestions' && (
            <div className="space-y-4">
              {suggestions.length === 0 ? (
                <div className="glass-card p-8 text-center text-text-muted">
                  No strong trade matches found. Your roster may already be balanced across positions,
                  or no partner team has a complementary need.
                </div>
              ) : (
                suggestions.map((sug, i) => (
                  <div key={i} className="glass-card p-5">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/teams/${sug.partner.ownerId}`}
                          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
                        >
                          <ManagerAvatar src={sug.partner.photo} alt={sug.partner.managerName} size={40} />
                        </Link>
                        <div>
                          <div className="font-bold">Trade with {sug.partner.managerName}</div>
                          <div className="text-text-muted text-xs">&quot;{sug.partner.teamName}&quot;{sug.partner.mode && ` · ${sug.partner.mode}`}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className={`text-lg font-bold ${sug.fairnessScore >= 80 ? 'text-success' : sug.fairnessScore >= 65 ? 'text-info' : 'text-orange-400'}`}>
                            {sug.fairnessScore}
                          </div>
                          <div className="text-text-muted text-xs">Fair</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gold">{sug.fitScore}</div>
                          <div className="text-text-muted text-xs">Fit</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold">{sug.overallScore}</div>
                          <div className="text-text-muted text-xs">Overall</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                      <div className="bg-danger/5 border border-danger/20 rounded-lg p-3">
                        <div className="text-danger text-xs font-bold uppercase tracking-wider mb-2">You Give</div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge position={sug.giving.position} />
                          <span className="font-bold">{sug.giving.name}</span>
                          <TierPill tier={sug.giving.tier} />
                        </div>
                        <div className="text-text-muted text-xs">
                          {sug.giving.team} &middot; {sug.giving.ppg} PPG &middot; {sug.giving.vorp > 0 ? '+' : ''}{sug.giving.vorp} VORP &middot; Value {sug.giving.tradeValue}
                        </div>
                      </div>
                      <div className="bg-success/5 border border-success/20 rounded-lg p-3">
                        <div className="text-success text-xs font-bold uppercase tracking-wider mb-2">You Get</div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge position={sug.receiving.position} />
                          <span className="font-bold">{sug.receiving.name}</span>
                          <TierPill tier={sug.receiving.tier} />
                        </div>
                        <div className="text-text-muted text-xs">
                          {sug.receiving.team} &middot; {sug.receiving.ppg} PPG &middot; {sug.receiving.vorp > 0 ? '+' : ''}{sug.receiving.vorp} VORP &middot; Value {sug.receiving.tradeValue}
                        </div>
                      </div>
                    </div>

                    <ul className="text-text-secondary text-sm space-y-1 pl-5 list-disc">
                      {sug.reasoning.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'explorer' && (
            <div className="glass-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border/30">
                <h3 className="font-bold">Every manager&apos;s roster strength</h3>
                <p className="text-text-muted text-xs">Green = surplus. Red = weakness. Target teams whose colors complement yours.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="stats-table">
                  <thead>
                    <tr>
                      <th>Manager</th>
                      <th>Mode</th>
                      {positions.map((p) => <th key={p}>{p}</th>)}
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teams.map((t) => (
                      <tr key={t.rosterId} className={t.rosterId === myTeam.rosterId ? 'bg-gold/5' : ''}>
                        <td>
                          <Link
                            href={`/teams/${t.ownerId}`}
                            className="flex items-center gap-2 hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
                          >
                            <ManagerAvatar src={t.photo} alt={t.managerName} size={28} />
                            <span className="font-medium">{t.managerName}</span>
                          </Link>
                        </td>
                        <td className="text-text-secondary text-xs">{t.mode || '—'}</td>
                        {positions.map((p) => {
                          const grade = Math.round(t.positionGrades[p]);
                          const avg = Math.round(leagueAverages[p]);
                          const diff = grade - avg;
                          return (
                            <td key={p}>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm">{grade}</span>
                                <span className={`text-xs font-bold ${diff >= 10 ? 'text-success' : diff <= -10 ? 'text-danger' : 'text-text-muted'}`}>
                                  {diff > 0 ? '+' : ''}{diff}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                        <td className="font-bold text-gold">{t.totalValue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'compare' && (
            <div>
              <div className="glass-card p-5 mb-6">
                <label className="text-text-muted text-sm mb-3 block font-medium">Compare against</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {sortedTeams
                    .filter((t) => t.rosterId !== myTeam.rosterId)
                    .map((team) => (
                      <button
                        key={team.rosterId}
                        onClick={() => setCompareTeamId(team.rosterId)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                          compareTeamId === team.rosterId
                            ? 'bg-info text-navy font-bold'
                            : 'bg-surface hover:bg-surface-hover text-text-secondary'
                        }`}
                      >
                        <ManagerAvatar src={team.photo} alt={team.managerName} size={28} />
                        <span className="truncate text-xs">{team.managerName}</span>
                      </button>
                    ))}
                </div>
              </div>

              {compareTeam && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[myTeam, compareTeam].map((t, idx) => (
                    <div key={t.rosterId} className="glass-card overflow-hidden">
                      <div className="px-4 py-3 border-b border-border/30 flex items-center gap-3">
                        <ManagerAvatar src={t.photo} alt={t.managerName} size={36} />
                        <div className="flex-1">
                          <div className="font-bold">{t.managerName}</div>
                          <div className="text-text-muted text-xs">{t.mode || ''}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-black text-gold">{t.totalValue}</div>
                          <div className="text-text-muted text-xs">{idx === 0 ? 'You' : 'Them'}</div>
                        </div>
                      </div>
                      <div className="divide-y divide-border/20">
                        {t.players
                          .slice()
                          .sort((a, b) => b.tradeValue - a.tradeValue)
                          .map((p) => (
                            <div key={p.id} className="px-4 py-2 flex items-center gap-3">
                              <Badge position={p.position} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{p.name}</div>
                                <div className="text-text-muted text-xs">
                                  {p.team} &middot; {p.ppg} PPG &middot; {p.vorp > 0 ? '+' : ''}{p.vorp} VORP
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-gold font-bold text-sm">{p.tradeValue}</div>
                                <div className="text-text-muted text-[10px] uppercase">T{p.tier}</div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {!compareTeam && (
                <div className="glass-card p-8 text-center text-text-muted">
                  Select a team above to see a side-by-side roster comparison.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
