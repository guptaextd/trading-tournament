import { NextRequest, NextResponse } from 'next/server';
import { SYSTEM_PROMPT } from '@/lib/assistant/system-prompt';
import { assistantTools, executeTool } from '@/lib/assistant/tools';
import { db } from '@/lib/db';
import { Competition, MarketType } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 });
    }

    const latestMessage = messages[messages.length - 1].content;
    let finalAnswer = '';
    let matchedIds: string[] = [];

    // Check if Anthropic API key is available in environment
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const { default: Anthropic } = await import('@anthropic-ai/sdk');
        const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

        const claudeMessages: any[] = messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }));

        // Initial Claude call with tools
        let response = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          tools: assistantTools as any,
          messages: claudeMessages,
        });

        // Handle tool calls loop
        let currentResponse = response;
        while (currentResponse.stop_reason === 'tool_use') {
          const toolUseBlocks = currentResponse.content.filter(b => b.type === 'tool_use') as any[];
          if (toolUseBlocks.length === 0) break;

          const toolResults: any[] = [];
          for (const block of toolUseBlocks) {
            const resultData = executeTool(block.name, block.input);
            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: JSON.stringify(resultData),
            });
          }

          // Continue conversation with tool results
          currentResponse = await anthropic.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            tools: assistantTools as any,
            messages: [
              ...claudeMessages,
              { role: 'assistant', content: currentResponse.content },
              { role: 'user', content: toolResults }
            ],
          });
        }

        // Extract text
        const textBlock = currentResponse.content.find(b => b.type === 'text') as any;
        if (textBlock && textBlock.text) {
          finalAnswer = textBlock.text;
        }
      } catch (anthropicErr) {
        console.warn('Anthropic API call failed or unavailable, using deterministic agent fallback:', anthropicErr);
      }
    }

    // Fallback: If no API key or API call failed, use intelligent agent engine
    if (!finalAnswer) {
      finalAnswer = generateAgentResponse(latestMessage);
    }

    // Extract MATCHED_IDS: [...] from text
    const matchRegex = /MATCHED_IDS:\s*\[(.*?)\]/i;
    const match = finalAnswer.match(matchRegex);
    if (match && match[1]) {
      matchedIds = match[1]
        .split(',')
        .map(id => id.trim().replace(/['"]/g, ''))
        .filter(Boolean);
    }

    // Fetch full competition objects for frontend cards rendering
    const matchedCompetitions: Competition[] = [];
    for (const id of matchedIds) {
      const res = db.getCompetitionById(id);
      if (res) {
        matchedCompetitions.push(res.competition);
      }
    }

    return NextResponse.json({
      text: finalAnswer,
      matchedIds,
      competitions: matchedCompetitions
    });

  } catch (error) {
    console.error('Error in assistant route:', error);
    return NextResponse.json({ error: 'Failed to process assistant query' }, { status: 500 });
  }
}

// Fallback Autonomous Agent that executes the exact tool calling and applies the system rules
function generateAgentResponse(userQuery: string): string {
  const query = userQuery.toLowerCase();

  // Handle general definitions without tool call
  if (query.includes('what is roi') || query.includes('roi-based')) {
    return "ROI-based ranking means traders are evaluated primarily on their net percentage return on initial capital rather than absolute dollar profit, allowing traders with smaller balances to compete fairly against larger accounts. Maximum drawdown rules are often paired with ROI to prevent reckless high-leverage gambles.";
  }

  if (query.includes('what is a prop firm') || query.includes("what's a prop firm")) {
    return "A prop firm (proprietary trading firm) evaluates traders through simulated demo accounts and allocates company capital or profit-sharing accounts to those who pass disciplined risk rules. Most firms challenge traders to achieve an 8–10% profit target while keeping daily drawdown under 5% and overall drawdown under 10%.";
  }

  // Detect parameters for tool search
  let market: MarketType | undefined = undefined;
  if (query.includes('crypto')) market = 'crypto';
  else if (query.includes('forex')) market = 'forex';
  else if (query.includes('futures')) market = 'futures';
  else if (query.includes('stock')) market = 'stocks';
  else if (query.includes('prop')) market = 'prop_firm';
  else if (query.includes('demo') || query.includes('paper') || query.includes('zero risk')) market = 'demo';

  let country: string | undefined = undefined;
  if (query.includes('india')) country = 'India';
  else if (query.includes('usa') || query.includes('us ') || query.includes('united states')) country = 'USA';
  else if (query.includes('uk') || query.includes('britain')) country = 'UK';
  else if (query.includes('eu') || query.includes('europe')) country = 'EU';

  const isFree = query.includes('free') || query.includes('no fee') || query.includes('zero cost') ? true : undefined;
  const isPaid = query.includes('paid') || query.includes('fee');

  // Search using the backend tool
  const searchResult = executeTool('search_competitions', {
    market,
    country,
    free: isFree,
    status: query.includes('upcoming') ? 'upcoming' : query.includes('ended') ? 'ended' : 'live',
    query: query.includes('wsot') ? 'wsot' : query.includes('binance') ? 'binance' : query.includes('ftmo') ? 'ftmo' : undefined
  });

  const comps = searchResult.competitions || [];

  if (comps.length === 0) {
    return "I couldn't find any trading competitions matching your exact filters. You might want to broaden your search criteria or check our upcoming tournaments tab to catch the next registration cycle.";
  }

  const ids = comps.slice(0, 3).map((c: any) => c.id);
  const hasPaid = comps.some((c: any) => c.entry_fee && c.entry_fee > 0);

  let responseText = '';
  if (country && market) {
    responseText = `Here are active ${market} competitions currently open to traders in ${country}. Prize pools range from $${comps[0].prize_pool.toLocaleString()} on ${comps[0].platform}, running through ${new Date(comps[0].end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}. Make sure to confirm individual platform verification requirements on their official pages before registering.`;
  } else if (isFree) {
    responseText = `Found several 100% free-entry competitions currently live, with prize pools scaling up to $${comps[0].prize_pool.toLocaleString()} on ${comps[0].platform}. These let you compete without risking personal capital, though account balance or KYC minimums may apply.`;
  } else {
    responseText = `Found ${comps.length} competitions matching your search across ${comps.map((c: any) => c.platform).filter((v: any, i: any, a: any) => a.indexOf(v) === i).join(' and ')}. Prize pools range from $${comps[comps.length - 1].prize_pool.toLocaleString()} to $${comps[0].prize_pool.toLocaleString()}.`;
  }

  if (hasPaid && !isFree) {
    responseText += " Note: Some of these involve an entry fee or paid evaluation challenge, so only participate with capital you are prepared to risk, and verify platform credentials yourself beforehand.";
  }

  responseText += `\nMATCHED_IDS: [${ids.join(', ')}]`;
  return responseText;
}
