'use client';

import { useState } from 'react';

interface TeamInfo {
  rosterId: number;
  name: string;
  teamName: string;
  points: number;
  photo: string;
}

interface MatchupData {
  matchupId: number;
  team1: TeamInfo;
  team2: TeamInfo;
}

interface BracketEntry {
  round: number;
  matchNum: number;
  team1: { rosterId: number; name: string; teamName: string; photo: string } | null;
  team2: { rosterId: number; name: string; teamName: string; photo: string } | null;
  winnerId: number;
  loserId: number;
}

export default function MatchupWeekSelector({
  weeklyMatchups,
  totalWeeks,
  regularSeasonWeeks,
  bracketData,
}: {
  weeklyMatchups: Record<number, MatchupData[]>;
  totalWeeks: number;
  regularSeasonWeeks: number;
  bracketData: BracketEntry[];
}) {
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [showBracket, setShowBracket] = useState(false);

  const matchups = weeklyMatchups[selectedWeek] || [];
  const isPlayoffWeek = selectedWeek > regularSeasonWeeks;

  return (
    <div>
      {/* Week Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => {
          const isPlayoff = week > regularSeasonWeeks;
          const hasData = weeklyMatchups[week] && weeklyMatchups[week].length > 0;
          return (
            <button
              key={week}
              onClick={() => { setSelectedWeek(week); setShowBracket(false); }}
              disabled={!hasData}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedWeek === week && !showBracket
                  ? 'bg-gold text-navy'
                  : hasData
                  ? `${isPlayoff ? 'bg-info/20 text-info hover:bg-info/30' : 'bg-surface hover:bg-surface-hover text-text-secondary'}`
                  : 'bg-surface/50 text-text-muted cursor-not-allowed'
              }`}
            >
              {isPlayoff ? `P${week - regularSeasonWeeks}` : `W${week}`}
            </button>
          );
        })}
        <button
          onClick={() => setShowBracket(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showBracket ? 'bg-gold text-navy' : 'bg-gold/20 text-gold hover:bg-gold/30'
          }`}
        >
          🏆 Bracket
        </button>
      </div>

      {showBracket ? (
        /* Playoff Bracket */
        <div className="glass-card p-6">
          <h3 className="text-xl font-bold mb-6 gradient-text">2025 Playoff Bracket</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((round) => {
              const roundMatches = bracketData.filter((m) => m.round === round);
              return (
                <div key={round}>
                  <h4 className="text-sm font-bold text-gold uppercase tracking-wider mb-3">
                    {round === 1 ? 'Round 1 (Week 15)' : round === 2 ? 'Semifinals (Week 16)' : 'Championship (Week 17)'}
                  </h4>
                  <div className="space-y-4">
                    {roundMatches.map((match) => (
                      <div key={match.matchNum} className="bg-navy rounded-lg border border-border/30 overflow-hidden">
                        {[match.team1, match.team2].map((team, i) => {
                          if (!team) return null;
                          const isWinner = team.rosterId === match.winnerId;
                          return (
                            <div key={i} className={`flex items-center gap-3 px-4 py-3 ${isWinner ? 'bg-success/10' : ''} ${i === 0 ? 'border-b border-border/20' : ''}`}>
                              <img src={team.photo} alt={team.name} className="w-8 h-8 rounded-full object-cover" />
                              <div className="flex-1">
                                <div className={`text-sm font-medium ${isWinner ? 'text-success' : 'text-text-secondary'}`}>{team.name}</div>
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
        /* Weekly Matchups */
        <div>
          <h3 className="text-lg font-bold mb-4">
            {isPlayoffWeek ? `Playoff Round ${selectedWeek - regularSeasonWeeks}` : `Week ${selectedWeek}`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchups.map((matchup) => {
              const winner = matchup.team1.points > matchup.team2.points ? matchup.team1 : matchup.team2;
              const loser = matchup.team1.points > matchup.team2.points ? matchup.team2 : matchup.team1;
              return (
                <div key={matchup.matchupId} className="glass-card overflow-hidden">
                  <div className="p-4">
                    {/* Winner */}
                    <div className="flex items-center gap-3 mb-3">
                      <img src={winner.photo} alt={winner.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-success" />
                      <div className="flex-1">
                        <div className="font-bold">{winner.name}</div>
                        <div className="text-text-muted text-xs">{winner.teamName}</div>
                      </div>
                      <div className="text-2xl font-black text-success">{winner.points.toFixed(2)}</div>
                    </div>

                    <div className="text-center text-text-muted text-xs font-medium my-2">VS</div>

                    {/* Loser */}
                    <div className="flex items-center gap-3">
                      <img src={loser.photo} alt={loser.name} className="w-10 h-10 rounded-full object-cover opacity-75" />
                      <div className="flex-1">
                        <div className="font-medium text-text-secondary">{loser.name}</div>
                        <div className="text-text-muted text-xs">{loser.teamName}</div>
                      </div>
                      <div className="text-2xl font-black text-text-muted">{loser.points.toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="bg-surface/50 px-4 py-2 text-text-muted text-xs text-center">
                    Margin: {Math.abs(winner.points - loser.points).toFixed(2)} pts
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
