// lib/monitoring/robots.ts

export const BOT_USER_AGENT = 'AlphaArena-ParticipantBot/1.0 (+https://alphaarena.trade/bot; contact@alphaarena.trade)';

interface RobotsCacheEntry {
  disallowedPaths: string[];
  allowedPaths: string[];
  crawlDelayMs: number;
  fetchedAt: number;
}

// In-memory cache for robots.txt per domain (TTL: 1 hour)
const robotsCache = new Map<string, RobotsCacheEntry>();

// Domain rate limiter: ensures 2+ second delay between requests to same domain
const domainLastRequest = new Map<string, number>();
const MIN_DOMAIN_DELAY_MS = 2000;

export async function enforceDomainDelay(domain: string): Promise<void> {
  const lastTime = domainLastRequest.get(domain) || 0;
  const elapsed = Date.now() - lastTime;
  if (elapsed < MIN_DOMAIN_DELAY_MS) {
    const waitTime = MIN_DOMAIN_DELAY_MS - elapsed;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  domainLastRequest.set(domain, Date.now());
}

export async function isUrlAllowedByRobots(targetUrl: string): Promise<boolean> {
  try {
    const parsed = new URL(targetUrl);
    const domain = parsed.origin;
    const path = parsed.pathname || '/';

    let cached = robotsCache.get(domain);
    const oneHour = 60 * 60 * 1000;

    if (!cached || Date.now() - cached.fetchedAt > oneHour) {
      try {
        const robotsUrl = `${domain}/robots.txt`;
        const res = await fetch(robotsUrl, {
          headers: { 'User-Agent': BOT_USER_AGENT },
          signal: AbortSignal.timeout(4000)
        });

        if (res.ok) {
          const text = await res.text();
          cached = parseRobotsTxt(text);
        } else {
          // If 404 or missing, standard web practice permits crawling
          cached = { disallowedPaths: [], allowedPaths: [], crawlDelayMs: 0, fetchedAt: Date.now() };
        }
      } catch {
        // Network timeout / error fetching robots.txt — default to open with normal rate limits
        cached = { disallowedPaths: [], allowedPaths: [], crawlDelayMs: 0, fetchedAt: Date.now() };
      }
      robotsCache.set(domain, cached);
    }

    // Check path against disallows
    for (const dis of cached.disallowedPaths) {
      if (dis && path.startsWith(dis)) {
        // Check if explicitly allowed
        const explicitlyAllowed = cached.allowedPaths.some(a => a && path.startsWith(a));
        if (!explicitlyAllowed) {
          return false;
        }
      }
    }

    return true;
  } catch {
    return true;
  }
}

function parseRobotsTxt(text: string): RobotsCacheEntry {
  const lines = text.split('\n');
  const disallowedPaths: string[] = [];
  const allowedPaths: string[] = [];
  let isTargetAgent = false;
  let hasSpecificSection = false;

  for (const rawLine of lines) {
    const line = rawLine.split('#')[0].trim();
    if (!line) continue;

    const [key, ...vals] = line.split(':');
    const field = key.trim().toLowerCase();
    const value = vals.join(':').trim();

    if (field === 'user-agent') {
      const agent = value.toLowerCase();
      if (agent === 'alphaarena-participantbot' || agent === 'alphaarena') {
        isTargetAgent = true;
        hasSpecificSection = true;
      } else if (agent === '*') {
        if (!hasSpecificSection) isTargetAgent = true;
      } else {
        isTargetAgent = false;
      }
    } else if (isTargetAgent) {
      if (field === 'disallow' && value) {
        disallowedPaths.push(value);
      } else if (field === 'allow' && value) {
        allowedPaths.push(value);
      }
    }
  }

  return {
    disallowedPaths,
    allowedPaths,
    crawlDelayMs: 0,
    fetchedAt: Date.now()
  };
}
