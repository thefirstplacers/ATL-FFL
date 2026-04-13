export interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  status: string;
  total_rosters: number;
  previous_league_id: string | null;
  settings: Record<string, number>;
  scoring_settings: Record<string, number>;
  roster_positions: string[];
  metadata?: Record<string, string>;
}

export interface SleeperUser {
  user_id: string;
  display_name: string;
  avatar: string | null;
  metadata?: {
    team_name?: string;
    [key: string]: string | undefined;
  };
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  co_owners?: string[] | null;
  players: string[];
  starters: string[];
  reserve?: string[];
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
    fpts_decimal?: number;
    fpts_against?: number;
    fpts_against_decimal?: number;
    ppts?: number;
    ppts_decimal?: number;
  };
  metadata?: {
    division?: string;
    [key: string]: string | undefined;
  };
}

export interface SleeperMatchup {
  roster_id: number;
  matchup_id: number;
  points: number;
  starters: string[];
  starters_points: number[];
  players: string[];
  players_points: Record<string, number>;
}

export interface SleeperPlayer {
  player_id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  position: string;
  team: string | null;
  age?: number;
  years_exp?: number;
  status?: string;
  fantasy_positions?: string[];
  search_full_name?: string;
}

export interface SleeperTransaction {
  transaction_id: string;
  type: string;
  status: string;
  roster_ids: number[];
  adds: Record<string, number> | null;
  drops: Record<string, number> | null;
  draft_picks?: Array<{
    season: string;
    round: number;
    roster_id: number;
    previous_owner_id: number;
    owner_id: number;
  }>;
  waiver_budget?: Array<{
    sender: number;
    receiver: number;
    amount: number;
  }>;
  settings?: {
    waiver_bid?: number;
  };
  created: number;
  creator: string;
  consenter_ids?: number[];
  leg?: number;
  metadata?: Record<string, string>;
}

export interface SleeperDraftPick {
  round: number;
  roster_id: number;
  player_id: string;
  picked_by: string;
  pick_no: number;
  metadata?: {
    first_name?: string;
    last_name?: string;
    team?: string;
    position?: string;
    [key: string]: string | undefined;
  };
}

export interface SleeperDraft {
  draft_id: string;
  league_id: string;
  season: string;
  type: string;
  status: string;
  settings: Record<string, number>;
  draft_order?: Record<string, number>;
}

export interface BracketMatch {
  r: number; // round
  m: number; // match number
  t1: number | { w?: number; l?: number }; // team 1 (roster_id or reference)
  t2: number | { w?: number; l?: number }; // team 2
  w: number; // winner roster_id
  l: number; // loser roster_id
  t1_from?: { w?: number; l?: number };
  t2_from?: { w?: number; l?: number };
}

export interface ManagerInfo {
  odersleeperId: string;
  name: string;
  location: string;
  photo: string;
  fantasyStart: number | null;
  favoriteTeam: string;
  bio: string;
  mode: string;
  rivalName: string;
  rivalImage: string;
  favoritePlayer: number | null;
  valuePosition: string;
  rookieOrVets: string;
  philosophy: string;
  tradingScale: number;
  preferredContact: string;
}

export interface TeamData {
  rosterId: number;
  ownerId: string;
  coOwners: string[];
  managerName: string;
  teamName: string;
  division: number;
  divisionName: string;
  record: { wins: number; losses: number; ties: number };
  pointsFor: number;
  pointsAgainst: number;
  avatarUrl: string | null;
}

export interface WeekMatchup {
  matchupId: number;
  team1: { rosterId: number; points: number };
  team2: { rosterId: number; points: number };
}

export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  description?: string;
  image?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  category: string;
}
