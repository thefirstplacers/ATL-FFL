import type { Metadata } from 'next';
import Link from 'next/link';
import { buildTeamMap, pairMatchups, getAllTimeDataWithMatchups } from '@/lib/sleeper';
import {
  ALL_LEAGUE_IDS,
  LEAGUE_HISTORY,
  MANAGER_INFO,
  REGULAR_SEASON_WEEKS,
} from '@/lib/constants';
import { getManagerDisplayName, formatPoints, formatRecord } from '@/lib/utils';
import { NFL_TEAMS, FAVORITE_TEAM_MAP } from '@/lib/nfl';
import { getPlayerMap } from '@/lib/players';
import PageHeader from '@/components/ui/PageHeader';
import ManagerAvatar from '@/components/ui/ManagerAvatar';
import TeamSeasonView from '@/components/TeamSeasonView';
import PlayerNews from '@/components/PlayerNews';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const manager = MANAGER_INFO[id];
  const name = manager
    ? manager.coManagerName
      ? `${manager.name} & ${manager.coManagerName}`
      : manager.name
    : 'Manager';
  return {
    title: `${name} · ATL FFL`,
    description: `Season history, roster, and weekly results for ${name} in the ATL Fantasy Football League.`,
  };
}

export default async function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: ownerId } = await params;

  const completedLeagueIds = ALL_LEAGUE_IDS.slice(0, 4);
  const [seasons, playerMap] = await Promise.all([
    getAllTimeDataWithMatchups(completedLeagueIds, REGULAR_SEASON_WEEKS),
    getPlayerMap(),
  ]);

  const manager = MANAGER_INFO[ownerId];
  const favTeamKey = manager?.favoriteTeam ? FAVORITE_TEAM_MAP[manager.favoriteTeam] : null;
  const favTeam = favTeamKey ? NFL_TEAMS[favTeamKey] : null;

  const posOrder: Record<string, number> = { QB: 1, RB: 2, WR: 3, TE: 4, K: 5, DEF: 6 };

  const seasonsData = seasons
    .map((seasonData) => {
      const roster = seasonData.rosters.find((r) => r.owner_id === ownerId);
      if (!roster) return null;

      const teamMap = buildTeamMap(seasonData.rosters, seasonData.users);
      const team = teamMap.get(roster.roster_id);
      const champInfo = Object.values(LEAGUE_HISTORY).find((h) => h.id === seasonData.leagueId);

      const players = (roster.players || [])
        .map((pid) => {
          const p = playerMap.get(pid);
          return p
            ? { id: pid, name: p.name, position: p.position, team: p.team }
            : { id: pid, name: pid, position: '?', team: '?' };
        })
        .sort((a, b) => (posOrder[a.position] || 99) - (posOrder[b.position] || 99));

      const weeklyResults: Array<{
        week: number;
        points: number;
        opponentId: number;
        opponentName: string;
        opponentPoints: number;
        won: boolean;
      }> = [];

      for (const [weekStr, matchups] of Object.entries(seasonData.allMatchups)) {
        const week = parseInt(weekStr);
        for (const pair of pairMatchups(matchups)) {
          const myTeam =
            pair.team1.roster_id === roster.roster_id
              ? pair.team1
              : pair.team2.roster_id === roster.roster_id
              ? pair.team2
              : null;
          if (!myTeam) continue;
          const oppTeam = myTeam === pair.team1 ? pair.team2 : pair.team1;
          const oppRoster = seasonData.rosters.find((r) => r.roster_id === oppTeam.roster_id);
          const oppInfo = teamMap.get(oppTeam.roster_id);
          weeklyResults.push({
            week,
            points: myTeam.points,
            opponentId: oppTeam.roster_id,
            opponentName: getManagerDisplayName(oppRoster?.owner_id || '', oppInfo?.displayName || ''),
            opponentPoints: oppTeam.points,
            won: myTeam.points > oppTeam.points,
          });
        }
      }
      weeklyResults.sort((a, b) => a.week - b.week);

      const fpts = (roster.settings.fpts || 0) + ((roster.settings.fpts_decimal || 0) / 100);
      const fptsAgainst =
        (roster.settings.fpts_against || 0) + ((roster.settings.fpts_against_decimal || 0) / 100);
      const division = (roster.settings as Record<string, number>).division || 1;

      return {
        season: seasonData.season,
        leagueId: seasonData.leagueId,
        rosterId: roster.roster_id,
        teamName: team?.teamName || '',
        division,
        wins: roster.settings.wins,
        losses: roster.settings.losses,
        fpts,
        fptsAgainst,
        players,
        weeklyResults,
        isChampion: champInfo?.championRosterId === roster.roster_id,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  const totalWins = seasonsData.reduce((s, d) => s + d.wins, 0);
  const totalLosses = seasonsData.reduce((s, d) => s + d.losses, 0);
  const totalPts = seasonsData.reduce((s, d) => s + d.fpts, 0);
  const championships = seasonsData.filter((d) => d.isChampion).length;
  const displayName = manager
    ? manager.coManagerName
      ? `${manager.name} & ${manager.coManagerName}`
      : manager.name
    : ownerId;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link
        href="/teams"
        className="text-text-muted hover:text-gold text-sm mb-4 inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
      >
        ← Back to Teams
      </Link>

      <div className="glass-card p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <ManagerAvatar
              src={manager?.photo || '/managers/question.jpg'}
              alt={displayName}
              size={96}
              priority
              className="border-2 border-border"
            />
            {championships > 0 && (
              <div
                className="absolute -top-2 -right-2 w-8 h-8 bg-gold rounded-full flex items-center justify-center text-sm"
                aria-label={`${championships} championship${championships > 1 ? 's' : ''}`}
              >
                🏆
              </div>
            )}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold">{displayName}</h1>
            <p className="text-text-muted mt-1">
              {seasonsData[seasonsData.length - 1]?.teamName || ''}
            </p>
            {manager?.location && <p className="text-text-muted text-sm">📍 {manager.location}</p>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-navy rounded-lg p-3">
              <div className="text-xl font-bold">{formatRecord(totalWins, totalLosses, 0)}</div>
              <div className="text-text-muted text-xs">All-Time</div>
            </div>
            <div className="bg-navy rounded-lg p-3">
              <div className="text-xl font-bold text-gold">{formatPoints(totalPts)}</div>
              <div className="text-text-muted text-xs">Total PF</div>
            </div>
            <div className="bg-navy rounded-lg p-3">
              <div className="text-xl font-bold">{seasonsData.length}</div>
              <div className="text-text-muted text-xs">Seasons</div>
            </div>
            <div className="bg-navy rounded-lg p-3">
              <div className="text-xl font-bold">
                {championships > 0 ? '🏆'.repeat(championships) : '-'}
              </div>
              <div className="text-text-muted text-xs">Titles</div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          {favTeam && (
            <div className="bg-navy rounded-lg p-3 flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: favTeam.color }}>
                {favTeam.abbr}
              </span>
              <span className="text-text-muted text-xs">
                {favTeam.city} {favTeam.name}
              </span>
            </div>
          )}
          {manager?.mode && (
            <div className="bg-navy rounded-lg p-3">
              <span className="text-sm font-bold text-info">{manager.mode}</span>
            </div>
          )}
          {manager?.favoritePosition && (
            <div className="bg-navy rounded-lg p-3">
              <span className="text-text-muted text-xs">Fav Position: </span>
              <span className="text-sm font-bold">{manager.favoritePosition}</span>
            </div>
          )}
          {manager?.tradingScale != null && (
            <div className="bg-navy rounded-lg p-3">
              <span className="text-text-muted text-xs">Trade Activity: </span>
              <span className="text-sm font-bold">{manager.tradingScale}/10</span>
            </div>
          )}
        </div>
      </div>

      {seasonsData.length > 0 && (
        <div className="mb-8">
          <PlayerNews players={seasonsData[seasonsData.length - 1].players} />
        </div>
      )}

      <TeamSeasonView seasonsData={seasonsData} />
    </div>
  );
}
