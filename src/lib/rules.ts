import type { SleeperLeague } from './types';

export interface ScoringGroup {
  label: string;
  items: Array<{ label: string; value: string; key: string }>;
}

export interface RulesView {
  overview: Array<{ label: string; value: string }>;
  rosterPositions: Array<{ code: string; label: string; count: number }>;
  benchCount: number;
  taxiCount: number;
  reserveCount: number;
  scoring: ScoringGroup[];
  playoffs: Array<{ label: string; value: string }>;
  tradesAndWaivers: Array<{ label: string; value: string }>;
  rawScoring: Record<string, number>;
  season: string;
  leagueName: string;
  status: string;
}

// Sleeper scoring-setting keys → human-readable label + group. Every key that
// appears in the league's `scoring_settings` with a non-zero value is rendered.
// Anything not in this map falls through to a generated label so new settings
// show up automatically rather than disappearing silently.
const SCORING_LABELS: Record<string, { label: string; group: string; unit?: 'pt' | 'yd' }> = {
  // Passing
  pass_yd: { label: 'Passing Yards', group: 'Passing', unit: 'yd' },
  pass_td: { label: 'Passing TD', group: 'Passing', unit: 'pt' },
  pass_int: { label: 'Interception Thrown', group: 'Passing', unit: 'pt' },
  pass_2pt: { label: '2-Pt Pass Conv.', group: 'Passing', unit: 'pt' },
  pass_cmp: { label: 'Completion', group: 'Passing', unit: 'pt' },
  pass_sack: { label: 'Sack Taken', group: 'Passing', unit: 'pt' },
  pass_td_40p: { label: 'Pass TD 40+ yd', group: 'Passing', unit: 'pt' },
  pass_td_50p: { label: 'Pass TD 50+ yd', group: 'Passing', unit: 'pt' },
  pass_fd: { label: 'Pass First Down', group: 'Passing', unit: 'pt' },
  // Rushing
  rush_yd: { label: 'Rushing Yards', group: 'Rushing', unit: 'yd' },
  rush_td: { label: 'Rushing TD', group: 'Rushing', unit: 'pt' },
  rush_2pt: { label: '2-Pt Rush Conv.', group: 'Rushing', unit: 'pt' },
  rush_fd: { label: 'Rush First Down', group: 'Rushing', unit: 'pt' },
  rush_att: { label: 'Rush Attempt', group: 'Rushing', unit: 'pt' },
  rush_td_40p: { label: 'Rush TD 40+ yd', group: 'Rushing', unit: 'pt' },
  rush_td_50p: { label: 'Rush TD 50+ yd', group: 'Rushing', unit: 'pt' },
  // Receiving
  rec: { label: 'Reception (PPR)', group: 'Receiving', unit: 'pt' },
  rec_yd: { label: 'Receiving Yards', group: 'Receiving', unit: 'yd' },
  rec_td: { label: 'Receiving TD', group: 'Receiving', unit: 'pt' },
  rec_2pt: { label: '2-Pt Rec Conv.', group: 'Receiving', unit: 'pt' },
  rec_fd: { label: 'Reception First Down', group: 'Receiving', unit: 'pt' },
  rec_td_40p: { label: 'Rec TD 40+ yd', group: 'Receiving', unit: 'pt' },
  rec_td_50p: { label: 'Rec TD 50+ yd', group: 'Receiving', unit: 'pt' },
  bonus_rec_te: { label: 'TE Reception Bonus', group: 'Receiving', unit: 'pt' },
  bonus_rec_rb: { label: 'RB Reception Bonus', group: 'Receiving', unit: 'pt' },
  bonus_rec_wr: { label: 'WR Reception Bonus', group: 'Receiving', unit: 'pt' },
  // Misc offense
  fum_lost: { label: 'Fumble Lost', group: 'Misc', unit: 'pt' },
  fum: { label: 'Fumble', group: 'Misc', unit: 'pt' },
  fum_rec: { label: 'Fumble Recovery', group: 'Misc', unit: 'pt' },
  fum_rec_td: { label: 'Fumble Recovery TD', group: 'Misc', unit: 'pt' },
  // Kicking
  fgm_0_19: { label: 'FG Made 0-19', group: 'Kicking', unit: 'pt' },
  fgm_20_29: { label: 'FG Made 20-29', group: 'Kicking', unit: 'pt' },
  fgm_30_39: { label: 'FG Made 30-39', group: 'Kicking', unit: 'pt' },
  fgm_40_49: { label: 'FG Made 40-49', group: 'Kicking', unit: 'pt' },
  fgm_50p: { label: 'FG Made 50+', group: 'Kicking', unit: 'pt' },
  fgmiss: { label: 'FG Missed', group: 'Kicking', unit: 'pt' },
  xpm: { label: 'Extra Point Made', group: 'Kicking', unit: 'pt' },
  xpmiss: { label: 'Extra Point Missed', group: 'Kicking', unit: 'pt' },
  // Defense / Special Teams
  def_sack: { label: 'Defensive Sack', group: 'Defense', unit: 'pt' },
  def_int: { label: 'Interception', group: 'Defense', unit: 'pt' },
  def_fr: { label: 'Fumble Recovery', group: 'Defense', unit: 'pt' },
  def_td: { label: 'Defensive TD', group: 'Defense', unit: 'pt' },
  def_saf: { label: 'Safety', group: 'Defense', unit: 'pt' },
  def_ff: { label: 'Forced Fumble', group: 'Defense', unit: 'pt' },
  def_tkl_solo: { label: 'Solo Tackle', group: 'Defense', unit: 'pt' },
  def_pass_def: { label: 'Pass Defended', group: 'Defense', unit: 'pt' },
  blk_kick: { label: 'Blocked Kick', group: 'Defense', unit: 'pt' },
  st_fum_rec: { label: 'Special Teams Fumble Rec', group: 'Defense', unit: 'pt' },
  st_td: { label: 'Special Teams TD', group: 'Defense', unit: 'pt' },
  // Points allowed buckets
  pts_allow_0: { label: 'Points Allowed: 0', group: 'Defense', unit: 'pt' },
  pts_allow_1_6: { label: 'Points Allowed: 1-6', group: 'Defense', unit: 'pt' },
  pts_allow_7_13: { label: 'Points Allowed: 7-13', group: 'Defense', unit: 'pt' },
  pts_allow_14_20: { label: 'Points Allowed: 14-20', group: 'Defense', unit: 'pt' },
  pts_allow_21_27: { label: 'Points Allowed: 21-27', group: 'Defense', unit: 'pt' },
  pts_allow_28_34: { label: 'Points Allowed: 28-34', group: 'Defense', unit: 'pt' },
  pts_allow_35p: { label: 'Points Allowed: 35+', group: 'Defense', unit: 'pt' },
};

