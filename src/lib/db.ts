import fs from 'fs';
import path from 'path';
import { 
  Competition, 
  Platform, 
  Submission, 
  HallOfFameTrader, 
  TournamentResult, 
  AlertSubscriber,
  CompetitionFilterParams,
  PlatformFilterParams,
  ParticipantCountHistory,
  ParticipantCountFlag,
  ParticipantConfidence
} from '@/types';
import { initialPlatforms } from './data/platforms';
import { initialCompetitions, computeStatus } from './data/competitions';
import { initialResults } from './data/results';
import { initialHallOfFame } from './data/hall-of-fame';

interface DatabaseData {
  platforms: Platform[];
  competitions: Omit<Competition, 'status'>[];
  submissions: Submission[];
  results: TournamentResult[];
  hallOfFame: HallOfFameTrader[];
  subscribers: AlertSubscriber[];
  participantCountHistory: ParticipantCountHistory[];
  participantCountFlags: ParticipantCountFlag[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Memory cache
let memoryDb: DatabaseData | null = null;

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // Ignored if cannot create on readonly
    }
  }
}

function loadDb(): DatabaseData {
  if (memoryDb) return memoryDb;

  ensureDataDir();

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDb = JSON.parse(raw);
      if (!memoryDb!.participantCountHistory) memoryDb!.participantCountHistory = [];
      if (!memoryDb!.participantCountFlags) memoryDb!.participantCountFlags = [];
      ensureSeedMonitoringData(memoryDb!);
      return memoryDb!;
    } catch {
      console.warn('Failed to parse db.json, falling back to seed data.');
    }
  }

  // Initial seed submissions
  const initialSubmissions: Submission[] = [
    {
      id: 'sub-1',
      submitted_by: 'Alex Morgan (Apex Trader Rep)',
      contact_email: 'partners@apextraderfunding.com',
      competition_data: {
        platform_name: 'Apex Trader Funding',
        platform_type: 'prop_firm',
        platform_website: 'https://apextraderfunding.com',
        title: 'Apex Micro-Futures Blitz (October)',
        description: 'Micro-contracts only fast scalping tournament with $250k prize pool.',
        prize_pool: 250000,
        currency: 'USD',
        market_type: 'futures',
        entry_fee: 30,
        entry_requirements: 'Valid Apex tournament account.',
        start_date: '2026-10-10T13:30:00Z',
        end_date: '2026-10-25T20:00:00Z',
        country_eligibility: ['Global', 'USA', 'UK', 'EU', 'India'],
        format: 'online',
        team_type: 'solo',
        official_url: 'https://apextraderfunding.com/micro-blitz',
        evaluation_metric: 'Highest Micro Futures PnL'
      },
      status: 'pending',
      ai_quality_note: 'QUALITY_SCORE: [5/5]\nFLAGS: [none]\nNOTE: Verified futures prop firm evaluation with standard micro contracts rules.',
      submitted_at: '2026-09-05T14:30:00Z'
    },
    {
      id: 'sub-2',
      submitted_by: 'Community Trader @CryptoRider',
      contact_email: 'trader.alex@gmail.com',
      competition_data: {
        platform_name: 'Bybit',
        platform_type: 'exchange',
        platform_website: 'https://www.bybit.com',
        title: 'Solana Ecosystem Futures Derby',
        description: 'Trade SOL and Solana-based perpetuals for a 150,000 USDT prize pool.',
        prize_pool: 150000,
        currency: 'USDT',
        market_type: 'crypto',
        entry_fee: null,
        entry_requirements: 'Min 100 USDT balance.',
        start_date: '2026-09-22T00:00:00Z',
        end_date: '2026-10-05T23:59:59Z',
        country_eligibility: ['Global'],
        format: 'online',
        team_type: 'solo',
        official_url: 'https://www.bybit.com/sol-derby',
        evaluation_metric: 'SOL Pairs ROI %'
      },
      status: 'pending',
      ai_quality_note: 'QUALITY_SCORE: [4/5]\nFLAGS: [Community submitted; verify official Bybit campaign landing page]\nNOTE: Realistic prize pool matching previous Bybit seasonal side-events.',
      submitted_at: '2026-09-06T08:15:00Z'
    }
  ];

  memoryDb = {
    platforms: [...initialPlatforms],
    competitions: [...initialCompetitions],
    submissions: initialSubmissions,
    results: [...initialResults],
    hallOfFame: [...initialHallOfFame],
    subscribers: [],
    participantCountHistory: [],
    participantCountFlags: []
  };

  ensureSeedMonitoringData(memoryDb);
  saveDb(memoryDb);
  return memoryDb;
}

