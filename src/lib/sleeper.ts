import {
  SleeperLeague,
  SleeperUser,
  SleeperRoster,
  SleeperMatchup,
  SleeperTransaction,
  SleeperDraft,
  SleeperDraftPick,
  BracketMatch,
} from './types';

const BASE_URL = 'https://api.sleeper.app/v1';
const DEFAULT_REVALIDATE = 3600;

async function fetchJson<T>(url: string, revalidate: number = DEFAULT_REVALIDATE): Promise<T> {
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

export async function getLeague(leagueId: string): Promise<SleeperLeague> {
  return fetchJson(`${BASE_URL}/league/${leagueId}`);
}

export async function getUsers(leagueId: string): Promise<SleeperUser[]> {
  return fetchJson(`${BASE_URL}/league/${leagueId}/users`);
}

export async function getRosters(leagueId: string): Promise<SleeperRoster[]> {
  return fetchJson(`${BASE_URL}/league/${leagueId}/rosters`);
}

export async function getMatchups(leagueId: string, week: number): Promise<SleeperMatchup[]> {
  return fetchJson(`${BASE_URL}/league/${leagueId}/matchups/${week}`);
}

export async function getAllMatchups(
  leagueId: string,
  weeks: number = 17,
): Promise<Record<number, SleeperMatchup[]>> {
  const results: Record<number, SleeperMatchup[]> = {};
  const settled = await Promise.allSettled(
    Array.from({ length: weeks }, (_, i) => i + 1).map((week) => getMatchups(leagueId, week)),
  );
  settled.forEach((r, i) => {
    if (r.status === 'fulfilled' && r.value.length > 0) results[i + 1] = r.value;
  });
  return results;
}

export async function getTransactions(leagueId: string, week: number): Promise<SleeperTransaction[]> {
  return fetchJson(`${BASE_URL}/league/${leagueId}/transactions/${week}`);
}

export async function getAllTransactions(
  leagueId: string,
  weeks: number = 17,
): Promise<SleeperTransaction[]> {
  const settled = await Promise.allSettled(
    Array.from({ length: weeks }, (_, i) => i + 1).map((week) => getTransactions(leagueId, week)),
  );
  const out: SleeperTransaction[] = [];
  for (const r of settled) {
    if (r.status === 'fulfilled') out.push(...r.value);
  }
  return out.sort((a, b) => b.created - a.created);
}

export async function getWinnersBracket(leagueId: string): Promise<BracketMatch[]> {
  return fetchJson(`${BASE_URL}/league/${leagueId}/winners_bracket`);
}

export async function getLosersBracket(leagueId: string): Promise<BracketMatch[]> {
  return fetchJson(`${BASE_URL}/league/${leagueId}/losers_bracket`);
}

export async function getDrafts(leagueId: string): Promise<SleeperDraft[]> {
  return fetchJson(`${BASE_URL}/league/${leagueId}/drafts`);
}

export async function getDraftPicks(draftId: string): Promise<SleeperDraftPick[]> {
  return fetchJson(`${BASE_URL}/draft/${draftId}/picks`);
}

export async function getTrendingPlayers(
  sport: 'nfl' = 'nfl',
  type: 'add' | 'drop' = 'add',
  limit = 25,
): Promise<Array<{ player_id: string; count: number }>> {
  return fetchJson(
    `${BASE_URL}/players/${sport}/trending/${type}?limit=${limit}`,
    6 * 60 * 60,
  );
}

export interface SeasonBundle {
  leagueId: string;
  season: string;
  rosters: SleeperRoster[];
  users: SleeperUser[];
  league: SleeperLeague;
}

export async function getAllTimeData(leagueIds: string[]): Promise<SeasonBundle[]> {
  const settled = await Promise.allSettled(
    leagueIds.map(async (id): Promise<SeasonBundle> => {
      const [league, rosters, users] = await Promise.all([
        getLeague(id),
        getRosters(id),
        getUsers(id),
      ]);
      return { leagueId: id, season: league.season, rosters, users, league };
    }),
  );
  return settled
    .filter((r): r is PromiseFulfilledResult<SeasonBundle> => r.status === 'fulfilled')
    .map((r) => r.value);
}

export interface SeasonWithMatchups extends SeasonBundle {
  allMatchups: Record<number, SleeperMatchup[]>;
}

// Fetches season bundles AND all weekly matchups in one go, all in parallel.
// Used by pages (rankings, records, rivalry, teams/[id]) that were previously
// fetching seasons sequentially, then matchups sequentially per season — an N+1
// pattern that was costing multi-second page loads.
export async function getAllTimeDataWithMatchups(
  leagueIds: string[],
  weeks: number,
): Promise<SeasonWithMatchups[]> {
  const settled = await Promise.allSettled(
    leagueIds.map(async (id): Promise<SeasonWithMatchups> => {
      const [league, rosters, users, allMatchups] = await Promise.all([
        getLeague(id),
        getRosters(id),
        getUsers(id),
        getAllMatchups(id, weeks),
      ]);
      return { leagueId: id, season: league.season, rosters, users, league, allMatchups };
    }),
  );
  return settled
    .filter((r): r is PromiseFulfilledResult<SeasonWithMatchups> => r.status === 'fulfilled')
    .map((r) => r.value);
}

export function getAvatarUrl(avatarId: string | null): string {
  if (!avatarId) return '/managers/question.jpg';
  return `https://sleepercdn.com/avatars/thumbs/${avatarId}`;
}

export interface TeamInfo {
  ownerId: string;
  coOwners: string[];
  displayName: string;
  teamName: string;
  avatar: string | null;
}

export function buildTeamMap(
  rosters: SleeperRoster[],
  users: SleeperUser[],
): Map<number, TeamInfo> {
  const userMap = new Map(users.map((u) => [u.user_id, u]));
  const teamMap = new Map<number, TeamInfo>();

  for (const roster of rosters) {
    const owner = userMap.get(roster.owner_id);
    const coOwnerIds = (roster.co_owners || []).filter(Boolean) as string[];
    teamMap.set(roster.roster_id, {
      ownerId: roster.owner_id,
      coOwners: coOwnerIds,
      displayName: owner?.display_name || 'Unknown',
      teamName: owner?.metadata?.team_name || owner?.display_name || 'Unknown',
      avatar: owner?.avatar || null,
    });
  }

  return teamMap;
}

export function pairMatchups(
  matchups: SleeperMatchup[],
): Array<{ matchupId: number; team1: SleeperMatchup; team2: SleeperMatchup }> {
  const byMatchupId = new Map<number, SleeperMatchup[]>();
  for (const m of matchups) {
    if (!m.matchup_id) continue;
    const existing = byMatchupId.get(m.matchup_id) || [];
    existing.push(m);
    byMatchupId.set(m.matchup_id, existing);
  }

  const paired: Array<{ matchupId: number; team1: SleeperMatchup; team2: SleeperMatchup }> = [];
  for (const [matchupId, teams] of byMatchupId) {
    if (teams.length === 2) {
      paired.push({ matchupId, team1: teams[0], team2: teams[1] });
    }
  }
  return paired.sort((a, b) => a.matchupId - b.matchupId);
}
