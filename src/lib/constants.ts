export const LEAGUE_ID = '1313984141653463040'; // 2026 (current)
export const PREV_LEAGUE_ID = '1249972596817014784'; // 2025

// Full league history chain. Sleeper era uses real league IDs; the ESPN era
// (league 65402377, pulled via the ESPN read API 2026-09-04) uses 'espn-' ids
// that never match a Sleeper leagueId, so id-based lookups skip them cleanly.
// ESPN also shows a 2022 season (Sasan Assary), but per Grant (2026-09-04)
// that was a phantom year — the Sleeper 2022 season is the canonical one.
export const LEAGUE_HISTORY: Record<string, { id: string; season: number; champion: string; championRosterId: number }> = {
  '2020': { id: 'espn-65402377', season: 2020, champion: 'Team Davis (Grayson Davis)', championRosterId: 0 },
  '2021': { id: 'espn-65402377', season: 2021, champion: 'JT and a Bunch of Scrubs (Tyler Williams)', championRosterId: 0 },
  '2022': { id: '869629467407085568', season: 2022, champion: 'JWill30 (Justin Williams)', championRosterId: 4 },
  '2023': { id: '994777154728611840', season: 2023, champion: 'zachrmiller (Zach Miller)', championRosterId: 2 },
  '2024': { id: '1048835236085313536', season: 2024, champion: 'jabrams823 (Jordan Abrams)', championRosterId: 7 },
  '2025': { id: '1249972596817014784', season: 2025, champion: 'htibill (Bill & Grayson)', championRosterId: 9 },
};

// All league IDs in chronological order
export const ALL_LEAGUE_IDS = [
  '869629467407085568',   // 2022
  '994777154728611840',   // 2023
  '1048835236085313536',  // 2024
  '1249972596817014784',  // 2025
  '1313984141653463040',  // 2026
];

export const LEAGUE_NAME = 'ATL FFL';
export const LEAGUE_EST = 2019; // Originally on ESPN, moved to Sleeper in 2022

export const DIVISIONS: Record<number, string> = {
  1: 'The Hokage',
  2: 'The Emperors',
  3: 'The Z Fighters',
};

export const DIVISION_COLORS: Record<number, string> = {
  1: '#ef4444', // red
  2: '#3b82f6', // blue
  3: '#22c55e', // green
};

export const ROSTER_POSITIONS = ['QB', 'RB', 'RB', 'WR', 'WR', 'TE', 'FLEX', 'K', 'DEF'];
export const BENCH_SLOTS = 6;
export const PLAYOFF_TEAMS = 6;
export const PLAYOFF_START_WEEK = 15;
export const REGULAR_SEASON_WEEKS = 14;
export const TOTAL_WEEKS = 17;
export const TRADE_DEADLINE_WEEK = 12;
export const FAAB_BUDGET = 100;

// 2026 draft — completed Sunday Aug 30, 7:00 PM ET (Sleeper draft 1391940028808065024)
export const DRAFT_DATE = '2026-08-30T19:00:00';
// Week 1 kickoff (Thursday night opener) — homepage countdown target while
// in-season. Explicit ET offset so every visitor counts down to the same moment.
export const KICKOFF_DATE = '2026-09-10T20:20:00-04:00';

// Scoring highlights
export const SCORING = {
  rec: 1, // full PPR
  pass_yd: 0.04,
  pass_td: 4,
  pass_int: -1,
  rush_yd: 0.1,
  rush_td: 6,
  rec_yd: 0.1,
  rec_td: 6,
  fum_lost: -2,
  def_sack: 1,
  def_td: 6,
  def_int: 2,
  def_saf: 2,
};