function ensureSeedMonitoringData(data: DatabaseData) {
  // Update Bybit WSOT with rich participant metadata if not yet set
  const wsot = data.competitions.find(c => c.id === 'comp-wsot-2026');
  if (wsot && !wsot.participant_count_source_text) {
    wsot.participant_count = 84210;
    wsot.participant_count_source_text = '84,210 Traders Registered for WSOT 2026 Squad & Solo Divisions';
    wsot.participant_count_confidence = 'high';
    wsot.participant_count_url = 'https://www.bybit.com/wsot2026';
    wsot.participant_count_checked_at = new Date(Date.now() - 12 * 60000).toISOString();
  }

  const binance = data.competitions.find(c => c.id === 'comp-binance-futures-grand-prix');
  if (binance && !binance.participant_count_source_text) {
    binance.participant_count = 42300;
    binance.participant_count_source_text = '42,300 Participants Joined Grand Prix';
    binance.participant_count_confidence = 'high';
    binance.participant_count_url = 'https://www.binance.com/futures-grand-prix';
    binance.participant_count_checked_at = new Date(Date.now() - 28 * 60000).toISOString();
  }

  const ftmo = data.competitions.find(c => c.id === 'comp-ftmo-free-sep');
  if (ftmo && !ftmo.participant_count_source_text) {
    ftmo.participant_count = 21430;
    ftmo.participant_count_source_text = '21,430 Active Challengers Enrolled';
    ftmo.participant_count_confidence = 'high';
    ftmo.participant_count_url = 'https://ftmo.com/free-challenge';
    ftmo.participant_count_checked_at = new Date(Date.now() - 45 * 60000).toISOString();
  }

  // Seed history if empty
  if (data.participantCountHistory.length === 0) {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // WSOT growth history over 5 days
    data.participantCountHistory.push(
      { id: 'hist-w1', competition_id: 'comp-wsot-2026', count: 68400, confidence: 'high', checked_at: new Date(now - 4 * oneDay).toISOString() },
      { id: 'hist-w2', competition_id: 'comp-wsot-2026', count: 72150, confidence: 'high', checked_at: new Date(now - 3 * oneDay).toISOString() },
      { id: 'hist-w3', competition_id: 'comp-wsot-2026', count: 76900, confidence: 'high', checked_at: new Date(now - 2 * oneDay).toISOString() },
      { id: 'hist-w4', competition_id: 'comp-wsot-2026', count: 80850, confidence: 'high', checked_at: new Date(now - 1 * oneDay).toISOString() },
      { id: 'hist-w5', competition_id: 'comp-wsot-2026', count: 84210, confidence: 'high', checked_at: new Date(now - 12 * 60000).toISOString() }
    );

    // FTMO growth history
    data.participantCountHistory.push(
      { id: 'hist-f1', competition_id: 'comp-ftmo-free-sep', count: 14200, confidence: 'high', checked_at: new Date(now - 3 * oneDay).toISOString() },
      { id: 'hist-f2', competition_id: 'comp-ftmo-free-sep', count: 17850, confidence: 'high', checked_at: new Date(now - 2 * oneDay).toISOString() },
      { id: 'hist-f3', competition_id: 'comp-ftmo-free-sep', count: 19600, confidence: 'high', checked_at: new Date(now - 1 * oneDay).toISOString() },
      { id: 'hist-f4', competition_id: 'comp-ftmo-free-sep', count: 21430, confidence: 'high', checked_at: new Date(now - 45 * 60000).toISOString() }
    );

    // Binance history
    data.participantCountHistory.push(
      { id: 'hist-b1', competition_id: 'comp-binance-futures-grand-prix', count: 35100, confidence: 'high', checked_at: new Date(now - 2 * oneDay).toISOString() },
      { id: 'hist-b2', competition_id: 'comp-binance-futures-grand-prix', count: 39400, confidence: 'high', checked_at: new Date(now - 1 * oneDay).toISOString() },
      { id: 'hist-b3', competition_id: 'comp-binance-futures-grand-prix', count: 42300, confidence: 'high', checked_at: new Date(now - 28 * 60000).toISOString() }
    );
  }

  // Seed 1 sample unresolved anomaly flag if none exist (for the admin review queue)
  if (data.participantCountFlags.length === 0) {
    data.participantCountFlags.push({
      id: 'flag-demo-1',
      competition_id: 'comp-binance-futures-grand-prix',
      competition_title: 'Binance Futures Grand Prix: Autumn Nitro Cup',
      reason: 'Suspicious jump: count jumped from 42,300 to 950,000 (22.4x spike). Likely captured total exchange user base instead of tournament registrations.',
      previous_count: 42300,
      attempted_count: 950000,
      raw_extraction: {
        found: true,
        count: 950000,
        source_phrase: 'Join over 950,000 Active Futures Traders on Binance',
        confidence: 'low',
        reasoning: 'Ambiguous phrase on footer banner: refers to platform-wide traders rather than Grand Prix registrations.'
      },
      resolved: false,
      created_at: new Date(Date.now() - 35 * 60000).toISOString()
    });
  }
}

