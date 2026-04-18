export const NFL_TEAMS: Record<string, { name: string; city: string; color: string; colorAlt: string; abbr: string }> = {
  ARI: { name: 'Cardinals', city: 'Arizona', color: '#97233F', colorAlt: '#000000', abbr: 'ARI' },
  ATL: { name: 'Falcons', city: 'Atlanta', color: '#A71930', colorAlt: '#000000', abbr: 'ATL' },
  BAL: { name: 'Ravens', city: 'Baltimore', color: '#241773', colorAlt: '#9E7C0C', abbr: 'BAL' },
  BUF: { name: 'Bills', city: 'Buffalo', color: '#00338D', colorAlt: '#C60C30', abbr: 'BUF' },
  CAR: { name: 'Panthers', city: 'Carolina', color: '#0085CA', colorAlt: '#101820', abbr: 'CAR' },
  CHI: { name: 'Bears', city: 'Chicago', color: '#0B162A', colorAlt: '#C83803', abbr: 'CHI' },
  CIN: { name: 'Bengals', city: 'Cincinnati', color: '#FB4F14', colorAlt: '#000000', abbr: 'CIN' },
  CLE: { name: 'Browns', city: 'Cleveland', color: '#311D00', colorAlt: '#FF3C00', abbr: 'CLE' },
  DAL: { name: 'Cowboys', city: 'Dallas', color: '#003594', colorAlt: '#869397', abbr: 'DAL' },
  DEN: { name: 'Broncos', city: 'Denver', color: '#FB4F14', colorAlt: '#002244', abbr: 'DEN' },
  DET: { name: 'Lions', city: 'Detroit', color: '#0076B6', colorAlt: '#B0B7BC', abbr: 'DET' },
  GB: { name: 'Packers', city: 'Green Bay', color: '#203731', colorAlt: '#FFB612', abbr: 'GB' },
  HOU: { name: 'Texans', city: 'Houston', color: '#03202F', colorAlt: '#A71930', abbr: 'HOU' },
  IND: { name: 'Colts', city: 'Indianapolis', color: '#002C5F', colorAlt: '#A2AAAD', abbr: 'IND' },
  JAX: { name: 'Jaguars', city: 'Jacksonville', color: '#006778', colorAlt: '#9F792C', abbr: 'JAX' },
  KC: { name: 'Chiefs', city: 'Kansas City', color: '#E31837', colorAlt: '#FFB81C', abbr: 'KC' },
  LAC: { name: 'Chargers', city: 'Los Angeles', color: '#002A5E', colorAlt: '#FFC20E', abbr: 'LAC' },
  LAR: { name: 'Rams', city: 'Los Angeles', color: '#003594', colorAlt: '#FFA300', abbr: 'LAR' },
  LV: { name: 'Raiders', city: 'Las Vegas', color: '#000000', colorAlt: '#A5ACAF', abbr: 'LV' },
  MIA: { name: 'Dolphins', city: 'Miami', color: '#008E97', colorAlt: '#FC4C02', abbr: 'MIA' },
  MIN: { name: 'Vikings', city: 'Minnesota', color: '#4F2683', colorAlt: '#FFC62F', abbr: 'MIN' },
  NE: { name: 'Patriots', city: 'New England', color: '#002244', colorAlt: '#C60C30', abbr: 'NE' },
  NO: { name: 'Saints', city: 'New Orleans', color: '#D3BC8D', colorAlt: '#101820', abbr: 'NO' },
  NYG: { name: 'Giants', city: 'New York', color: '#0B2265', colorAlt: '#A71930', abbr: 'NYG' },
  NYJ: { name: 'Jets', city: 'New York', color: '#125740', colorAlt: '#000000', abbr: 'NYJ' },
  PHI: { name: 'Eagles', city: 'Philadelphia', color: '#004C54', colorAlt: '#A5ACAF', abbr: 'PHI' },
  PIT: { name: 'Steelers', city: 'Pittsburgh', color: '#FFB612', colorAlt: '#101820', abbr: 'PIT' },
  SEA: { name: 'Seahawks', city: 'Seattle', color: '#002244', colorAlt: '#69BE28', abbr: 'SEA' },
  SF: { name: '49ers', city: 'San Francisco', color: '#AA0000', colorAlt: '#B3995D', abbr: 'SF' },
  TB: { name: 'Buccaneers', city: 'Tampa Bay', color: '#D50A0A', colorAlt: '#FF7900', abbr: 'TB' },
  TEN: { name: 'Titans', city: 'Tennessee', color: '#0C2340', colorAlt: '#4B92DB', abbr: 'TEN' },
  WAS: { name: 'Commanders', city: 'Washington', color: '#5A1414', colorAlt: '#FFB612', abbr: 'WAS' },
};

export const FAVORITE_TEAM_MAP: Record<string, string> = {
  ari: 'ARI', atl: 'ATL', bal: 'BAL', buf: 'BUF', car: 'CAR', chi: 'CHI',
  cin: 'CIN', cle: 'CLE', dal: 'DAL', den: 'DEN', det: 'DET', gb: 'GB',
  hou: 'HOU', ind: 'IND', jax: 'JAX', kc: 'KC', lac: 'LAC', lar: 'LAR',
  lv: 'LV', mia: 'MIA', min: 'MIN', ne: 'NE', no: 'NO', nyg: 'NYG',
  nyj: 'NYJ', phi: 'PHI', pit: 'PIT', sea: 'SEA', sf: 'SF', tb: 'TB',
  ten: 'TEN', was: 'WAS',
};

// Sleeper CDN hosts team logos
export function getTeamLogoUrl(abbr: string): string {
  // Sleeper uses lowercase abbreviation for logos
  const sleeperMap: Record<string, string> = {
    ARI: 'ARI', ATL: 'ATL', BAL: 'BAL', BUF: 'BUF', CAR: 'CAR', CHI: 'CHI',
    CIN: 'CIN', CLE: 'CLE', DAL: 'DAL', DEN: 'DEN', DET: 'DET', GB: 'GB',
    HOU: 'HOU', IND: 'IND', JAX: 'JAX', KC: 'KC', LAC: 'LAC', LAR: 'LAR',
    LV: 'LV', MIA: 'MIA', MIN: 'MIN', NE: 'NE', NO: 'NO', NYG: 'NYG',
    NYJ: 'NYJ', PHI: 'PHI', PIT: 'PIT', SEA: 'SEA', SF: 'SF', TB: 'TB',
    TEN: 'TEN', WAS: 'WAS',
  };
  const key = sleeperMap[abbr] || abbr;
  return `https://sleepercdn.com/images/team_logos/nfl/${key.toLowerCase()}.png`;
}

// Mode tier styling
export const MODE_STYLES: Record<string, { color: string; bg: string }> = {
  'Dynasty': { color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
  'Contender': { color: 'text-green-400', bg: 'bg-green-400/20' },
  'Playoff Team': { color: 'text-blue-400', bg: 'bg-blue-400/20' },
  'Small Market': { color: 'text-gray-400', bg: 'bg-gray-400/20' },
  'Rebuild': { color: 'text-orange-400', bg: 'bg-orange-400/20' },
  'Tanking': { color: 'text-red-400', bg: 'bg-red-400/20' },
};