// Map roster_id (from 2025 season) to owner info
export const MANAGER_INFO: Record<string, {
  name: string;
  coManagerName?: string;
  location: string;
  photo: string;
  favoriteTeam: string;
  fantasyStart: number | null;
  bio: string;
  mode: string;
  rivalName: string;
  rivalPhoto: string;
  philosophy: string;
  tradingScale: number;
  preferredContact: string;
  favoritePosition: string;
}> = {
  '869658110913105920': {
    name: 'Bill',
    coManagerName: 'Grayson',
    location: 'Alpharetta',
    photo: '/managers/billgrayson.jpg',
    favoriteTeam: 'atl',
    fantasyStart: 2014,
    bio: 'the Unicorns - 2025 Champions!',
    mode: 'Contender',
    rivalName: 'Everyone',
    rivalPhoto: '/managers/everyone.png',
    philosophy: 'Consistency is key',
    tradingScale: 1,
    preferredContact: 'Carrier Pigeon',
    favoritePosition: 'WR',
  },
  '869629223269203968': {
    name: 'Grant',
    coManagerName: 'Melissa',
    location: 'Atlanta',
    photo: '/managers/grantmelissa1.jpg',
    favoriteTeam: 'kc',
    fantasyStart: null,
    bio: 'Commissioner',
    mode: 'Small Market',
    rivalName: 'Tyler',
    rivalPhoto: '/managers/tyler.jpg',
    philosophy: 'There is nothing impossible to him who will try',
    tradingScale: 10,
    preferredContact: 'Text',
    favoritePosition: 'RB',
  },
  '869715651588239360': {
    name: 'Carter Grimes',
    location: 'Atlanta',
    photo: '/managers/carter.jpg',
    favoriteTeam: 'dal',
    fantasyStart: 2021,
    bio: 'Lord of the Scraps',
    mode: 'Rebuild',
    rivalName: 'Garrett',
    rivalPhoto: '/managers/garrett1.jpg',
    philosophy: '',
    tradingScale: 7,
    preferredContact: 'Sleeper',
    favoritePosition: 'WR',
  },
  '864909340086226944': {
    name: 'Jordan Abrams',
    location: 'Atlanta',
    photo: '/managers/jordan.jpg',
    favoriteTeam: 'atl',
    fantasyStart: 2021,
    bio: 'Thank you, thank you',
    mode: 'Dynasty',
    rivalName: 'Jim',
    rivalPhoto: '/managers/jim.jpg',
    philosophy: '',
    tradingScale: 10,
    preferredContact: 'Sleeper',
    favoritePosition: 'RB',
  },
  '736961246087241728': {
    name: 'Garrett Davis',
    location: 'Atlanta',
    photo: '/managers/garrett1.jpg',
    favoriteTeam: 'atl',
    fantasyStart: 2015,
    bio: 'Egbukake',
    mode: 'Playoff Team',
    rivalName: 'League Champ',
    rivalPhoto: '/managers/zach.jpg',
    philosophy: '',
    tradingScale: 10,
    preferredContact: 'Text',
    favoritePosition: 'WR',
  },
  '674798465431216128': {
    name: 'Ricky Mohrig',
    location: 'Atlanta',
    photo: '/managers/ricky1.jpg',
    favoriteTeam: 'atl',
    fantasyStart: 2012,
    bio: 'Illegally LaPorted',
    mode: 'Small Market',
    rivalName: 'Garrett',
    rivalPhoto: '/managers/garrett1.jpg',
    philosophy: '',
    tradingScale: 8,
    preferredContact: 'Text',
    favoritePosition: 'WR',
  },
  '865087831142465536': {
    name: 'Zach Miller',
    location: 'Atlanta',
    photo: '/managers/zach.jpg',
    favoriteTeam: 'atl',
    fantasyStart: 2015,
    bio: 'Best to Worst',
    mode: 'Dynasty',
    rivalName: 'Garrett',
    rivalPhoto: '/managers/garrett1.jpg',
    philosophy: '',
    tradingScale: 5,
    preferredContact: 'Text',
    favoritePosition: 'QB',
  },
  '857978234233556992': {
    name: 'Matt Sims',
    location: 'Atlanta',
    photo: '/managers/question.jpg',
    favoriteTeam: 'atl',
    fantasyStart: 2024,
    bio: 'Wife Beater',
    mode: 'Tanking',
    rivalName: 'Everyone',
    rivalPhoto: '/managers/everyone.png',
    philosophy: '',
    tradingScale: 3,
    preferredContact: 'Text',
    favoritePosition: 'RB',
  },
  '869641185436807168': {
    name: 'Justin Williams',
    location: 'Atlanta',
    photo: '/managers/justin.jpg',
    favoriteTeam: 'car',
    fantasyStart: 2019,
    bio: "'25-'26 CHAMPION (self-proclaimed)",
    mode: 'Contender',
    rivalName: 'Grant',
    rivalPhoto: '/managers/grantmelissa1.jpg',
    philosophy: '',
    tradingScale: 6,
    preferredContact: 'Sleeper',
    favoritePosition: 'QB',
  },
  '869653222627909632': {
    name: 'Mike',
    coManagerName: 'Brownsugarbish',
    location: 'Atlanta',
    photo: '/managers/mike.jpg',
    favoriteTeam: 'atl',
    fantasyStart: 2019,
    bio: 'Rush Hour 4',
    mode: 'Rebuild',
    rivalName: 'Everyone',
    rivalPhoto: '/managers/everyone.png',
    philosophy: '',
    tradingScale: 4,
    preferredContact: 'Sleeper',
    favoritePosition: 'WR',
  },
  '676175709789556736': {
    name: 'Tyler',
    location: 'Atlanta',
    photo: '/managers/tyler.jpg',
    favoriteTeam: 'car',
    fantasyStart: 2019,
    bio: 'I cry evrytim :,(',
    mode: 'Rebuild',
    rivalName: 'Grant',
    rivalPhoto: '/managers/grantmelissa1.jpg',
    philosophy: '',
    tradingScale: 5,
    preferredContact: 'Text',
    favoritePosition: 'RB',
  },
  '869685304523677696': {
    name: 'Jim',
    location: 'Atlanta',
    photo: '/managers/jim.jpg',
    favoriteTeam: 'chi',
    fantasyStart: 2019,
    bio: "Buck-ees Bucs",
    mode: 'Rebuild',
    rivalName: 'Jordan',
    rivalPhoto: '/managers/jordan.jpg',
    philosophy: '',
    tradingScale: 5,
    preferredContact: 'Sleeper',
    favoritePosition: 'TE',
  },
};
