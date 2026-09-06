-- ==============================================================================
-- AlphaArena (Trading Tournament Aggregator) Supabase Schema
-- Paste this script into your Supabase Dashboard -> SQL Editor and click "RUN"
-- ==============================================================================

-- 1. Platforms Table
CREATE TABLE IF NOT EXISTS platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT NOT NULL,
  type TEXT NOT NULL,
  verified BOOLEAN DEFAULT true,
  years_active INTEGER DEFAULT 1,
  regulation_status TEXT,
  headquarters TEXT,
  trust_score INTEGER DEFAULT 90,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Competitions Table
CREATE TABLE IF NOT EXISTS competitions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  platform_id TEXT NOT NULL REFERENCES platforms(id) ON DELETE CASCADE,
  description TEXT,
  prize_pool NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  market_type TEXT NOT NULL,
  entry_fee NUMERIC,
  entry_requirements TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  country_eligibility JSONB DEFAULT '["Global"]'::jsonb,
  format TEXT DEFAULT 'online',
  team_type TEXT DEFAULT 'solo',
  official_url TEXT NOT NULL,
  featured BOOLEAN DEFAULT false,
  legitimacy_score INTEGER DEFAULT 95,
  evaluation_metric TEXT,
  rules_summary JSONB DEFAULT '[]'::jsonb,
  prize_breakdown JSONB DEFAULT '[]'::jsonb,
  participant_count INTEGER,
  participant_count_source_text TEXT,
  participant_count_confidence TEXT DEFAULT 'unavailable',
  participant_count_url TEXT,
  participant_count_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  submitted_by TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  competition_data JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Results Table
