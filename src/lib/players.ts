import type { SleeperPlayer } from './types';

export interface PlayerMeta {
  id: string;
  name: string;
  position: string;
  team: string;
  age: number;
  yearsExp: number;
  status: string;
  fantasyPositions: string[];
  injuryStatus: string | null;
}

type RawPlayer = {
  first_name?: string;
  last_name?: string;
  position?: string;
  team?: string | null;
  age?: number;
  years_exp?: number;
  status?: string;
  fantasy_positions?: string[];
  injury_status?: string | null;
};

const PLAYER_DB_URL = 'https://api.sleeper.app/v1/players/nfl';

// Sleeper's full player DB is ~10k entries / ~5MB. We only need a subset
// of fields for the UI, and Next.js's Data Cache has a per-entry size limit
// (~2MB) that the raw response blows past. So we fetch once per call and
// cache the *processed* map at the module level for the life of the worker.
let cachedPlayers: Map<string, PlayerMeta> | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function normalize(id: string, raw: RawPlayer): PlayerMeta {
  const fantasyPositions = raw.fantasy_positions || (raw.position ? [raw.position] : []);
  return {
    id,
    name: `${raw.first_name ?? ''} ${raw.last_name ?? ''}`.trim() || id,
    position: raw.position || 'N/A',
    team: raw.team || 'FA',
    age: raw.age ?? 0,
    yearsExp: raw.years_exp ?? 0,
    status: raw.status || 'Active',
    fantasyPositions,
    injuryStatus: raw.injury_status ?? null,
  };
}

export async function getPlayerMap(): Promise<Map<string, PlayerMeta>> {
  const now = Date.now();
  if (cachedPlayers && now < cacheExpiry) return cachedPlayers;

  try {
    const res = await fetch(PLAYER_DB_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Sleeper players returned ${res.status}`);
    const raw = (await res.json()) as Record<string, RawPlayer>;
    const map = new Map<string, PlayerMeta>();
    for (const [id, player] of Object.entries(raw)) {
      map.set(id, normalize(id, player));
    }
    cachedPlayers = map;
    cacheExpiry = now + CACHE_TTL_MS;
    return map;
  } catch (err) {
    console.warn('[players] Failed to load Sleeper player DB:', err);
    return cachedPlayers ?? new Map();
  }
}

export async function getPlayerNames(): Promise<Record<string, string>> {
  const map = await getPlayerMap();
  const out: Record<string, string> = {};
  for (const [id, p] of map) out[id] = p.name;
  return out;
}

export function isFantasyRelevant(p: PlayerMeta): boolean {
  if (!['QB', 'RB', 'WR', 'TE', 'K', 'DEF'].includes(p.position)) return false;
  if (p.team === 'FA' && p.status === 'Inactive') return false;
  return true;
}

export type { SleeperPlayer };
