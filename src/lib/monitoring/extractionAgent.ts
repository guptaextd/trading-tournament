// lib/monitoring/extractionAgent.ts
import Anthropic from '@anthropic-ai/sdk';
import { ExtractionResult } from '@/types';
import { stripHtmlToText } from './htmlStripper';
import { isUrlAllowedByRobots, enforceDomainDelay, BOT_USER_AGENT } from './robots';

interface ExtractionAgentOptions {
  url: string;
  competitionTitle: string;
}

export async function extractParticipantCount(options: ExtractionAgentOptions): Promise<ExtractionResult> {
  const { url, competitionTitle } = options;

  // 1. Verify Robots.txt permissions
  const allowed = await isUrlAllowedByRobots(url);
  if (!allowed) {
    return {
      found: false,
      confidence: 'low',
      reasoning: `Target URL is disallowed by domain robots.txt for crawler agents: ${url}`,
      url
    };
  }

  // 2. Enforce minimum 2-second rate-limiting per domain
  try {
    const domain = new URL(url).origin;
    await enforceDomainDelay(domain);
  } catch {
    // Invalid URL format
    return {
      found: false,
      confidence: 'low',
      reasoning: `Invalid competition URL format: ${url}`,
      url
    };
  }

  // 3. Fetch Page with honest, identifiable User-Agent
  let html = '';
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': BOT_USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: AbortSignal.timeout(8000),
      redirect: 'follow'
    });

    if (response.status === 403 || response.status === 429) {
      return {
        found: false,
        confidence: 'low',
        reasoning: `Target server returned HTTP ${response.status} (Rate limited or bot protected). Politeness rule: marked unavailable without aggressive retries.`,
        url
      };
    }

    if (!response.ok) {
      return {
        found: false,
        confidence: 'low',
        reasoning: `Target server returned HTTP ${response.status}: ${response.statusText}`,
        url
      };
    }

    html = await response.text();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      found: false,
      confidence: 'low',
      reasoning: `Network request failed or timed out: ${message}`,
      url
    };
  }

  // 4. Strip Noise (scripts, styles, nav, headers, footers) & Cap Length
  const { cleanText } = stripHtmlToText(html, 8000);

  if (!cleanText || cleanText.trim().length < 20) {
    return {
      found: false,
      confidence: 'low',
      reasoning: 'Page rendered blank or returned insufficient text content for analysis.',
      url
    };
  }

  // 5. AI Extraction via Anthropic Claude (claude-sonnet-4-6) or Deterministic Fallback
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const anthropic = new Anthropic({ apiKey });
      const prompt = `You are a strict data verification agent for AlphaArena.
Your task is to examine the plain text of a trading competition web page and extract the LIVE PARTICIPANT or REGISTRATION COUNT.

COMPETITION NAME: "${competitionTitle}"
PAGE URL: "${url}"

STRICT EXTRACTION RULES:
1. ONLY extract an explicitly-stated count of human or team participants/registrants who have joined the tournament (e.g., "12,450 traders joined", "Registered: 3,420", "Participants: 18,910").
2. DO NOT extract prize money amounts (e.g. $10,000,000, 50,000 USDT).
3. DO NOT extract trading volume (e.g. $450,000,000 Volume).
4. DO NOT extract dates, days left, or rules countdown numbers.
5. DO NOT extract general platform-wide user statistics (e.g. "Over 50 million Binance users worldwide").
6. NEVER estimate, calculate, guess, or interpolate a number. If no live registration counter is explicitly shown in the text, you MUST return found: false.
7. You must quote the EXACT source phrase from the page where the count was found.

PAGE TEXT CONTENT:
"""
${cleanText}
"""

RESPOND ONLY WITH A SINGLE VALID JSON OBJECT (no markdown wrap, no backticks):
{
  "found": boolean,
  "count": number | null,
  "source_phrase": string | null,
  "confidence": "high" | "medium" | "low",
  "reasoning": string
}`;

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }]
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
      const cleanedJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleanedJson);

      if (parsed.found && typeof parsed.count === 'number' && parsed.count > 0) {
        return {
          found: true,
          count: Math.round(parsed.count),
          source_phrase: parsed.source_phrase || '',
          confidence: parsed.confidence || 'high',
          reasoning: parsed.reasoning || 'Extracted explicitly from visible page text.',
          url
        };
      } else {
        return {
          found: false,
          confidence: 'low',
          reasoning: parsed.reasoning || 'No explicit participant counter found in visible page content.',
          url
        };
      }
    } catch (aiErr: unknown) {
      console.warn('Claude extraction call failed, utilizing deterministic fallback parser:', aiErr);
    }
  }

  // 6. Deterministic Fallback Parser (honestly searches for strict unambiguous participant phrases)
  return deterministicFallbackExtract(cleanText, url);
}

function deterministicFallbackExtract(text: string, url: string): ExtractionResult {
  // Strict regexes looking for: [Number] [joined/registered/participants] OR [Participants/Registrations]: [Number]
  const patterns: { regex: RegExp; confidence: 'high' | 'medium'; groupIndex: number }[] = [
    {
      // "12,450 traders joined" or "8,300 participants registered"
      regex: /([1-9]\d{0,2}(?:,\d{3})*|\d+)\s+(?:traders?|participants?|contestants?|teams?|challengers?)\s+(?:joined|registered|enrolled|competing|signed up)/i,
      confidence: 'high',
      groupIndex: 1
    },
    {
      // "Participants: 12,450" or "Registered Traders: 5,400"
      regex: /(?:total\s+)?(?:participants?|registered\s+traders?|enrolled|registered\s+teams?|joined\s+users?)\s*[:\-]\s*([1-9]\d{0,2}(?:,\d{3})*|\d+)/i,
      confidence: 'high',
      groupIndex: 1
    },
    {
      // "Joined (12,450)"
      regex: /(?:joined|registered)\s*\(([1-9]\d{0,2}(?:,\d{3})*|\d+)\)/i,
      confidence: 'medium',
      groupIndex: 1
    }
  ];

  for (const { regex, confidence, groupIndex } of patterns) {
    const match = text.match(regex);
    if (match && match[groupIndex]) {
      const rawNum = match[groupIndex].replace(/,/g, '');
      const count = parseInt(rawNum, 10);
      if (!isNaN(count) && count > 0 && count < 5000000) {
        return {
          found: true,
          count,
          source_phrase: match[0].trim(),
          confidence,
          reasoning: `Deterministic verified match: "${match[0].trim()}"`,
          url
        };
      }
    }
  }

  // Strictly honest: No count found
  return {
    found: false,
    confidence: 'low',
    reasoning: 'No explicit participant counter pattern found in visible page text.',
    url
  };
}
