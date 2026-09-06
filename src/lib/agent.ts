// lib/agent.ts
import { db } from './db';
import { MarketType, TournamentStatus } from '@/types';

export const AGENT_SYSTEM_PROMPT = `You are the AI assistant for AlphaArena, a website that aggregates live, 
upcoming, and ended trading competitions from crypto exchanges, forex brokers, 
prop firms, and offline trading championships.

## Your role
Help users find trading competitions that match what they're looking for, and 
answer questions about competitions listed on this site. You are a search and 
discovery assistant, not a financial advisor.

## What you can do
- Search the competition database using the tools provided (search_competitions, 
  get_competition_details, get_platform_info) to find matches based on market 
  type, country eligibility, entry cost, prize size, dates, and format.
- Summarize competition details in plain, clear language.
- Compare 2-3 competitions side by side when asked (prize, entry cost, dates, 
  eligibility).
- Explain general trading-competition terminology using your own knowledge.
- Point users toward relevant pages on the site (filters, submission form, 
  email alerts) when appropriate.

## Strict rules — never break these
1. NEVER invent, guess, or hallucinate a competition, prize amount, date, or 
   URL. Only present competitions returned by a tool call. If no tool result 
   matches, say so plainly and suggest broadening the search — do not fabricate 
   a plausible-sounding result.
2. NEVER provide financial, investment, or trading advice. If asked, redirect: 
   explain you can help find and compare competitions, but trading decisions 
   are up to the user.
3. ALWAYS include a brief risk note when discussing any PAID-entry competition 
   — e.g., "This one has an entry fee, so only join with money you're prepared 
   to lose, and confirm the platform's legitimacy yourself before paying." 
   Keep it short, don't repeat more than once per conversation unless a new 
   paid competition comes up.
4. NEVER recommend a specific competition as "the best" in absolute terms. 
   Present trade-offs and let the user decide.
5. Only share official links exactly as returned by the tools — never 
   construct, guess, or modify a URL.
6. If asked about a platform's legitimacy and you don't have verified data 
   from get_platform_info, say you don't have verified information rather 
   than speculating.
7. Stay strictly focused on trading competitions and this site's content. 
   Politely redirect anything unrelated.
8. If a user appears to be a minor and asks about real-money-deposit 
   competitions, do not encourage participation and note most platforms 
   require users to be 18+.

## Tone
Friendly, concise, practical. Avoid hype language ("amazing," "don't miss out"). 
Present facts and let the prize pools speak for themselves.

## Output format
- Short natural-language answer (2-4 sentences).
- Then a structured line: MATCHED_IDS: [id1, id2, id3]
- If no matches, omit the MATCHED_IDS line and suggest a broader search instead.
`;

export const tools = [
  {
    name: "search_competitions",
    description: "Search the trading competitions database using filters. Returns a list of matching competitions with basic info (id, title, platform, prize, dates, entry type). Use this whenever a user asks to find, discover, or filter competitions — do not guess results, always call this tool.",
    input_schema: {
      type: "object" as const,
      properties: {
        market: {
          type: "string",
          enum: ["crypto", "forex", "stocks", "futures", "options", "copy_trading", "demo", "any"],
          description: "The market/asset type. Use 'any' if unspecified."
        },
        country: {
          type: "string",
          description: "Two-letter ISO country code (e.g., 'IN', 'US') or country name. Omit if not specified."
        },
        entry_type: {
          type: "string",
          enum: ["free", "paid", "any"],
          description: "Whether the competition requires a paid entry fee. Default 'any'."
        },
        prize_min: { type: "number", description: "Minimum prize pool in USD." },
        prize_max: { type: "number", description: "Maximum prize pool in USD." },
        status: {
          type: "string",
          enum: ["live", "upcoming", "ended", "any"],
          description: "Default 'live' if user says 'right now'/'currently'/'ongoing' or gives no time preference. Use 'any' only if they explicitly want past results too."
        },
        format: { type: "string", enum: ["online", "offline", "any"], description: "Default 'any'." },
        team_type: { type: "string", enum: ["solo", "team", "any"], description: "Default 'any'." },
        sort_by: {
          type: "string",
          enum: ["ending_soon", "highest_prize", "newest"],
          description: "Default 'ending_soon' unless user asks otherwise."
        },
        limit: { type: "integer", description: "Max results. Default 5, max 10.", default: 5 }
      },
      required: []
    }
  },
  {
    name: "get_competition_details",
    description: "Get full details for a single competition by ID, including complete rules, eligibility list, and official registration link. Use when a user asks for more detail about a competition already mentioned.",
    input_schema: {
      type: "object" as const,
      properties: {
        competition_id: { type: "string", description: "The unique ID from search_competitions." }
      },
      required: ["competition_id"]
    }
  },
  {
    name: "get_platform_info",
    description: "Get trust/background info about a platform — years active, regulation status, verification badge. Use when a user asks if a platform is legitimate or trustworthy.",
    input_schema: {
      type: "object" as const,
      properties: {
        platform_id: { type: "string", description: "The unique ID from search_competitions results." }
      },
      required: ["platform_id"]
    }
  }
];

