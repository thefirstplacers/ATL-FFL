export interface ScoredTeam {
  points: number;
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
