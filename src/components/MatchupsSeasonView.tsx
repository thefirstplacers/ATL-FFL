'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import SeasonTabs from '@/components/ui/SeasonTabs';
import WeekTabs from '@/components/ui/WeekTabs';
import ManagerAvatar from '@/components/ui/ManagerAvatar';

interface LineupSlot {
  slot: string;
  name: string;
  pos: string;
  pts: number;
  proj?: number;
}

interface MatchupTeam {
  rosterId: number;
  name: string;
  teamName: string;
  points: number;
  photo: string;
  ownerId: string;
  lineup?: LineupSlot[];
  projTotal?: number;
  projWinPct?: number;
}

const POS_COLORS: Record<string, string> = {
  QB: 'text-red-400', RB: 'text-green-400', WR: 'text-blue-400',
  TE: 'text-orange-400', K: 'text-purple-400', DEF: 'text-gray-400',
};

// Side-by-side starters, slot by slot — collapses under each matchup card
function LineupPanel({ team1, team2, played }: { team1: MatchupTeam; team2: MatchupTeam; played: boolean }) {
  const rows = Math.max(team1.lineup?.length || 0, team2.lineup?.length || 0);
  if (rows === 0) return null;
  return (
    <div className="border-t border-border/40 bg-navy/60 px-3 py-2">
      <div className="grid grid-cols-[1fr_auto_1fr] gap-x-2 text-xs">
        {Array.from({ length: rows }, (_, i) => {
          const a = team1.lineup?.[i];
          const b = team2.lineup?.[i];
          const aWins = played && a && b && a.pts > b.pts;
          const bWins = played && a && b && b.pts > a.pts;
          return (
            <div key={i} className="contents">
              <div className={`flex items-center justify-between gap-2 py-1 ${aWins ? 'font-bold' : ''}`}>
                <span className="truncate">
                  {a?.name || '—'}{' '}
                  <span className={`${POS_COLORS[a?.pos || ''] || 'text-text-muted'}`}>{a?.pos}</span>
                </span>
                <span className={aWins ? 'text-success' : played ? 'text-text-secondary' : 'text-gold italic'}>
                  {played ? a?.pts.toFixed(1) : a?.proj != null ? a.proj.toFixed(1) : '·'}
                </span>
              </div>
              <div className="py-1 px-2 text-text-muted font-bold text-center w-14">{a?.slot || b?.slot}</div>
              <div className={`flex items-center justify-between gap-2 py-1 ${bWins ? 'font-bold' : ''}`}>
                <span className={bWins ? 'text-success' : played ? 'text-text-secondary' : 'text-gold italic'}>
                  {played ? b?.pts.toFixed(1) : b?.proj != null ? b.proj.toFixed(1) : '·'}
                </span>
                <span className="truncate text-right">
                  <span className={`${POS_COLORS[b?.pos || ''] || 'text-text-muted'}`}>{b?.pos}</span>{' '}
                  {b?.name || '—'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface WeeklyMatchup {
  matchupId: number;
  team1: MatchupTeam;
  team2: MatchupTeam;
}

interface BracketEntry {
  round: number;
  matchNum: number;
  team1: { rosterId: number; name: string; teamName: string; photo: string } | null;
  team2: { rosterId: number; name: string; teamName: string; photo: string } | null;
  winnerId: number;
  loserId: number;
}

// ESPN-era members without a Sleeper identity have no team page — plain wrapper
function MaybeTeamLink({ ownerId, className, children }: { ownerId: string; className: string; children: React.ReactNode }) {
  if (!ownerId) return <span className={className.replace(/hover:\S+/g, '').trim()}>{children}</span>;
  return <Link href={`/teams/${ownerId}`} className={className}>{children}</Link>;
}

function firstWeekWithData(matchups: Record<number, WeeklyMatchup[]>): number {
  const weeks = Object.keys(matchups)
    .map(Number)
    .filter((w) => matchups[w]?.length > 0)
    .sort((a, b) => a - b);
  return weeks[0] ?? 1;
}

export default function MatchupsSeasonView({
  allSeasonMatchups,
  totalWeeks,
  regularSeasonWeeks,
}: {
  allSeasonMatchups: Record<string, { weeklyMatchups: Record<number, WeeklyMatchup[]>; bracketData: BracketEntry[] }>;
  totalWeeks: number;
  regularSeasonWeeks: number;
}) {
  const seasons = useMemo(
    () => Object.keys(allSeasonMatchups).sort((a, b) => parseInt(b) - parseInt(a)),
    [allSeasonMatchups],
  );
  const [selectedSeason, setSelectedSeason] = useState(seasons[0]);
  const [selectedWeek, setSelectedWeek] = useState(() =>
    firstWeekWithData(allSeasonMatchups[seasons[0]]?.weeklyMatchups || {}),
  );
  const [showBracket, setShowBracket] = useState(false);
  const [expandedLineups, setExpandedLineups] = useState<Set<string>>(new Set());
  const toggleLineup = (key: string) =>
    setExpandedLineups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const seasonData = allSeasonMatchups[selectedSeason];
  const matchups = seasonData?.weeklyMatchups[selectedWeek] || [];
  const bracketData = seasonData?.bracketData || [];
  const isPlayoffWeek = selectedWeek > regularSeasonWeeks;

  // When season changes, snap week to the first week that actually has data.
  useEffect(() => {
    if (!seasonData) return;
    const current = seasonData.weeklyMatchups[selectedWeek];
    if (!current || current.length === 0) {
      setSelectedWeek(firstWeekWithData(seasonData.weeklyMatchups));
      setShowBracket(false);
    }
  }, [selectedSeason, seasonData, selectedWeek]);

  return (
    <div>
      <SeasonTabs
        seasons={seasons}
        selected={selectedSeason}
        onChange={(s) => {
          setSelectedSeason(s);
          setShowBracket(false);
        }}
      />

      <WeekTabs
        totalWeeks={totalWeeks}
        regularSeasonWeeks={regularSeasonWeeks}
        selectedWeek={selectedWeek}
        onChange={(w) => {
          setSelectedWeek(w);
          setShowBracket(false);
        }}
        hasDataForWeek={(w) => (seasonData?.weeklyMatchups[w]?.length ?? 0) > 0}
        showBracketButton={bracketData.length > 0}
        bracketActive={showBracket}
        onBracket={() => setShowBracket(true)}
      />

      {showBracket ? (
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-6 gradient-text">{selectedSeason} Playoff Bracket</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((round) => {
              const roundMatches = bracketData.filter((m) => m.round === round);
              if (roundMatches.length === 0) return null;
              return (
                <div key={round}>
                  <h4 className="text-sm font-bold text-gold uppercase tracking-wider mb-3">
                    {round === 1 ? 'Round 1' : round === 2 ? 'Semifinals' : 'Championship'}
                  </h4>
                  <div className="space-y-4">
                    {roundMatches.map((match) => (
                      <div key={match.matchNum} className="bg-navy rounded-lg border border-border/30 overflow-hidden">
                        {[match.team1, match.team2].map((team, i) => {
                          if (!team) return null;
                          const isWinner = team.rosterId === match.winnerId;
                          return (
                            <div
                              key={i}
                              className={`flex items-center gap-3 px-4 py-3 ${isWinner ? 'bg-success/10' : ''} ${i === 0 ? 'border-b border-border/20' : ''}`}
                            >
                              <ManagerAvatar src={team.photo} alt={team.name} size={32} />
                              <div className="flex-1">
                                <div className={`text-sm font-medium ${isWinner ? 'text-success' : 'text-text-secondary'}`}>
                                  {team.name}
                                </div>
                                <div className="text-xs text-text-muted">{team.teamName}</div>
                              </div>
                              {isWinner && <span className="text-success text-xs font-bold">W</span>}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-bold mb-4">
            {selectedSeason} &middot; {isPlayoffWeek ? `Playoff Round ${selectedWeek - regularSeasonWeeks}` : `Week ${selectedWeek}`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchups.map((matchup) => {
              // Scheduled-but-unplayed games arrive as 0-0 — render them neutrally
              // instead of inventing a winner. Real ties get the same treatment.
              const played = matchup.team1.points > 0 || matchup.team2.points > 0;
              const isTie = matchup.team1.points === matchup.team2.points;
              const undecided = !played || isTie;
              const winner = matchup.team1.points > matchup.team2.points ? matchup.team1 : matchup.team2;
              const loser = matchup.team1.points > matchup.team2.points ? matchup.team2 : matchup.team1;
              if (undecided) {
                return (
                  <div key={matchup.matchupId} className="glass-card overflow-hidden">
                    <div className="p-4">
                      {[matchup.team1, matchup.team2].map((team, i) => (
                        <div key={team.rosterId}>
                          {i === 1 && <div className="text-center text-text-muted text-xs font-medium my-2">VS</div>}
                          <div className="flex items-center gap-3">
                            <MaybeTeamLink
                              ownerId={team.ownerId}
                              className="focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
                            >
                              <ManagerAvatar src={team.photo} alt={team.name} size={40} />
                            </MaybeTeamLink>
                            <div className="flex-1">
                              <MaybeTeamLink
                                ownerId={team.ownerId}
                                className="font-bold hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
                              >
                                {team.name}
                              </MaybeTeamLink>
                              <div className="text-text-muted text-xs">{team.teamName}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-black text-text-secondary">
                                {played ? team.points.toFixed(2) : team.projTotal != null ? team.projTotal.toFixed(1) : '—'}
                              </div>
                              {!played && team.projTotal != null && (
                                <div className="text-[10px] uppercase tracking-wider text-gold">
                                  proj{team.projWinPct != null ? ` · ${team.projWinPct}%` : ''}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-surface/50 px-4 py-2 text-text-muted text-xs text-center">
                      {played
                        ? 'Tie game'
                        : matchup.team1.projWinPct != null
                        ? `Model favors ${matchup.team1.projWinPct >= 50 ? matchup.team1.name : matchup.team2.name} (${Math.max(matchup.team1.projWinPct, 100 - matchup.team1.projWinPct)}%) · our projection, not Sleeper's`
                        : 'Scheduled · not yet played'}
                    </div>
                    {(matchup.team1.lineup?.length || 0) > 0 && (() => {
                      const key = `${selectedSeason}-${selectedWeek}-${matchup.matchupId}`;
                      const open = expandedLineups.has(key);
                      return (
                        <>
                          <button
                            onClick={() => toggleLineup(key)}
                            aria-expanded={open}
                            className="w-full py-2 text-xs font-bold text-gold hover:bg-surface-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                          >
                            {open ? 'Hide lineups ▲' : 'Player-by-player ▼'}
                          </button>
                          {open && <LineupPanel team1={matchup.team1} team2={matchup.team2} played={played} />}
                        </>
                      );
                    })()}
                  </div>
                );
              }
              return (
                <div key={matchup.matchupId} className="glass-card overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <MaybeTeamLink
                        ownerId={winner.ownerId}
                        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
                      >
                        <ManagerAvatar src={winner.photo} alt={winner.name} size={40} ring="success" />
                      </MaybeTeamLink>
                      <div className="flex-1">
                        <MaybeTeamLink
                          ownerId={winner.ownerId}
                          className="font-bold hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
                        >
                          {winner.name}
                        </MaybeTeamLink>
                        <div className="text-text-muted text-xs">{winner.teamName}</div>
                      </div>
                      <div className="text-2xl font-black text-success">{winner.points.toFixed(2)}</div>
                    </div>
                    <div className="text-center text-text-muted text-xs font-medium my-2">VS</div>
                    <div className="flex items-center gap-3">
                      <MaybeTeamLink
                        ownerId={loser.ownerId}
                        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-full"
                      >
                        <ManagerAvatar src={loser.photo} alt={loser.name} size={40} dim />
                      </MaybeTeamLink>
                      <div className="flex-1">
                        <MaybeTeamLink
                          ownerId={loser.ownerId}
                          className="font-medium text-text-secondary hover:text-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
                        >
                          {loser.name}
                        </MaybeTeamLink>
                        <div className="text-text-muted text-xs">{loser.teamName}</div>
                      </div>
                      <div className="text-2xl font-black text-text-muted">{loser.points.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="bg-surface/50 px-4 py-2 text-text-muted text-xs text-center">
                    Margin: {Math.abs(winner.points - loser.points).toFixed(2)} pts
                  </div>
                  {(matchup.team1.lineup?.length || 0) > 0 && (() => {
                    const key = `${selectedSeason}-${selectedWeek}-${matchup.matchupId}`;
                    const open = expandedLineups.has(key);
                    return (
                      <>
                        <button
                          onClick={() => toggleLineup(key)}
                          aria-expanded={open}
                          className="w-full py-2 text-xs font-bold text-gold hover:bg-surface-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                          {open ? 'Hide lineups ▲' : 'Player-by-player ▼'}
                        </button>
                        {open && <LineupPanel team1={matchup.team1} team2={matchup.team2} played={true} />}
                      </>
                    );
                  })()}
                </div>
              );
            })}
            {matchups.length === 0 && (
              <div className="glass-card p-8 text-center text-text-muted col-span-2">
                No matchups recorded for this week.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
