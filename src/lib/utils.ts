import { DIVISIONS, MANAGER_INFO } from './constants';

export function getDivisionName(divisionNum: number): string {
  return DIVISIONS[divisionNum] || `Division ${divisionNum}`;
}

export function getManagerInfo(ownerId: string) {
  return MANAGER_INFO[ownerId] || null;
}

export function getManagerPhoto(ownerId: string): string {
  return MANAGER_INFO[ownerId]?.photo || '/managers/question.jpg';
}

export function getManagerDisplayName(ownerId: string, displayName: string): string {
  const info = MANAGER_INFO[ownerId];
  if (info) {
    return info.coManagerName ? `${info.name} & ${info.coManagerName}` : info.name;
  }
  return displayName;
}

// Warn once per build about owners that appear in the league but aren't in
// MANAGER_INFO — surfaces stale constants after a league roster change without
// breaking the page, so the site keeps rendering with fallback data.
const _warnedOwners = new Set<string>();
export function warnUnknownOwner(ownerId: string, displayName?: string): void {
  if (!ownerId || _warnedOwners.has(ownerId)) return;
  if (MANAGER_INFO[ownerId]) return;
  _warnedOwners.add(ownerId);
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[manager-info] Unknown owner_id: ${ownerId}${displayName ? ` (${displayName})` : ''} — add entry to src/lib/constants.ts MANAGER_INFO`,
    );
  }
}

export function formatPoints(points: number): string {
  return points.toFixed(2);
}

export function formatRecord(wins: number, losses: number, ties: number): string {
  if (ties > 0) return `${wins}-${losses}-${ties}`;
  return `${wins}-${losses}`;
}

export function getWinPercentage(wins: number, losses: number, ties: number): number {
  const total = wins + losses + ties;
  if (total === 0) return 0;
  return (wins + ties * 0.5) / total;
}

export function ordinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getDivisionRosters(
  rosters: Array<{ roster_id: number; settings: { wins: number; losses: number; ties: number; fpts: number; fpts_decimal?: number } }>,
  divisionMap: Map<number, number>
): Map<number, typeof rosters> {
  const divisions = new Map<number, typeof rosters>();
  for (const roster of rosters) {
    const div = divisionMap.get(roster.roster_id) || 1;
    const existing = divisions.get(div) || [];
    existing.push(roster);
    divisions.set(div, existing);
  }
  return divisions;
}
