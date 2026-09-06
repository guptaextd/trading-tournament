// lib/monitoring/htmlStripper.ts

export interface StrippedPage {
  cleanText: string;
  links: { text: string; href: string }[];
  title: string;
}

export function stripHtmlToText(html: string, maxChars: number = 8000): StrippedPage {
  if (!html) return { cleanText: '', links: [], title: '' };

  // 1. Extract Page Title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  // 2. Extract internal anchor links before stripping tags
  const links: { text: string; href: string }[] = [];
  const linkRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1].trim();
    // Clean link text of any inner tags
    const text = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (href && text && !href.startsWith('javascript:') && !href.startsWith('#') && !href.startsWith('mailto:')) {
      links.push({ text, href });
      if (links.length >= 40) break; // Limit extracted links
    }
  }

  // 3. Remove unwanted tag blocks completely (content + tag)
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, ' ')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ')
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, ' ')
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ')
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, ' ');

  // 4. Convert structural elements to readable spacing
  clean = clean
    .replace(/<\/(div|p|h1|h2|h3|h4|h5|h6|li|tr|section|article)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<td[^>]*>/gi, ' | ')
    .replace(/<th[^>]*>/gi, ' | ');

  // 5. Strip all remaining HTML tags
  clean = clean.replace(/<[^>]+>/g, ' ');

  // 6. Decode common HTML entities
  clean = clean
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&trade;/gi, '™')
    .replace(/&bull;/gi, '•');

  // 7. Collapse excessive whitespace and blank lines
  const lines = clean
    .split('\n')
    .map(line => line.replace(/[ \t]+/g, ' ').trim())
    .filter(line => line.length > 0);

  const cleanText = lines.join('\n').slice(0, maxChars);

  return {
    cleanText,
    links,
    title
  };
}
