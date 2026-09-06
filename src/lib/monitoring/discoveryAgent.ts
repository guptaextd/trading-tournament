// lib/monitoring/discoveryAgent.ts
import Anthropic from '@anthropic-ai/sdk';
import { db } from '../db';
import { stripHtmlToText } from './htmlStripper';
import { BOT_USER_AGENT, isUrlAllowedByRobots, enforceDomainDelay } from './robots';

interface DiscoveryResult {
  bestUrl: string;
  reasoning: string;
  candidateUrls: string[];
}

export async function discoverBestMonitoringUrl(competitionId: string): Promise<DiscoveryResult> {
  const result = db.getCompetitionById(competitionId);
  if (!result) {
    return {
      bestUrl: '',
      reasoning: 'Competition not found',
      candidateUrls: []
    };
  }

  const { competition } = result;
  const officialUrl = competition.official_url;

  // If robots.txt forbids or URL is invalid, stick to official_url
  const allowed = await isUrlAllowedByRobots(officialUrl);
  if (!allowed) {
    return {
      bestUrl: officialUrl,
      reasoning: 'Crawling disallowed by robots.txt; defaulting to official URL.',
      candidateUrls: [officialUrl]
    };
  }

  let html = '';
  try {
    const domain = new URL(officialUrl).origin;
    await enforceDomainDelay(domain);

    const res = await fetch(officialUrl, {
      headers: { 'User-Agent': BOT_USER_AGENT },
      signal: AbortSignal.timeout(6000)
    });

    if (res.ok) {
      html = await res.text();
    }
  } catch {
    // Network fail or timeout — keep officialUrl
    return {
      bestUrl: officialUrl,
      reasoning: 'Landing page fetch failed; defaulting to official URL.',
      candidateUrls: [officialUrl]
    };
  }

  const { links } = stripHtmlToText(html, 4000);
  const baseOrigin = new URL(officialUrl).origin;

  // Filter relevant candidate links (e.g. leaderboard, participants, stats, rankings, overview)
  const keywords = ['leaderboard', 'participant', 'trader', 'ranking', 'stat', 'scoreboard', 'standings', 'rules'];
  const candidateMap = new Map<string, string>(); // url -> linkText

  for (const { text, href } of links) {
    const lower = (text + ' ' + href).toLowerCase();
    if (keywords.some(kw => lower.includes(kw))) {
      try {
        const absolute = new URL(href, officialUrl).href;
        // Only internal links within same origin or official domain
        if (new URL(absolute).origin === baseOrigin) {
          candidateMap.set(absolute, text);
        }
      } catch {
        // Ignore malformed hrefs
      }
    }
  }

  const candidateUrls = Array.from(candidateMap.keys()).slice(0, 8);

  if (candidateUrls.length === 0) {
    // No relevant sub-pages found; the main page is best
    db.updateCompetitionParticipant(competitionId, {
      confidence: competition.participant_count_confidence || 'unavailable',
      url: officialUrl
    });
    return {
      bestUrl: officialUrl,
      reasoning: 'No sub-page links found. Monitoring main official URL.',
      candidateUrls: [officialUrl]
    };
  }

  // Use Claude or heuristic to choose the best URL
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey && candidateUrls.length > 0) {
    try {
      const anthropic = new Anthropic({ apiKey });
      const prompt = `You are a URL Discovery Agent for a trading competition aggregator.
Competition: "${competition.title}"
Main URL: "${officialUrl}"

Available Sub-page candidates found on landing page:
${candidateUrls.map((u, i) => `${i + 1}. URL: ${u} (Anchor: "${candidateMap.get(u)}")`).join('\n')}

Which single URL is most likely to display the public LIVE PARTICIPANT or REGISTRATION count (e.g. participant list, leaderboard header counter, or registration stats)?

Respond ONLY in JSON format:
{
  "best_url": string,
  "reasoning": string
}`;

      const msg = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 200,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }]
      });

      const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : '';
      const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.best_url && candidateUrls.includes(parsed.best_url)) {
        db.updateCompetitionParticipant(competitionId, {
          confidence: competition.participant_count_confidence || 'unavailable',
          url: parsed.best_url
        });
        return {
          bestUrl: parsed.best_url,
          reasoning: parsed.reasoning || 'Claude identified sub-page as optimal for live participant count.',
          candidateUrls
        };
      }
    } catch {
      // Fall through to heuristic
    }
  }

  // Deterministic heuristic: prioritize URLs containing 'leaderboard' or 'participant'
  const preferred = candidateUrls.find(u => u.includes('leaderboard') || u.includes('participant')) || candidateUrls[0] || officialUrl;

  db.updateCompetitionParticipant(competitionId, {
    confidence: competition.participant_count_confidence || 'unavailable',
    url: preferred
  });

  return {
    bestUrl: preferred,
    reasoning: 'Heuristic chose highest priority subpage keyword.',
    candidateUrls
  };
}