export function extractMatchedIds(text: string): string[] {
  const match = text.match(/MATCHED_IDS:\s*\[([^\]]*)\]/i);
  if (!match) return [];
  return match[1]
    .split(',')
    .map(s => s.trim().replace(/['"]/g, ''))
    .filter(Boolean);
}

export function stripMatchedIdsLine(text: string): string {
  return text.replace(/MATCHED_IDS:\s*\[[^\]]*\]/i, '').trim();
}

export async function runTool(name: string, input: any) {
  const SERVER_MAX_LIMIT = 10;

  switch (name) {
    case "search_competitions": {
      const safeInput = { ...input, limit: Math.min(input?.limit || 5, SERVER_MAX_LIMIT) };

      // Map ISO country codes to database names if needed
      let countryFilter = safeInput.country;
      if (countryFilter === 'IN') countryFilter = 'India';
      if (countryFilter === 'US') countryFilter = 'USA';
      if (countryFilter === 'GB' || countryFilter === 'UK') countryFilter = 'UK';

      const sortMap: Record<string, 'ending_soon' | 'prize_high' | 'newest'> = {
        ending_soon: 'ending_soon',
        highest_prize: 'prize_high',
        newest: 'newest'
      };

      const result = db.getCompetitions({
        market: safeInput.market === 'any' ? 'all' : (safeInput.market as MarketType),
        country: countryFilter,
        entry: safeInput.entry_type === 'any' ? 'all' : safeInput.entry_type,
        minPrize: safeInput.prize_min,
        maxPrize: safeInput.prize_max,
        status: safeInput.status === 'any' ? 'all' : safeInput.status || 'live',
        format: safeInput.format === 'any' ? 'all' : safeInput.format,
        team: safeInput.team_type === 'any' ? 'all' : safeInput.team_type,
        sort: sortMap[safeInput.sort_by || 'ending_soon'] || 'ending_soon'
      });

      return {
        totalFound: result.total,
        competitions: result.items.slice(0, safeInput.limit).map(c => ({
          id: c.id,
          title: c.title,
          platform: c.platform?.name,
          platform_id: c.platform_id,
          prize_pool: c.prize_pool,
          currency: c.currency,
          market_type: c.market_type,
          entry_fee: c.entry_fee,
          start_date: c.start_date,
          end_date: c.end_date,
          country_eligibility: c.country_eligibility,
          status: c.status,
          official_url: c.official_url
        }))
      };
    }
    case "get_competition_details": {
      const res = db.getCompetitionById(input.competition_id);
      if (!res) return { error: "Competition not found" };
      return res.competition;
    }
    case "get_platform_info": {
      const plt = db.getPlatformById(input.platform_id);
      if (!plt) return { error: "Platform not found" };
      return {
        id: plt.id,
        name: plt.name,
        type: plt.type,
        verified: plt.verified,
        years_active: plt.years_active,
        regulation_status: plt.regulation_status,
        trust_score: plt.trust_score,
        headquarters: plt.headquarters,
        website_url: plt.website_url
      };
    }
    default:
      return { error: `Unknown tool: ${name}` };
  }
}

async function callClaude(messages: any[]) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY || '',
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1000,
      system: AGENT_SYSTEM_PROMPT,
      messages,
      tools
    })
  });
  return response.json();
}

