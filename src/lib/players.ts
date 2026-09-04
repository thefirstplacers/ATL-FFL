import { unstable_cache } from 'next/cache';
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
const FANTASY_POSITIONS = new Set(['QB', 'RB', 'WR', 'TE', 'K', 'DEF']);

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

// Sleeper's full player DB is ~11k entries / 10-20MB — far past Next's ~2MB
// per-entry Data Cache limit, which is why the raw fetch can't use the fetch
// cache. Instead we cache a SLIM projection (fantasy positions only, 9 fields)
// via unstable_cache so warm lambdas share it and pages can prerender, with a
// module-level memo on top to avoid re-hydrating the Map within a worker.
const loadSlimPlayers = unstable_cache(
  async (): Promise<Array<PlayerMeta>> => {
    const res = await fetch(PLAYER_DB_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Sleeper players returned ${res.status}`);
    const raw = (await res.json()) as Record<string, RawPlayer>;
    const out: PlayerMeta[] = [];
    for (const [id, player] of Object.entries(raw)) {
      if (!FANTASY_POSITIONS.has(player.position || '')) continue;
      out.push(normalize(id, player));
    }
    return out;
  },
  ['sleeper-players-slim'],
  { revalidate: 6 * 60 * 60 },
);

let cachedPlayers: Map<string, PlayerMeta> | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 60 * 60 * 1000;

export async function getPlayerMap(): Promise<Map<string, PlayerMeta>> {
  const now = Date.now();
  if (cachedPlayers && now < cacheExpiry) return cachedPlayers;

  try {
    const slim = await loadSlimPlayers();
    const map = new Map<string, PlayerMeta>();
    for (const p of slim) map.set(p.id, p);
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
  if (!FANTASY_POSITIONS.has(p.position)) return false;
  if (p.team === 'FA' && p.status === 'Inactive') return false;
  return true;
}

export type { SleeperPlayer };