const POSITION_LABELS: Record<string, string> = {
  QB: 'Quarterback',
  RB: 'Running Back',
  WR: 'Wide Receiver',
  TE: 'Tight End',
  FLEX: 'FLEX (RB/WR/TE)',
  SUPER_FLEX: 'Super Flex (QB/RB/WR/TE)',
  REC_FLEX: 'Rec FLEX (WR/TE)',
  WRRB_FLEX: 'W/R FLEX (WR/RB)',
  K: 'Kicker',
  DEF: 'Defense / ST',
  DL: 'Defensive Line',
  LB: 'Linebacker',
  DB: 'Defensive Back',
  IDP_FLEX: 'IDP FLEX',
  BN: 'Bench',
  IR: 'Injured Reserve',
  TAXI: 'Taxi Squad',
};

function formatScoringValue(key: string, value: number): string {
  const unit = SCORING_LABELS[key]?.unit;
  const sign = value > 0 ? '+' : '';
  if (unit === 'yd') return `${value} pts / yd`;
  if (unit === 'pt') return `${sign}${value} pts`;
  return `${sign}${value}`;
}

function humanize(key: string): string {
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatWaiverType(code: number | undefined): string {
  // Sleeper waiver_type: 0 = reverse standings, 1 = FAAB, 2 = rolling
  switch (code) {
    case 0: return 'Reverse Standings';
    case 1: return 'FAAB';
    case 2: return 'Rolling Waivers';
    default: return 'FAAB';
  }
}

function formatTradeReviewDays(days: number | undefined): string {
  if (days == null || days === 0) return 'Immediate (commissioner-approved)';
  return `${days} day${days === 1 ? '' : 's'}`;
}

export function buildRulesView(league: SleeperLeague): RulesView {
  const settings = league.settings || {};
  const scoring = league.scoring_settings || {};

  // Overview block
  const overview: Array<{ label: string; value: string }> = [
    { label: 'Teams', value: String(league.total_rosters ?? settings.num_teams ?? 12) },
    { label: 'Divisions', value: String(settings.divisions ?? 0) },
    { label: 'Format', value: settings.type === 2 ? 'Dynasty' : settings.type === 1 ? 'Keeper' : 'Redraft' },
    { label: 'Platform', value: 'Sleeper' },
    { label: 'Season', value: league.season },
    { label: 'Keepers', value: settings.max_keepers ? `${settings.max_keepers} per team` : '—' },
    { label: 'Draft Rounds', value: String(settings.draft_rounds ?? 0) },
    { label: 'Status', value: league.status.replace(/_/g, ' ') },
  ];

  // Roster positions: count duplicates (QB, RB, RB → QB x1, RB x2)
  const positionCounts = new Map<string, number>();
  for (const code of league.roster_positions || []) {
    positionCounts.set(code, (positionCounts.get(code) || 0) + 1);
  }
  const rosterPositions: Array<{ code: string; label: string; count: number }> = [];
  for (const [code, count] of positionCounts) {
    if (code === 'BN' || code === 'IR' || code === 'TAXI') continue;
    rosterPositions.push({ code, label: POSITION_LABELS[code] || humanize(code), count });
  }

  const benchCount = positionCounts.get('BN') ?? 0;
  const reserveCount = positionCounts.get('IR') ?? 0;
  const taxiCount = positionCounts.get('TAXI') ?? settings.taxi_slots ?? 0;

  // Scoring: group and filter zero-value settings (they are not rules, just defaults)
  const groups = new Map<string, Array<{ label: string; value: string; key: string }>>();
  const groupOrder = ['Passing', 'Rushing', 'Receiving', 'Misc', 'Kicking', 'Defense', 'Other'];
  for (const key of groupOrder) groups.set(key, []);

  for (const [key, value] of Object.entries(scoring)) {
    if (!value) continue;
    const meta = SCORING_LABELS[key];
    const group = meta?.group || 'Other';
    const label = meta?.label || humanize(key);
    const bucket = groups.get(group) || [];
    bucket.push({ label, value: formatScoringValue(key, value), key });
    groups.set(group, bucket);
  }
  const scoringGroups: ScoringGroup[] = [];
  for (const g of groupOrder) {
    const items = groups.get(g) || [];
    if (items.length > 0) scoringGroups.push({ label: g, items: items.sort((a, b) => a.label.localeCompare(b.label)) });
  }

  // Playoffs
  const playoffWeekStart = settings.playoff_week_start ?? 15;
  const playoffTeams = settings.playoff_teams ?? 6;
  const playoffRoundType = settings.playoff_round_type_selected ?? settings.playoff_round_type ?? 0;
  const playoffSeedType = settings.playoff_seed_type === 1 ? 'Points-based' : 'Record + Points';
  const playoffs: Array<{ label: string; value: string }> = [
    { label: 'Playoff Teams', value: String(playoffTeams) },
    { label: 'Playoff Start', value: `Week ${playoffWeekStart}` },
    { label: 'Championship', value: `Week ${playoffWeekStart + (playoffRoundType === 2 ? 4 : 2)}` },
    { label: 'Seeding', value: playoffSeedType },
  ];

  // Trades & Waivers
  const tradesAndWaivers: Array<{ label: string; value: string }> = [
    { label: 'Trade Deadline', value: settings.trade_deadline ? `Week ${settings.trade_deadline}` : 'None' },
    { label: 'Trade Review', value: formatTradeReviewDays(settings.trade_review_days) },
    { label: 'Veto Votes', value: settings.veto_votes_needed ? String(settings.veto_votes_needed) : 'Commissioner-only' },
    { label: 'Waiver Type', value: formatWaiverType(settings.waiver_type) },
    { label: 'FAAB Budget', value: `$${settings.waiver_budget ?? 100}` },
    { label: 'Waiver Clear', value: `${settings.waiver_clear_days ?? 2} day${(settings.waiver_clear_days ?? 2) === 1 ? '' : 's'}` },
  ];

  return {
    overview,
    rosterPositions,
    benchCount,
    taxiCount,
    reserveCount,
    scoring: scoringGroups,
    playoffs,
    tradesAndWaivers,
    rawScoring: scoring,
    season: league.season,
    leagueName: league.name,
    status: league.status,
  };
}
