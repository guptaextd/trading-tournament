import { db } from '@/lib/db';
import { Competition, MarketType, TournamentStatus } from '@/types';

export const assistantTools = [
  {
    name: 'search_competitions',
    description: 'Search the database of live, upcoming, and ended trading competitions across crypto, forex, prop firms, and stocks.',
    input_schema: {
      type: 'object' as const,
      properties: {
        market: {
          type: 'string',
          description: 'Market category: crypto, forex, futures, stocks, copy_trading, demo, prop_firm',
        },
        country: {
          type: 'string',
          description: 'Country or region eligibility, e.g., India, USA, UK, EU, UAE, Global',
        },
        free: {
          type: 'boolean',
          description: 'True for 100% free entry competitions, false for paid entry or evaluations',
        },
        status: {
          type: 'string',
          enum: ['live', 'upcoming', 'ended', 'all'],
          description: 'Tournament status: live, upcoming, ended, or all',
        },
        minPrize: {
          type: 'number',
          description: 'Minimum prize pool amount in USD',
        },
        format: {
          type: 'string',
          enum: ['online', 'offline', 'all'],
          description: 'Online or offline/in-person event',
        },
        query: {
          type: 'string',
          description: 'Free text search keyword for title, broker, or coin',
        }
      }
    }
  },
  {
    name: 'get_competition_details',
    description: 'Get full rules, prize breakdown, entry requirements, and dates for a specific competition by its ID.',
    input_schema: {
      type: 'object' as const,
      properties: {
        id: {
          type: 'string',
          description: 'The unique competition ID, e.g., comp-wsot-2026',
        }
      },
      required: ['id']
    }
  },
  {
    name: 'get_platform_info',
    description: 'Get verified details about an exchange, broker, or prop firm including trust score, years active, and regulation status.',
    input_schema: {
      type: 'object' as const,
      properties: {
        nameOrId: {
          type: 'string',
          description: 'The platform name or ID, e.g. Binance, Bybit, FTMO, IC Markets',
        }
      },
      required: ['nameOrId']
    }
  }
];

export function executeTool(toolName: string, args: any) {
  if (toolName === 'search_competitions') {
    const entryFilter = args.free === true ? 'free' : args.free === false ? 'paid' : 'all';
    const result = db.getCompetitions({
      market: args.market as MarketType,
      country: args.country,
      entry: entryFilter,
      status: args.status || 'live',
      minPrize: args.minPrize,
      format: args.format,
      search: args.query
    });

    return {
      totalFound: result.total,
      competitions: result.items.slice(0, 5).map(c => ({
        id: c.id,
        title: c.title,
        platform: c.platform?.name,
        prize_pool: c.prize_pool,
        currency: c.currency,
        market_type: c.market_type,
        entry_fee: c.entry_fee,
        start_date: c.start_date,
        end_date: c.end_date,
        country_eligibility: c.country_eligibility,
        status: c.status,
        legitimacy_score: c.legitimacy_score,
        official_url: c.official_url
      }))
    };
  }

  if (toolName === 'get_competition_details') {
    const res = db.getCompetitionById(args.id);
    if (!res) return { error: 'Competition not found' };
    const c = res.competition;
    return {
      id: c.id,
      title: c.title,
      platform: c.platform?.name,
      description: c.description,
      prize_pool: c.prize_pool,
      currency: c.currency,
      market_type: c.market_type,
      entry_fee: c.entry_fee,
      entry_requirements: c.entry_requirements,
      evaluation_metric: c.evaluation_metric,
      rules_summary: c.rules_summary,
      prize_breakdown: c.prize_breakdown,
      start_date: c.start_date,
      end_date: c.end_date,
      status: c.status,
      country_eligibility: c.country_eligibility,
      official_url: c.official_url
    };
  }

  if (toolName === 'get_platform_info') {
    const platforms = db.getPlatforms();
    const query = (args.nameOrId || '').toLowerCase();
    const plt = platforms.find(p => p.id.toLowerCase() === query || p.name.toLowerCase().includes(query) || p.slug.toLowerCase() === query);
    if (!plt) return { error: 'Platform not found' };
    return {
      id: plt.id,
      name: plt.name,
      type: plt.type,
      verified: plt.verified,
      years_active: plt.years_active,
      trust_score: plt.trust_score,
      regulation_status: plt.regulation_status,
      headquarters: plt.headquarters,
      website_url: plt.website_url
    };
  }

  return { error: `Unknown tool: ${toolName}` };
}
