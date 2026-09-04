import type { Metadata } from 'next';
import { getLeague, getDrafts } from '@/lib/sleeper';
import { LEAGUE_ID, PREV_LEAGUE_ID, LEAGUE_NAME, LEAGUE_EST, DIVISIONS, DIVISION_COLORS } from '@/lib/constants';
import { buildRulesView } from '@/lib/rules';
import PageHeader from '@/components/ui/PageHeader';

// Rules reflect Sleeper's league settings and scoring_settings. Short
// revalidate so commissioner changes show up within the window — the
// prior static copy could silently lie for a whole season.
export const revalidate = 900;

export const metadata: Metadata = {
  title: 'League Rules',
  description: 'Roster format, scoring, playoffs, trades, and waivers — pulled live from the Sleeper league settings.',
};

export default async function RulesPage() {
  // Try current-season league first; fall back to previous season if the new
  // league record isn't configured yet (e.g., between season archive and draft).
  let league;
  try {
    league = await getLeague(LEAGUE_ID);
  } catch {
    league = await getLeague(PREV_LEAGUE_ID);
  }

  const rules = buildRulesView(league);
  const divisionCount = parseInt(rules.overview.find((o) => o.label === 'Divisions')?.value || '0');

  // settings.draft_rounds is Sleeper's rookie-draft field (3 here) — the real
  // draft length lives on the draft record itself, so prefer that when present
  try {
    const drafts = await getDrafts(league.league_id);
    const rounds = drafts[0]?.settings?.rounds;
    if (rounds) {
      const row = rules.overview.find((o) => o.label === 'Draft Rounds');
      if (row) row.value = String(rounds);
    }
  } catch {
    // keep the settings-derived value
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader title="League Rules & Constitution" subtitle={`${LEAGUE_NAME} · ${rules.season} Season`} />

      <div className="glass-card p-4 mb-6 bg-info/5 border-info/20 text-text-secondary text-sm flex items-center gap-3">
        <span className="text-info text-lg" aria-hidden="true">ℹ</span>
        <span>
          These rules are pulled directly from Sleeper. Any change a commissioner makes in-platform
          will appear here within {Math.round(revalidate / 60)} minutes.
        </span>
      </div>

      <div className="space-y-6">
        <section className="glass-card p-6">
          <h2 className="text-xl font-bold text-gold mb-4">League Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ...rules.overview,
              { label: 'Est.', value: String(LEAGUE_EST) },
            ].map((item) => (
              <div key={item.label} className="bg-navy rounded-lg p-3 text-center">
                <div className="text-lg font-bold">{item.value}</div>
                <div className="text-text-muted text-xs">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {divisionCount > 0 && (
          <section className="glass-card p-6">
            <h2 className="text-xl font-bold text-gold mb-4">Divisions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: divisionCount }, (_, i) => i + 1).map((div) => (
                <div
                  key={div}
                  className="bg-navy rounded-lg p-4 text-center border-t-2"
                  style={{ borderColor: DIVISION_COLORS[div] || '#666' }}
                >
                  <div className="font-bold" style={{ color: DIVISION_COLORS[div] || '#fff' }}>
                    {DIVISIONS[div] || `Division ${div}`}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="glass-card p-6">
          <h2 className="text-xl font-bold text-gold mb-4">Roster Settings</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {rules.rosterPositions.map((pos) => (
              <div key={pos.code} className="flex items-center gap-3 bg-navy rounded-lg px-4 py-3">
                <span className="w-8 h-8 rounded bg-gold/20 flex items-center justify-center text-gold font-bold text-xs">
                  {pos.code}
                </span>
                <div>
                  <div className="text-sm font-medium">{pos.label}</div>
                  <div className="text-text-muted text-xs">
                    {pos.count} {pos.count === 1 ? 'starter' : 'starters'}
                  </div>
                </div>
              </div>
            ))}
            {rules.benchCount > 0 && (
              <div className="flex items-center gap-3 bg-navy rounded-lg px-4 py-3">
                <span className="w-8 h-8 rounded bg-surface flex items-center justify-center text-text-muted font-bold text-xs">
                  BN
                </span>
                <div>
                  <div className="text-sm font-medium">Bench</div>
                  <div className="text-text-muted text-xs">{rules.benchCount} slots</div>
                </div>
              </div>
            )}
            {rules.reserveCount > 0 && (
              <div className="flex items-center gap-3 bg-navy rounded-lg px-4 py-3">
                <span className="w-8 h-8 rounded bg-info/20 flex items-center justify-center text-info font-bold text-xs">
                  IR
                </span>
                <div>
                  <div className="text-sm font-medium">Injured Reserve</div>
                  <div className="text-text-muted text-xs">{rules.reserveCount} slots</div>
                </div>
              </div>
            )}
            {rules.taxiCount > 0 && (
              <div className="flex items-center gap-3 bg-navy rounded-lg px-4 py-3">
                <span className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
                  TX
                </span>
                <div>
                  <div className="text-sm font-medium">Taxi Squad</div>
                  <div className="text-text-muted text-xs">{rules.taxiCount} slots</div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="glass-card p-6">
          <h2 className="text-xl font-bold text-gold mb-4">Scoring Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rules.scoring.map((group) => (
              <div key={group.label}>
                <h3 className="font-bold text-sm text-text-secondary uppercase tracking-wider mb-3">
                  {group.label}
                </h3>
                <div className="space-y-2">
                  {group.items.map((item) => (
                    <div key={item.key} className="flex justify-between text-sm">
                      <span className="text-text-secondary">{item.label}</span>
                      <span className="font-mono text-gold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {rules.scoring.length === 0 && (
            <div className="text-text-muted text-sm">No scoring overrides configured in Sleeper.</div>
          )}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="glass-card p-6">
            <h2 className="text-xl font-bold text-gold mb-4">Playoffs</h2>
            <div className="space-y-3">
              {rules.playoffs.map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card p-6">
            <h2 className="text-xl font-bold text-gold mb-4">Trades & Waivers</h2>
            <div className="space-y-3">
              {rules.tradesAndWaivers.map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
