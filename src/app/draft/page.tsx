import { getDrafts, getDraftPicks, getRosters, getUsers, buildTeamMap } from '@/lib/sleeper';
import { PREV_LEAGUE_ID, MANAGER_INFO } from '@/lib/constants';
import { getManagerDisplayName } from '@/lib/utils';
import PageHeader from '@/components/ui/PageHeader';

export const revalidate = 3600;

export default async function DraftPage() {
  const [drafts, rosters, users] = await Promise.all([
    getDrafts(PREV_LEAGUE_ID),
    getRosters(PREV_LEAGUE_ID),
    getUsers(PREV_LEAGUE_ID),
  ]);

  const teamMap = buildTeamMap(rosters, users);

  // Get the most recent draft picks
  let draftPicks: Array<{
    round: number;
    pick_no: number;
    player_id: string;
    roster_id: number;
    metadata?: { first_name?: string; last_name?: string; team?: string; position?: string };
  }> = [];
  if (drafts.length > 0) {
    try {
      draftPicks = await getDraftPicks(drafts[0].draft_id);
    } catch {
      // Draft picks may not be available
    }
  }

  // Keeper info from current rosters
  const keepers = rosters.filter(r => {
    // Check if roster has any keeper-related metadata
    return false; // We'll check 2026 rosters for keepers
  });

  // Group picks by round
  const picksByRound: Record<number, typeof draftPicks> = {};
  for (const pick of draftPicks) {
    if (!picksByRound[pick.round]) picksByRound[pick.round] = [];
    picksByRound[pick.round].push(pick);
  }

  const getName = (rosterId: number) => {
    const roster = rosters.find(r => r.roster_id === rosterId);
    const team = teamMap.get(rosterId);
    return getManagerDisplayName(roster?.owner_id || '', team?.displayName || '');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="Draft Central" subtitle="2026 Draft Prep & 2025 Draft Results" />

      {/* Offseason Banner */}
      <div className="glass-card p-6 mb-8 bg-gradient-to-r from-gold/10 to-info/10 border-gold/20">
        <div className="flex items-start gap-4">
          <div className="text-4xl">📋</div>
          <div>
            <h2 className="text-xl font-bold text-gold">2026 Draft Prep</h2>
            <p className="text-text-secondary mt-2">
              The 2026 draft is approaching! Each team can keep 1 player from their 2025 roster.
              Start scouting rookies and plan your draft strategy. The draft is scheduled for August 2026.
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

      {/* 2026 Rookie Watch */}
      <div className="glass-card overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-border/30">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span>🌟</span> 2026 Rookie Watch
          </h2>
        </div>
        <div className="p-6">
          <p className="text-text-secondary mb-4">
            Keep an eye on these positions in the upcoming NFL Draft. Top rookies at skill positions
            can make an immediate fantasy impact in our league format.
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

      {/* 2025 Draft Results */}
      {draftPicks.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border/30">
            <h2 className="text-xl font-bold">2025 Draft Results</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Pick</th>
                  <th>Round</th>
                  <th>Player</th>
                  <th>Pos</th>
                  <th>NFL Team</th>
                  <th>Drafted By</th>
                </tr>
              </thead>
              <tbody>
                {draftPicks.map((pick) => (
                  <tr key={pick.pick_no}>
                    <td className="font-bold text-text-muted">{pick.pick_no}</td>
                    <td className="text-text-secondary">{pick.round}</td>
                    <td className="font-medium">
                      {pick.metadata?.first_name} {pick.metadata?.last_name}
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-surface text-text-secondary">
                        {pick.metadata?.position || '?'}
                      </span>
                    </td>
                    <td className="text-text-secondary">{pick.metadata?.team || '?'}</td>
                    <td className="text-gold">{getName(pick.roster_id)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {draftPicks.length === 0 && (
        <div className="glass-card p-8 text-center">
          <p className="text-text-muted">Draft results will be available once the 2025 draft data is loaded from Sleeper.</p>
        </div>
      )}
    </div>
  );
}
