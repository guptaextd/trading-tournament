export type MarketType = 
  | 'crypto' 
  | 'forex' 
  | 'stocks' 
  | 'futures' 
  | 'options' 
  | 'copy_trading' 
  | 'demo'
  | 'prop_firm';

export type TournamentStatus = 'live' | 'upcoming' | 'ended';

export type PlatformType = 'exchange' | 'broker' | 'prop_firm' | 'championship';

export type TournamentFormat = 'online' | 'offline';

export type TeamType = 'solo' | 'team' | 'both';

export interface Platform {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  website_url: string;
  type: PlatformType;
  verified: boolean;
  years_active: number;
  regulation_status: string;
  headquarters: string;
  trust_score: number; // 0 - 100
  description: string;
}

export interface PrizeTier {
  rank: string;
  reward: string;
  value?: number;
}

export interface Competition {
  id: string;
  title: string;
  slug: string;
  platform_id: string;
  platform?: Platform;
  description: string;
  prize_pool: number;
  currency: string;
  market_type: MarketType;
  entry_fee: number | null; // null or 0 = Free
  entry_requirements: string;
  start_date: string; // ISO String
  end_date: string;   // ISO String
  country_eligibility: string[];
  format: TournamentFormat;
  team_type: TeamType;
  official_url: string;
  status: TournamentStatus;
  featured: boolean;
  legitimacy_score: number; // 0 - 100
  evaluation_metric: string;
  rules_summary: string[];
  prize_breakdown: PrizeTier[];
  is_beginner_friendly?: boolean;
  created_at: string;
  participant_count?: number | null;
  participant_count_source_text?: string | null;
  participant_count_confidence?: 'high' | 'medium' | 'low' | 'unavailable';
  participant_count_url?: string | null;
  participant_count_checked_at?: string | null;
}

export interface Submission {
  id: string;
  submitted_by: string;
  contact_email: string;
  competition_data: Partial<Competition> & {
    platform_name: string;
    platform_type: PlatformType;
    platform_website: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  ai_quality_note?: string;
  submitted_at: string;
}

export interface HallOfFameTrader {
  id: string;
  handle: string;
  name: string;
  country: string;
  country_code: string;
  avatar_url: string;
  total_prize_money: number;
  tournaments_won: number;
  primary_market: MarketType;
  best_roi: string;
  win_streak: number;
  badges: string[];
  recent_win: string;
}

export interface TournamentResult {
  id: string;
  competition_title: string;
  platform_name: string;
  platform_id: string;
  end_date: string;
  market_type: MarketType;
  total_prize_paid: number;
  currency: string;
  winner_handle: string;
  winner_country: string;
  winner_roi: string;
  winner_prize: string;
  participants: number;
  proof_url: string;
}

export interface AlertSubscriber {
  id: string;
  email: string;
  telegram_handle?: string;
  country: string;
  min_prize: number;
  markets: MarketType[];
  created_at: string;
}

export interface CompetitionFilterParams {
  status?: TournamentStatus | 'all';
  market?: MarketType | 'all';
  entry?: 'all' | 'free' | 'paid';
  format?: TournamentFormat | 'all';
  team?: TeamType | 'all';
  country?: string;
  minPrize?: number;
  maxPrize?: number;
  search?: string;
  platformId?: string;
  beginnerOnly?: boolean;
  sort?: 'ending_soon' | 'starting_soon' | 'prize_high' | 'newest' | 'legitimacy';
}

export interface PlatformFilterParams {
  type?: PlatformType | 'all';
  verifiedOnly?: boolean;
  search?: string;
}

export type ParticipantConfidence = 'high' | 'medium' | 'low' | 'unavailable';

export interface ParticipantCountHistory {
  id: string;
  competition_id: string;
  count: number | null;
  confidence: ParticipantConfidence;
  checked_at: string;
}

export interface ParticipantCountFlag {
  id: string;
  competition_id: string;
  competition_title?: string;
  reason: string;
  previous_count?: number | null;
  attempted_count?: number | null;
  raw_extraction: Record<string, unknown>;
  resolved: boolean;
  resolution_note?: string;
  created_at: string;
}

export interface ExtractionResult {
  found: boolean;
  count?: number;
  source_phrase?: string;
  confidence: 'high' | 'medium' | 'low';
  reasoning: string;
  url: string;
}

export interface MonitoringRunResult {
  competition_id: string;
  competition_title: string;
  status: 'updated' | 'flagged' | 'unavailable' | 'skipped' | 'error';
  previous_count?: number | null;
  new_count?: number | null;
  confidence?: ParticipantConfidence;
  source_phrase?: string;
  reason?: string;
}