function saveDb(data: DatabaseData) {
  memoryDb = data;
  try {
    ensureDataDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write db.json:', err);
  }
}

// Attach platform and auto-compute status
function enrichCompetition(comp: Omit<Competition, 'status'>, platforms: Platform[]): Competition {
  const status = computeStatus(comp.start_date, comp.end_date);
  const platform = platforms.find(p => p.id === comp.platform_id);
  return {
    ...comp,
    status,
    platform
  };
}

export const db = {
  getPlatforms(params?: PlatformFilterParams): Platform[] {
    const data = loadDb();
    let result = [...data.platforms];

    if (params?.type && params.type !== 'all') {
      result = result.filter(p => p.type === params.type);
    }
    if (params?.verifiedOnly) {
      result = result.filter(p => p.verified);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.regulation_status.toLowerCase().includes(q)
      );
    }

    return result;
  },

  getPlatformById(id: string): (Platform & { competitions: Competition[] }) | null {
    const data = loadDb();
    const platform = data.platforms.find(p => p.id === id || p.slug === id);
    if (!platform) return null;

    const comps = data.competitions
      .filter(c => c.platform_id === platform.id)
      .map(c => enrichCompetition(c, data.platforms));

    return {
      ...platform,
      competitions: comps
    };
  },

  getCompetitions(params?: CompetitionFilterParams): {
    items: Competition[];
    total: number;
    stats: {
      totalLive: number;
      totalUpcoming: number;
      totalEnded: number;
      totalPrizeUsd: number;
    }
  } {
    const data = loadDb();
    const enriched = data.competitions.map(c => enrichCompetition(c, data.platforms));

    // Calculate global stats across all
    const stats = {
      totalLive: enriched.filter(c => c.status === 'live').length,
      totalUpcoming: enriched.filter(c => c.status === 'upcoming').length,
      totalEnded: enriched.filter(c => c.status === 'ended').length,
      totalPrizeUsd: enriched.reduce((acc, c) => acc + c.prize_pool, 0)
    };

    let filtered = [...enriched];

    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter(c => c.status === params.status);
    }

    if (params?.market && params.market !== 'all') {
      filtered = filtered.filter(c => c.market_type === params.market);
    }

    if (params?.entry && params.entry !== 'all') {
      if (params.entry === 'free') {
        filtered = filtered.filter(c => c.entry_fee === null || c.entry_fee === 0);
      } else if (params.entry === 'paid') {
        filtered = filtered.filter(c => typeof c.entry_fee === 'number' && c.entry_fee > 0);
      }
    }

    if (params?.format && params.format !== 'all') {
      filtered = filtered.filter(c => c.format === params.format);
    }

    if (params?.team && params.team !== 'all') {
      filtered = filtered.filter(c => c.team_type === params.team || c.team_type === 'both');
    }

    if (params?.platformId) {
      filtered = filtered.filter(c => c.platform_id === params.platformId);
    }

    if (params?.beginnerOnly) {
      filtered = filtered.filter(c => c.is_beginner_friendly || c.market_type === 'demo');
    }

    if (params?.country && params.country !== 'all' && params.country !== 'Global') {
      const target = params.country.toLowerCase();
      filtered = filtered.filter(c => 
        c.country_eligibility.some(cn => cn.toLowerCase() === target || cn.toLowerCase() === 'global' || cn.toLowerCase() === 'all countries')
      );
    }

    if (typeof params?.minPrize === 'number') {
      filtered = filtered.filter(c => c.prize_pool >= params.minPrize!);
    }

    if (typeof params?.maxPrize === 'number') {
      filtered = filtered.filter(c => c.prize_pool <= params.maxPrize!);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.platform && c.platform.name.toLowerCase().includes(q)) ||
        c.market_type.toLowerCase().includes(q)
      );
    }

    // Sorting
    const sort = params?.sort || 'ending_soon';
    filtered.sort((a, b) => {
      // Pin featured items slightly if same status
      if (a.featured !== b.featured) {
        return a.featured ? -1 : 1;
      }

      if (sort === 'ending_soon') {
        // Live items ending soon first, then upcoming starting soon
        return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
      } else if (sort === 'starting_soon') {
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      } else if (sort === 'prize_high') {
        return b.prize_pool - a.prize_pool;
      } else if (sort === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sort === 'legitimacy') {
        return b.legitimacy_score - a.legitimacy_score;
      }
      return 0;
    });

    return {
      items: filtered,
      total: filtered.length,
      stats
    };
  },

  getCompetitionById(id: string): { competition: Competition; related: Competition[] } | null {
    const data = loadDb();
    const raw = data.competitions.find(c => c.id === id || c.slug === id);
    if (!raw) return null;

    const competition = enrichCompetition(raw, data.platforms);
    const related = data.competitions
      .filter(c => c.id !== competition.id && (c.platform_id === competition.platform_id || c.market_type === competition.market_type))
      .slice(0, 3)
      .map(c => enrichCompetition(c, data.platforms));

    return { competition, related };
  },

  createCompetition(newComp: Omit<Competition, 'status'>): Competition {
    const data = loadDb();
    data.competitions.unshift(newComp);
    saveDb(data);
    return enrichCompetition(newComp, data.platforms);
  },

  updateCompetition(id: string, updates: Partial<Omit<Competition, 'status'>>): Competition | null {
    const data = loadDb();
    const idx = data.competitions.findIndex(c => c.id === id);
    if (idx === -1) return null;

    data.competitions[idx] = {
      ...data.competitions[idx],
      ...updates
    };
    saveDb(data);
    return enrichCompetition(data.competitions[idx], data.platforms);
  },

  deleteCompetition(id: string): boolean {
    const data = loadDb();
    const prevLen = data.competitions.length;
    data.competitions = data.competitions.filter(c => c.id !== id);
    if (data.competitions.length !== prevLen) {
      saveDb(data);
      return true;
    }
    return false;
  },

  getSubmissions(): Submission[] {
    const data = loadDb();
    return data.submissions;
  },

  createSubmission(submission: Omit<Submission, 'id' | 'status' | 'submitted_at'>): Submission {
    const data = loadDb();
    const newSub: Submission = {
      ...submission,
      id: `sub-${Date.now()}`,
      status: 'pending',
      submitted_at: new Date().toISOString()
    };
    data.submissions.unshift(newSub);
    saveDb(data);
    return newSub;
  },

  updateSubmissionStatus(id: string, status: 'approved' | 'rejected', reason?: string): Submission | null {
    const data = loadDb();
    const sub = data.submissions.find(s => s.id === id);
    if (!sub) return null;

    sub.status = status;
    if (reason) sub.rejection_reason = reason;

    // If approved, automatically convert and publish to live competitions!
    if (status === 'approved') {
      const compData = sub.competition_data;
      // Check if platform exists or create it
      let platform = data.platforms.find(p => p.name.toLowerCase() === compData.platform_name.toLowerCase());
      if (!platform) {
        platform = {
          id: `plt-${Date.now()}`,
          name: compData.platform_name,
          slug: compData.platform_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          logo_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=128&auto=format&fit=crop&q=80',
          website_url: compData.platform_website || 'https://example.com',
          type: compData.platform_type || 'exchange',
          verified: false,
          years_active: 1,
          regulation_status: 'Community Submitted',
          headquarters: 'Global',
          trust_score: 85,
          description: `Platform hosting ${compData.title || 'trading tournaments'}.`
        };
        data.platforms.push(platform);
      }

      const newCompetition: Omit<Competition, 'status'> = {
        id: `comp-${Date.now()}`,
        title: compData.title || 'Submitted Tournament',
        slug: (compData.title || 'tournament').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4),
        platform_id: platform.id,
        description: compData.description || 'Community submitted trading tournament.',
        prize_pool: Number(compData.prize_pool) || 10000,
        currency: compData.currency || 'USD',
        market_type: compData.market_type || 'crypto',
        entry_fee: compData.entry_fee !== undefined ? compData.entry_fee : null,
        entry_requirements: compData.entry_requirements || 'Check official site for requirements.',
        start_date: compData.start_date || new Date().toISOString(),
        end_date: compData.end_date || new Date(Date.now() + 14 * 86400000).toISOString(),
        country_eligibility: compData.country_eligibility && compData.country_eligibility.length > 0 ? compData.country_eligibility : ['Global'],
        format: compData.format || 'online',
        team_type: compData.team_type || 'solo',
        official_url: compData.official_url || compData.platform_website || 'https://example.com',
        featured: false,
        legitimacy_score: 88,
        evaluation_metric: compData.evaluation_metric || 'Highest Net PnL %',
        rules_summary: compData.rules_summary || ['Official competition rules apply upon registration.'],
        prize_breakdown: compData.prize_breakdown || [
          { rank: '1st Place', reward: `${compData.prize_pool || 10000} ${compData.currency || 'USD'}` }
        ],
        is_beginner_friendly: compData.is_beginner_friendly || false,
        participant_count: 100,
        created_at: new Date().toISOString()
      };

      data.competitions.unshift(newCompetition);
    }

    saveDb(data);
    return sub;
  },

  getStats() {
    const data = loadDb();
    const enriched = data.competitions.map(c => enrichCompetition(c, data.platforms));
    const liveCount = enriched.filter(c => c.status === 'live').length;
    const upcomingCount = enriched.filter(c => c.status === 'upcoming').length;
    const endedCount = enriched.filter(c => c.status === 'ended').length;
    const totalPrize = enriched.reduce((acc, c) => acc + (c.prize_pool || 0), 0);
    const platformsCount = data.platforms.length;
    const totalParticipants = enriched.reduce((acc, c) => acc + (c.participant_count || 0), 0);

    return {
      liveCount,
      upcomingCount,
      endedCount,
      totalCompetitions: enriched.length,
      totalPrize,
      platformsCount,
      totalParticipants
    };
  },

  getHallOfFame(): HallOfFameTrader[] {
    const data = loadDb();
    return data.hallOfFame;
  },

  getResults(): TournamentResult[] {
    const data = loadDb();
    return data.results;
  },

  addSubscriber(sub: Omit<AlertSubscriber, 'id' | 'created_at'>): AlertSubscriber {
    const data = loadDb();
    const newSubscriber: AlertSubscriber = {
      ...sub,
      id: `sub-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    data.subscribers.push(newSubscriber);
    saveDb(data);
    return newSubscriber;
  },

  // Participant Monitoring Methods
  updateCompetitionParticipant(
    id: string, 
    update: { 
      count?: number | null; 
      source_text?: string | null; 
      confidence: ParticipantConfidence; 
      url?: string | null; 
      checked_at?: string 
    }
  ): Competition | null {
    const data = loadDb();
    const comp = data.competitions.find(c => c.id === id);
    if (!comp) return null;

    if (update.count !== undefined) comp.participant_count = update.count;
    if (update.source_text !== undefined) comp.participant_count_source_text = update.source_text;
    comp.participant_count_confidence = update.confidence;
    if (update.url !== undefined) comp.participant_count_url = update.url;
    comp.participant_count_checked_at = update.checked_at || new Date().toISOString();

    saveDb(data);
    return enrichCompetition(comp, data.platforms);
  },

  addParticipantHistory(item: Omit<ParticipantCountHistory, 'id'>): ParticipantCountHistory {
    const data = loadDb();
    const newHistory: ParticipantCountHistory = {
      ...item,
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      checked_at: item.checked_at || new Date().toISOString()
    };
    data.participantCountHistory.push(newHistory);
    saveDb(data);
    return newHistory;
  },

  getParticipantHistory(competitionId: string, limit: number = 30): ParticipantCountHistory[] {
    const data = loadDb();
    return data.participantCountHistory
      .filter(h => h.competition_id === competitionId)
      .sort((a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime())
      .slice(-limit);
  },

  addParticipantFlag(flag: Omit<ParticipantCountFlag, 'id' | 'created_at'>): ParticipantCountFlag {
    const data = loadDb();
    const newFlag: ParticipantCountFlag = {
      ...flag,
      id: `flag-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString()
    };
    data.participantCountFlags.unshift(newFlag);
    saveDb(data);
    return newFlag;
  },

  getParticipantFlags(unresolvedOnly: boolean = false): ParticipantCountFlag[] {
    const data = loadDb();
    let result = [...data.participantCountFlags];
    if (unresolvedOnly) {
      result = result.filter(f => !f.resolved);
    }
    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  resolveParticipantFlag(id: string, resolutionNote?: string, applyCount: boolean = false): boolean {
    const data = loadDb();
    const flag = data.participantCountFlags.find(f => f.id === id);
    if (!flag) return false;

    flag.resolved = true;
    if (resolutionNote) flag.resolution_note = resolutionNote;

    if (applyCount && flag.attempted_count !== undefined && flag.attempted_count !== null) {
      const comp = data.competitions.find(c => c.id === flag.competition_id);
      if (comp) {
        comp.participant_count = flag.attempted_count;
        comp.participant_count_confidence = 'medium';
        comp.participant_count_checked_at = new Date().toISOString();
        
        // Add to history as well
        data.participantCountHistory.push({
          id: `hist-${Date.now()}-approved`,
          competition_id: flag.competition_id,
          count: flag.attempted_count,
          confidence: 'medium',
          checked_at: new Date().toISOString()
        });
      }
    }

    saveDb(data);
    return true;
  }
};