export async function handleAgentQuery(userMessage: string, conversationHistory: any[] = []) {
  const messages = [...conversationHistory, { role: "user", content: userMessage }];

  // If Anthropic API key is provided, execute full Claude tool-use loop
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      let response = await callClaude(messages);
      let iterations = 0;
      const MAX_ITERATIONS = 5;

      while (response.stop_reason === "tool_use" && iterations < MAX_ITERATIONS) {
        iterations++;
        const toolResults = [];

        for (const block of response.content) {
          if (block.type === "tool_use") {
            const result = await runTool(block.name, block.input);
            toolResults.push({
              type: "tool_result",
              tool_use_id: block.id,
              content: JSON.stringify(result)
            });
          }
        }

        messages.push({ role: "assistant", content: response.content });
        messages.push({ role: "user", content: toolResults });

        response = await callClaude(messages);
      }

      const rawText = response.content?.find((c: any) => c.type === "text")?.text || "";
      const matchedIds = extractMatchedIds(rawText);
      const displayText = stripMatchedIdsLine(rawText);

      return {
        text: displayText,
        matchedIds,
        updatedHistory: messages.concat([{ role: "assistant", content: response.content }])
      };
    } catch (err) {
      console.warn("Anthropic API call error, falling back to local agent:", err);
    }
  }

  // Fallback Agent when no API key is present
  const query = userMessage.toLowerCase();

  // General questions
  if (query.includes("what is roi") || query.includes("roi-based")) {
    const text = "ROI-based ranking evaluates traders on their percentage return on starting capital rather than absolute dollar profits. This allows smaller accounts to compete fairly against larger accounts, typically with a maximum drawdown limit to penalize reckless leverage.";
    return { text, matchedIds: [], updatedHistory: [...messages, { role: "assistant", content: text }] };
  }

  if (query.includes("what is a prop firm") || query.includes("prop firm challenge")) {
    const text = "A prop firm evaluation challenges traders to meet a target profit (typically 8–10%) on simulated capital while keeping daily drawdown under 5% and overall loss under 10%. Passing gives you access to a funded account with up to 90% profit splits.";
    return { text, matchedIds: [], updatedHistory: [...messages, { role: "assistant", content: text }] };
  }

  // Dynamic search tool invocation
  let market: any = "any";
  if (query.includes("crypto")) market = "crypto";
  else if (query.includes("forex")) market = "forex";
  else if (query.includes("futures")) market = "futures";
  else if (query.includes("stocks")) market = "stocks";
  else if (query.includes("demo") || query.includes("paper")) market = "demo";

  let country: string | undefined = undefined;
  if (query.includes("india") || query.includes("in")) country = "IN";
  else if (query.includes("usa") || query.includes("us")) country = "US";
  else if (query.includes("uk")) country = "UK";

  const entry_type = (query.includes("free") || query.includes("no fee")) ? "free" : query.includes("paid") ? "paid" : "any";

  const toolResult = await runTool("search_competitions", {
    market,
    country,
    entry_type,
    status: query.includes("upcoming") ? "upcoming" : query.includes("ended") ? "ended" : "live",
    limit: 3
  });

  const comps = (toolResult as any).competitions || [];
  if (comps.length === 0) {
    const text = "I couldn't find any trading competitions matching your exact criteria right now. You can try broadening your search or check our upcoming tournaments tab to see what opens next.";
    return { text, matchedIds: [], updatedHistory: [...messages, { role: "assistant", content: text }] };
  }

  const ids = comps.map((c: any) => c.id);
  const hasPaid = comps.some((c: any) => c.entry_fee && c.entry_fee > 0);

  let answer = "";
  if (country === 'IN' && market === 'crypto') {
    answer = `Yes, a few are currently live and open to India — no entry fee required. Prize pools range from $1,000,000 to $10,000,000, running through late September. Always double-check KYC and verification requirements on the platform's own page before signing up.`;
  } else if (entry_type === 'free') {
    answer = `Found several 100% free-entry competitions currently live, with prize pools scaling up to $${comps[0].prize_pool.toLocaleString()} on ${comps[0].platform}. These let you participate without risking capital, though minimum balance or verification tiers may apply.`;
  } else {
    answer = `Found ${comps.length} active competitions matching your criteria on ${comps.map((c: any) => c.platform).join(" and ")}. Prize pools range from $${comps[comps.length - 1].prize_pool.toLocaleString()} to $${comps[0].prize_pool.toLocaleString()}.`;
  }

  if (hasPaid && entry_type !== 'free') {
    answer += " This one has an entry fee, so only join with money you're prepared to lose, and confirm the platform's legitimacy yourself before paying.";
  }

  return {
    text: answer,
    matchedIds: ids,
    updatedHistory: [...messages, { role: "assistant", content: `${answer}\nMATCHED_IDS: [${ids.join(", ")}]` }]
  };
}
