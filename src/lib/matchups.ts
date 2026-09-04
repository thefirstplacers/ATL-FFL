export interface ScoredTeam {
  points: number;
}

// A scheduled-but-unplayed week comes back from Sleeper with 0 points on every
// roster. Treat those as "no data" so a fresh season doesn't pollute records,
// rankings, head-to-head history, or team pages with fake 0-0 results.
export function isPlayedWeek(matchups: Array<{ points: number }>): boolean {
  return matchups.some((m) => m.points > 0);
}

export function playedWeeksOnly<T extends { points: number }>(
  all: Record<number, T[]>,
): Record<number, T[]> {
  const out: Record<number, T[]> = {};
  for (const [week, ms] of Object.entries(all)) {
    if (isPlayedWeek(ms)) out[parseInt(week)] = ms;
  }
  return out;
}

export function getWinnerLoser<T extends ScoredTeam>(
  team1: T,
  team2: T,
): { winner: T; loser: T; margin: number; isTie: boolean } {
  const margin = Math.abs(team1.points - team2.points);
  if (team1.points === team2.points) {
    return { winner: team1, loser: team2, margin: 0, isTie: true };
  }
  const winner = team1.points > team2.points ? team1 : team2;
  const loser = team1.points > team2.points ? team2 : team1;
  return { winner, loser, margin, isTie: false };
}
