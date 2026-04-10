export interface TeamInfo {
  id: number;
  name: string;
  logo?: string;
  // opcionales (datos enriquecidos cuando estén disponibles)
  form?: string;
  form_points?: number;
  attack?: number;
  defense?: number;
}

export interface LeagueInfo {
  id: number;
  sofascore_id?: number;
  name: string;
  country?: string;
  logo?: string;
  avg_goals?: number;
}

export interface OddsInfo {
  home?: number;
  draw?: number;
  away?: number;
  over_25?: number;
  under_25?: number;
  btts_yes?: number;
  btts_no?: number;
}

export interface H2HInfo {
  home_wins: number;
  draws: number;
  away_wins: number;
  last_meetings: Array<{ score: string; date: string }>;
}

export interface ValueBet {
  market: string;
  pick: string;
  our_prob: number;
  fair_odds: number;
  edge: number;
}

export interface ScoreEntry {
  home: number;
  away: number;
  prob: number;
}

export interface Prediction {
  match_id: number;
  prob_home_win: number;
  prob_draw: number;
  prob_away_win: number;
  prob_over_25: number;
  prob_under_25: number;
  prob_btts: number;
  prob_no_btts: number;
  prob_over_35: number;
  prob_under_35: number;
  // Corners
  prob_over_95_corners?: number | null;
  prob_under_95_corners?: number | null;
  expected_home_corners?: number | null;
  expected_away_corners?: number | null;
  // Tarjetas
  prob_over_35_cards?: number | null;
  prob_under_35_cards?: number | null;
  expected_home_cards?: number | null;
  expected_away_cards?: number | null;
  // Goles
  expected_home_goals: number;
  expected_away_goals: number;
  predicted_score: string;
  confidence_score: number;
  risk_level: 'low' | 'medium' | 'high';
  value_bets: ValueBet[];
  score_distribution: ScoreEntry[];
  analysis_notes: string[];
  match_summary?: string;
  smart_bet?: SmartBet | null;
  model_version?: string;
}

export interface SmartBetPick {
  label: string;
  market: string;
  prob: number;
}

export interface SmartBet {
  type: string | null;
  picks: SmartBetPick[];
  combined_prob: number;
  estimated_odds: number;
  warning?: string;
  message?: string;
}

export interface MatchStats {
  home_possession?: number;  away_possession?: number;
  home_shots?: number;       away_shots?: number;
  home_shots_on_target?: number; away_shots_on_target?: number;
  home_xg?: number;          away_xg?: number;
  home_corners?: number;     away_corners?: number;
  home_yellow_cards?: number; away_yellow_cards?: number;
  home_red_cards?: number;   away_red_cards?: number;
}

export interface MatchEventItem {
  type: string;
  minute: number;
  extra?: number;
  is_home: boolean;
  player?: string;
  player2?: string;
}

export interface Match {
  id: number;
  sofascore_id?: number;
  league: LeagueInfo;
  home_team: TeamInfo;
  away_team: TeamInfo;
  match_date: string;
  round?: string;
  status: string;
  home_score?: number | null;
  away_score?: number | null;
  home_score_ht?: number | null;
  away_score_ht?: number | null;
  venue?: string;
  referee?: string;
  weather?: string;
  importance?: string;
  odds?: OddsInfo;
  h2h?: H2HInfo;
  stats?: MatchStats;
  events?: MatchEventItem[];
  prediction?: Prediction;
}

export interface LeagueGroup {
  league_id: number;
  league_name: string;
  league_country: string;
  league_logo: string;
  matches: Match[];
}

export interface TodayResponse {
  groups: LeagueGroup[];
  total: number;
}

export interface League {
  id: number;
  sofascore_id?: number;
  name: string;
  country: string;
  avg_goals: number;
  logo?: string;
  season?: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
}

export interface SavedBet {
  id: number;
  match_id: number;
  bet_type: string;
  bet_pick: string;
  odds?: number;
  stake?: number;
  status: string;
  notes?: string;
  created_at: string;
}

// Nuevos status del API (valores en inglés minúscula)
export const FINISHED_STATUSES = ['finished', 'FT', 'AET', 'PEN', 'AWD', 'WO'];
export const LIVE_STATUSES     = ['live', 'halftime', '1H', 'HT', '2H', 'ET', 'BT', 'P', 'INT', 'LIVE'];
