import { SleeperLeague, SleeperUser, SleeperRoster, SleeperMatchup, SleeperTransaction, SleeperDraft, SleeperDraftPick, BracketMatch } from './types';

const BASE_URL = 'https://api.sleeper.app/v1';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1 hour
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

export async function getAllMatchups(leagueId: string, weeks: number = 17): Promise<Record<number, SleeperMatchup[]>> {
  const results: Record<number, SleeperMatchup[]> = {};
  const promises = Array.from({ length: weeks }, (_, i) => i + 1).map(async (week) => {
    try {
      const matchups = await getMatchups(leagueId, week);
      if (matchups && matchups.length > 0) {
        results[week] = matchups;
      }
    } catch {
      // Week may not exist
    }
  });
  await Promise.all(promises);
  return results;
}

export async function getTransactions(leagueId: string, week: number): Promise<SleeperTransaction[]> {
  return fetchJson(`${BASE_URL}/league/${leagueId}/transactions/${week}`);
}

export async function getAllTransactions(leagueId: string, weeks: number = 17): Promise<SleeperTransaction[]> {
  const promises = Array.from({ length: weeks }, (_, i) => i + 1).map((week) =>
    getTransactions(leagueId, week).catch(() => [] as SleeperTransaction[])
  );
  const results = await Promise.all(promises);
  return results.flat().sort((a, b) => b.created - a.created);
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

export async function getPlayerInfo(playerId: string): Promise<Record<string, unknown>> {
  // The full players endpoint is very large; use it sparingly
  return fetchJson(`${BASE_URL}/players/nfl`);
}

// Get avatar URL from Sleeper
export function getAvatarUrl(avatarId: string | null): string {
  if (!avatarId) return '/managers/question.jpg';
  return `https://sleepercdn.com/avatars/thumbs/${avatarId}`;
}

// Build team data combining rosters and users
export function buildTeamMap(
  rosters: SleeperRoster[],
  users: SleeperUser[]
): Map<number, { ownerId: string; coOwners: string[]; displayName: string; teamName: string; avatar: string | null }> {
  const userMap = new Map(users.map((u) => [u.user_id, u]));
  const teamMap = new Map<number, { ownerId: string; coOwners: string[]; displayName: string; teamName: string; avatar: string | null }>();

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

// Parse matchups into paired matchups
export function pairMatchups(matchups: SleeperMatchup[]): Array<{ matchupId: number; team1: SleeperMatchup; team2: SleeperMatchup }> {
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
