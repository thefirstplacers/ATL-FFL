import { XMLParser } from 'fast-xml-parser';

export interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  description: string;
}

// processEntities:false — NFL.com's feed trips fast-xml-parser's entity-expansion
// guard ("Entity expansion limit exceeded") and the whole feed silently dropped.
// We decode the standard entities ourselves in decodeEntities() instead.
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  cdataPropName: '__cdata',
  trimValues: true,
  processEntities: false,
});

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

const FETCH_TIMEOUT_MS = 10_000;

function text(val: unknown): string {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) return text(val[0]);
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    if ('__cdata' in obj) return text(obj.__cdata);
    if ('#text' in obj) return text(obj['#text']);
    if ('@_href' in obj) return String(obj['@_href']);
  }
  return '';
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

export async function fetchRSS(
  url: string,
  source: string,
  category: string,
  limit = 10,
): Promise<RSSItem[]> {
  try {
    // Cached fetch (feeds are well under the ~2MB Data Cache limit) so /news
    // can prerender + ISR instead of hitting three feeds on every request
    const res = await fetch(url, {
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const parsed = parser.parse(xml) as Record<string, unknown>;

    // RSS 2.0: rss.channel.item[]
    const channel = (parsed.rss as { channel?: Record<string, unknown> })?.channel;
    const rawItems = Array.isArray(channel?.item) ? channel.item : channel?.item ? [channel.item] : [];

    return (rawItems as Array<Record<string, unknown>>).slice(0, limit).map((item) => ({
      title: decodeEntities(text(item.title)),
      link: decodeEntities(text(item.link)),
      pubDate: text(item.pubDate) || text(item['dc:date']),
      source,
      category,
      description: decodeEntities(stripHtml(text(item.description) || text(item.summary))).slice(0, 200),
    }));
  } catch (err) {
    console.warn(`[rss] ${source} fetch failed:`, err);
    return [];
  }
}
