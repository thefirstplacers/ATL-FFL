import { LEAGUE_NAME, ROSTER_POSITIONS, BENCH_SLOTS, PLAYOFF_TEAMS, PLAYOFF_START_WEEK, TRADE_DEADLINE_WEEK, FAAB_BUDGET, SCORING, DIVISIONS, DIVISION_COLORS } from '@/lib/constants';
import PageHeader from '@/components/ui/PageHeader';

export default function RulesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PageHeader title="League Rules & Constitution" subtitle={`${LEAGUE_NAME} Official Rules`} />

      <div className="space-y-6">
        {/* League Overview */}
        <section className="glass-card p-6">
          <h2 className="text-xl font-bold text-gold mb-4">League Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Teams', value: '12' },
              { label: 'Divisions', value: '3' },
              { label: 'Format', value: 'Keeper' },
              { label: 'Platform', value: 'Sleeper' },
              { label: 'Buy-in', value: '$50' },
              { label: 'Keepers', value: '1 per team' },
              { label: 'Draft Rounds', value: '3' },
              { label: 'Est.', value: '2019' },
            ].map((item) => (
              <div key={item.label} className="bg-navy rounded-lg p-3 text-center">
                <div className="text-lg font-bold">{item.value}</div>
                <div className="text-text-muted text-xs">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Divisions */}
        <section className="glass-card p-6">
          <h2 className="text-xl font-bold text-gold mb-4">Divisions</h2>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((div) => (
              <div key={div} className="bg-navy rounded-lg p-4 text-center border-t-2" style={{ borderColor: DIVISION_COLORS[div] }}>
                <div className="font-bold" style={{ color: DIVISION_COLORS[div] }}>{DIVISIONS[div]}</div>
                <div className="text-text-muted text-xs mt-1">4 Teams</div>
              </div>
            ))}
          </div>
        </section>

        {/* Roster Settings */}
        <section className="glass-card p-6">
          <h2 className="text-xl font-bold text-gold mb-4">Roster Settings</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ROSTER_POSITIONS.map((pos, i) => (
              <div key={`${pos}-${i}`} className="flex items-center gap-2 bg-navy rounded-lg px-4 py-3">
                <span className="w-8 h-8 rounded bg-gold/20 flex items-center justify-center text-gold font-bold text-xs">{pos}</span>
                <span className="text-sm">Starter</span>
              </div>
            ))}
            <div className="flex items-center gap-2 bg-navy rounded-lg px-4 py-3">
              <span className="w-8 h-8 rounded bg-surface flex items-center justify-center text-text-muted font-bold text-xs">BN</span>
              <span className="text-sm">{BENCH_SLOTS} Bench Slots</span>
            </div>
            <div className="flex items-center gap-2 bg-navy rounded-lg px-4 py-3">
              <span className="w-8 h-8 rounded bg-info/20 flex items-center justify-center text-info font-bold text-xs">IR</span>
              <span className="text-sm">1 Reserve Slot</span>
            </div>
          </div>
        </section>

        {/* Scoring */}
        <section className="glass-card p-6">
          <h2 className="text-xl font-bold text-gold mb-4">Scoring Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-sm text-text-secondary uppercase tracking-wider mb-3">Passing</h3>
              <div className="space-y-2">
                {[
                  { label: 'Passing Yards', value: `${SCORING.pass_yd} pts/yd` },
                  { label: 'Passing TD', value: `${SCORING.pass_td} pts` },
                  { label: 'Interception', value: `${SCORING.pass_int} pts` },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-text-secondary">{item.label}</span>
                    <span className="font-mono text-gold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-sm text-text-secondary uppercase tracking-wider mb-3">Rushing</h3>
              <div className="space-y-2">
                {[
                  { label: 'Rushing Yards', value: `${SCORING.rush_yd} pts/yd` },
                  { label: 'Rushing TD', value: `${SCORING.rush_td} pts` },
                  { label: 'Fumble Lost', value: `${SCORING.fum_lost} pts` },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-text-secondary">{item.label}</span>
                    <span className="font-mono text-gold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-sm text-text-secondary uppercase tracking-wider mb-3">Receiving</h3>
              <div className="space-y-2">
                {[
                  { label: 'Receiving Yards', value: `${SCORING.rec_yd} pts/yd` },
                  { label: 'Receiving TD', value: `${SCORING.rec_td} pts` },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-text-secondary">{item.label}</span>
                    <span className="font-mono text-gold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="font-bold text-sm text-text-secondary uppercase tracking-wider mb-3">Defense</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Sack', value: `${SCORING.def_sack} pt` },
                { label: 'Interception', value: `${SCORING.def_int} pts` },
                { label: 'Defensive TD', value: `${SCORING.def_td} pts` },
                { label: 'Safety', value: `${SCORING.def_saf} pts` },
              ].map((item) => (
                <div key={item.label} className="bg-navy rounded-lg p-3 text-center">
                  <div className="text-gold font-bold">{item.value}</div>
                  <div className="text-text-muted text-xs">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Playoffs & Waivers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="glass-card p-6">
            <h2 className="text-xl font-bold text-gold mb-4">Playoffs</h2>
            <div className="space-y-3">
              {[
                { label: 'Playoff Teams', value: PLAYOFF_TEAMS.toString() },
                { label: 'Playoff Start', value: `Week ${PLAYOFF_START_WEEK}` },
                { label: 'Championship', value: 'Week 17' },
                { label: 'Seeding', value: 'Division winners + wildcards' },
              ].map((item) => (
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
              {[
                { label: 'Trade Deadline', value: `Week ${TRADE_DEADLINE_WEEK}` },
                { label: 'Trade Review', value: '2 days' },
                { label: 'Veto Votes Needed', value: '6' },
                { label: 'FAAB Budget', value: `$${FAAB_BUDGET}` },
                { label: 'Waiver Period', value: '2 days' },
              ].map((item) => (
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
