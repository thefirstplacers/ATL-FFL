import type { Metadata } from 'next';
import { getDrafts, getDraftPicks, buildTeamMap, getAllTimeData } from '@/lib/sleeper';
import { ALL_LEAGUE_IDS } from '@/lib/constants';
import { getManagerDisplayName } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';
import DraftSeasonView from '@/components/DraftSeasonView';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Draft Central · ATL FFL',
  description: 'Draft history for every season and prep info for the upcoming draft.',
};

interface DraftPickData {
  pickNo: number;
  round: number;
  playerName: string;
  position: string;
  nflTeam: string;
  draftedBy: string;
  ownerId: string;
}

async function getSeasonDraft(leagueId: string): Promise<Awaited<ReturnType<typeof getDraftPicks>>> {
  try {
    const drafts = await getDrafts(leagueId);
    if (drafts.length === 0) return [];
    return await getDraftPicks(drafts[0].draft_id);
  } catch {
    return [];
  }
}

export default async function DraftPage() {
  const completedLeagueIds = ALL_LEAGUE_IDS.slice(0, 4);
  const allTimeData = await getAllTimeData(completedLeagueIds);

  const draftsPerSeason = await Promise.all(allTimeData.map((s) => getSeasonDraft(s.leagueId)));

  const seasonDrafts: Record<string, DraftPickData[]> = {};
  allTimeData.forEach((seasonData, i) => {
    const picks = draftsPerSeason[i];
    if (picks.length === 0) return;
    const teamMap = buildTeamMap(seasonData.rosters, seasonData.users);
    seasonDrafts[seasonData.season] = picks.map((pick) => {
      const roster = seasonData.rosters.find((r) => r.roster_id === pick.roster_id);
      const team = teamMap.get(pick.roster_id);
      return {
        pickNo: pick.pick_no,
        round: pick.round,
        playerName: `${pick.metadata?.first_name || ''} ${pick.metadata?.last_name || ''}`.trim() || pick.player_id,
        position: pick.metadata?.position || '?',
        nflTeam: pick.metadata?.team || '?',
        draftedBy: getManagerDisplayName(roster?.owner_id || '', team?.displayName || ''),
        ownerId: roster?.owner_id || '',
      };
    });
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Draft Central" subtitle="Draft History & Upcoming Draft Prep" />

      <div className="glass-card p-6 mb-8 bg-gradient-to-r from-gold/10 to-info/10 border-gold/20">
        <div className="flex items-start gap-4">
          <div className="text-4xl" aria-hidden="true">📋</div>
          <div>
            <h2 className="text-xl font-bold text-gold">Draft Prep</h2>
            <p className="text-text-secondary mt-2">
              Each team can keep 1 player from last season&apos;s roster. Start scouting rookies and plan your draft strategy.
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="bg-navy rounded-lg px-4 py-2">
                <div className="text-gold font-bold">1 Keeper</div>
                <div className="text-text-muted text-xs">Per team allowed</div>
              </div>
              <div className="bg-navy rounded-lg px-4 py-2">
                <div className="text-gold font-bold">3 Rounds</div>
                <div className="text-text-muted text-xs">Draft format</div>
              </div>
              <div className="bg-navy rounded-lg px-4 py-2">
                <div className="text-gold font-bold">$100</div>
                <div className="text-text-muted text-xs">FAAB budget</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-border/30">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span aria-hidden="true">🌟</span> Rookie Watch
          </h2>
        </div>
        <div className="p-6">
          <p className="text-text-secondary mb-4">
            Top rookies at skill positions can make an immediate fantasy impact in our league format.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { pos: 'RB', desc: 'Rookie RBs often get immediate volume. Look for landing spots with weak incumbent starters.', color: 'text-green-400' },
              { pos: 'WR', desc: 'Top WR prospects in strong offenses can be league winners. Target pass-heavy teams.', color: 'text-blue-400' },
              { pos: 'TE', desc: 'Rookie TEs rarely produce Year 1, but elite prospects on good teams can surprise.', color: 'text-orange-400' },
            ].map((item) => (
              <div key={item.pos} className="bg-navy rounded-lg p-4">
                <div className={`text-lg font-bold ${item.color} mb-2`}>{item.pos}</div>
                <p className="text-text-muted text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DraftSeasonView seasonDrafts={seasonDrafts} />
    </div>
  );
}
