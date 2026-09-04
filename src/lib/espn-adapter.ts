// Adapters that reshape the static ESPN-era data (2020-21) into the same
// structures the Sleeper-era pages consume, so records / rankings / matchups /
// rivalry / standings can span the league's whole life.
import { ESPN_HISTORY, type EspnSeason } from './espn-history';
import { getManagerDisplayName } from './utils';

export { ESPN_HISTORY };
export type { EspnSeason };

export interface EspnTeamInfo {
  teamId: number;
  ownerId: string; // current Sleeper owner_id for continuing members, '' otherwise
  name: string;
  teamName: string;
  photo: string;
}

export function espnTeamInfoMap(season: EspnSeason): Map<number, EspnTeamInfo> {
  const map = new Map<number, EspnTeamInfo>();
  for (const t of season.teams) {
    const ownerId = t.sleeperOwnerId || '';
    map.set(t.teamId, {
      teamId: t.teamId,
      ownerId,
      name: ownerId ? getManagerDisplayName(ownerId, t.owners) : t.owners,
      teamName: t.teamName,
      photo: t.photo,
    });
  }
  return map;
}

export function espnWeeklyScoresByTeam(season: EspnSeason): Map<number, number[]> {
  const map = new Map<number, number[]>();
  const push = (teamId: number, pts: number) => {
    const arr = map.get(teamId) || [];
    arr.push(pts);
    map.set(teamId, arr);
  };
  const sorted = [...season.matchups].sort((a, b) => a.week - b.week);
  for (const m of sorted) {
    push(m.homeTeamId, m.homePts);
    push(m.awayTeamId, m.awayPts);
  }
  return map;
}