CREATE TABLE IF NOT EXISTS results (
  id TEXT PRIMARY KEY,
  competition_id TEXT,
  competition_title TEXT NOT NULL,
  platform_name TEXT NOT NULL,
  market_type TEXT NOT NULL,
  year INTEGER NOT NULL,
  month TEXT NOT NULL,
  total_prize_awarded NUMERIC DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  winners JSONB DEFAULT '[]'::jsonb,
  highlights TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Hall of Fame Table
CREATE TABLE IF NOT EXISTS hall_of_fame (
  id TEXT PRIMARY KEY,
  trader_handle TEXT NOT NULL,
  real_name TEXT,
  avatar_url TEXT,
  country TEXT,
  bio TEXT,
  total_prize_money NUMERIC DEFAULT 0,
  championships_won INTEGER DEFAULT 0,
  best_roi_percent NUMERIC DEFAULT 0,
  market_specialty TEXT NOT NULL,
  famous_competitions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  market_preferences JSONB DEFAULT '["all"]'::jsonb,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Participant Count History Table
CREATE TABLE IF NOT EXISTS participant_count_history (
  id TEXT PRIMARY KEY,
  competition_id TEXT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  count INTEGER,
  confidence TEXT NOT NULL DEFAULT 'high',
  checked_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_participant_history_comp_date ON participant_count_history(competition_id, checked_at DESC);

-- 8. Participant Count Anomaly Flags Table
CREATE TABLE IF NOT EXISTS participant_count_flags (
  id TEXT PRIMARY KEY,
  competition_id TEXT NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  previous_count INTEGER,
  attempted_count INTEGER,
  raw_extraction JSONB NOT NULL DEFAULT '{}'::jsonb,
  resolved BOOLEAN DEFAULT false,
  resolution_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_participant_flags_status ON participant_count_flags(resolved, created_at DESC);

-- Enable Row Level Security (RLS) & Public Policies
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read platforms" ON platforms FOR SELECT USING (true);
CREATE POLICY "Public insert platforms" ON platforms FOR INSERT WITH CHECK (true);

ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read competitions" ON competitions FOR SELECT USING (true);
CREATE POLICY "Public insert competitions" ON competitions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update competitions" ON competitions FOR UPDATE USING (true);

ALTER TABLE participant_count_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read participant_count_history" ON participant_count_history FOR SELECT USING (true);
CREATE POLICY "Public insert participant_count_history" ON participant_count_history FOR INSERT WITH CHECK (true);

ALTER TABLE participant_count_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read participant_count_flags" ON participant_count_flags FOR SELECT USING (true);
CREATE POLICY "Public insert participant_count_flags" ON participant_count_flags FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update participant_count_flags" ON participant_count_flags FOR UPDATE USING (true);

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public select submissions" ON submissions FOR SELECT USING (true);
CREATE POLICY "Public insert submissions" ON submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update submissions" ON submissions FOR UPDATE USING (true);

ALTER TABLE results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read results" ON results FOR SELECT USING (true);
CREATE POLICY "Public insert results" ON results FOR INSERT WITH CHECK (true);

ALTER TABLE hall_of_fame ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read hall_of_fame" ON hall_of_fame FOR SELECT USING (true);
CREATE POLICY "Public insert hall_of_fame" ON hall_of_fame FOR INSERT WITH CHECK (true);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public select subscribers" ON subscribers FOR SELECT USING (true);
CREATE POLICY "Public insert subscribers" ON subscribers FOR INSERT WITH CHECK (true);

-- Initial Platforms Seed
INSERT INTO platforms (id, name, slug, logo_url, website_url, type, verified, years_active, regulation_status, headquarters, trust_score, description) VALUES
  ('plt-binance', 'Binance', 'binance', 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=128&auto=format&fit=crop&q=80', 'https://www.binance.com', 'exchange', true, 8, 'Multi-jurisdictional (Dubai VARA, France AMF, Italy OAM)', 'Global / UAE', 98, 'The world’s largest cryptocurrency exchange by trading volume, famous for its annual Futures Grand Prix tournaments.'),
  ('plt-bybit', 'Bybit', 'bybit', 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=128&auto=format&fit=crop&q=80', 'https://www.bybit.com', 'exchange', true, 7, 'Regulated (Dubai VARA, Cyprus CySEC)', 'Dubai, UAE', 96, 'Pioneers of the iconic World Series of Trading (WSOT), hosting team and individual tournaments with up to $10,000,000 in prizes.'),
  ('plt-ftmo', 'FTMO', 'ftmo', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=128&auto=format&fit=crop&q=80', 'https://ftmo.com', 'prop_firm', true, 10, 'EU Corporate Governance (Czech Republic Regulated Entity)', 'Prague, Czech Republic', 97, 'The global benchmark for modern prop trading firms, hosting regular free monthly challenges with funded accounts.'),
  ('plt-worldcup', 'World Cup Championship of Futures Trading', 'world-cup-trading', 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=128&auto=format&fit=crop&q=80', 'https://www.worldcupchampionships.com', 'offline_championship', true, 42, 'NFA / CFTC Supervised Broker Accounts (USA)', 'Chicago, USA', 99, 'The most prestigious and authentic real-money trading championship in the world since 1983.')
ON CONFLICT (id) DO NOTHING;

-- Initial Competitions Seed
INSERT INTO competitions (id, title, slug, platform_id, description, prize_pool, currency, market_type, entry_fee, entry_requirements, start_date, end_date, country_eligibility, format, team_type, official_url, featured, legitimacy_score, evaluation_metric, rules_summary, prize_breakdown) VALUES
  ('comp-wsot-2026', 'Bybit WSOT 2026 (World Series of Trading)', 'bybit-wsot-2026', 'plt-bybit', 'The flagship crypto tournament of the year. Compete individually or assemble a 10+ trader squad to battle for a record-shattering $10,000,000 USDT prize pool.', 10000000, 'USDT', 'crypto', NULL, 'Minimum wallet net asset value of 500 USDT.', '2026-08-20T00:00:00Z', '2026-09-28T23:59:59Z', '["Global", "India", "UAE", "Germany", "Japan"]'::jsonb, 'online', 'both', 'https://www.bybit.com/wsot2026', true, 98, 'Highest Team PnL % (50%) & Individual Profit Volume (50%)', '["Minimum $50,000 derivatives trading volume.", "Hedging across sub-accounts prohibited."]'::jsonb, '[{"rank": "Squad 1st Place", "reward": "2,400,000 USDT"}, {"rank": "Solo PnL Champion", "reward": "1,000,000 USDT"}]'::jsonb),
  ('comp-ftmo-free-sep', 'FTMO Global Autumn Prop Challenge', 'ftmo-global-autumn-prop-challenge', 'plt-ftmo', 'Free-to-enter monthly simulation challenge. Top 20 performers receive free $100k & $200k Evaluation Accounts.', 650000, 'USD', 'prop_firm', 0, 'Open to all traders worldwide. Strictly 1 entry per individual.', '2026-09-01T00:00:00Z', '2026-09-30T23:59:59Z', '["Global"]'::jsonb, 'online', 'solo', 'https://ftmo.com/free-challenge', true, 97, 'Highest Account Balance with strict Drawdown limits (<5% max daily, <10% max total)', '["Max daily drawdown 5%.", "No weekend overnight holding without approval."]'::jsonb, '[{"rank": "1st Place", "reward": "$200,000 FTMO Account + $10,000 Cash"}]'::jsonb),
  ('comp-worldcup-2026', 'World Cup Championship of Futures Trading 2026', 'world-cup-championship-futures-2026', 'plt-worldcup', 'The official 42nd Annual World Cup Trading Championship. Real money accounts, real audited returns.', 250000, 'USD', 'futures', 10000, 'Real money funded futures account with minimum $10,000 starting deposit.', '2026-01-01T00:00:00Z', '2026-12-31T23:59:59Z', '["Global", "USA", "UK", "EU", "Canada", "Singapore"]'::jsonb, 'online', 'solo', 'https://www.worldcupchampionships.com', true, 99, 'Highest Net Percentage Profit over 12 full months', '["Real money live brokerage accounts.", "Must execute a minimum of 10 trades over the competition year."]'::jsonb, '[{"rank": "World Champion Bull Trophy", "reward": "Legendary Bull Trophy + Cash Prizes"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;
