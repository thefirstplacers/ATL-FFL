import { XMLParser } from 'fast-xml-parser';

export interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  description: string;
}

export interface RedditPost {
  title: string;
  url: string;
  permalink: string;
  score: number;
  numComments: number;
  author: string;
  created: number;
  flair: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  cdataPropName: '__cdata',
  trimValues: true,
});

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
    const res = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const parsed = parser.parse(xml) as Record<string, unknown>;

    // RSS 2.0: rss.channel.item[]
    const channel = (parsed.rss as { channel?: Record<string, unknown> })?.channel;
    const rawItems = Array.isArray(channel?.item) ? channel.item : channel?.item ? [channel.item] : [];

    return (rawItems as Array<Record<string, unknown>>).slice(0, limit).map((item) => ({
      title: text(item.title),
      link: text(item.link),
      pubDate: text(item.pubDate) || text(item['dc:date']),
      source,
      category,
      description: stripHtml(text(item.description) || text(item.summary)).slice(0, 200),
    }));
  } catch (err) {
    console.warn(`[rss] ${source} fetch failed:`, err);
    return [];
  }
}

export async function fetchRedditRSS(subreddit: string, limit = 15): Promise<RedditPost[]> {
  try {
    const res = await fetch(`https://www.reddit.com/r/${subreddit}/hot.rss?limit=20`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ATL-FFL/1.0)',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
    });
    if (res.ok) {
      const xml = await res.text();
      const parsed = parser.parse(xml) as Record<string, unknown>;
      const feed = parsed.feed as { entry?: Array<Record<string, unknown>> | Record<string, unknown> } | undefined;
      const entries = Array.isArray(feed?.entry) ? feed.entry : feed?.entry ? [feed.entry] : [];
      const posts: RedditPost[] = entries.slice(0, limit).map((entry) => {
        const linkVal = entry.link as Record<string, string> | Array<Record<string, string>> | undefined;
        const href = Array.isArray(linkVal) ? linkVal[0]?.['@_href'] : linkVal?.['@_href'];
        const author = entry.author as { name?: string } | undefined;
        const updated = text(entry.updated);
        const link = href || text(entry.link);
        return {
          title: text(entry.title),
          url: link,
          permalink: link.replace('https://www.reddit.com', ''),
          score: 0,
          numComments: 0,
          author: (author?.name || '').replace('/u/', '') || 'unknown',
          created: updated ? Math.floor(new Date(updated).getTime() / 1000) : 0,
          flair: '',
        };
      });
      if (posts.length > 0) return posts;
    }
  } catch (err) {
    console.warn('[rss] Reddit RSS failed, trying JSON:', err);
  }

  // JSON fallback — RSS does not include score/comments/flair
  try {
    const res = await fetch(
      `https://old.reddit.com/r/${subreddit}/hot.json?limit=20&raw_json=1`,
      {
        cache: 'no-store',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ATL-FFL/1.0)' },
      },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as {
      data?: { children?: Array<{ data: RedditJsonPost }> };
    };
    return (data.data?.children || [])
      .filter((c) => !c.data.stickied)
      .slice(0, limit)
      .map((c) => ({
        title: c.data.title,
        url: c.data.url,
        permalink: c.data.permalink,
        score: c.data.score,
        numComments: c.data.num_comments,
        author: c.data.author,
        created: c.data.created_utc,
        flair: c.data.link_flair_text || '',
      }));
  } catch (err) {
    console.warn('[rss] Reddit JSON fallback failed:', err);
    return [];
  }
}

interface RedditJsonPost {
  title: string;
  url: string;
  permalink: string;
  score: number;
  num_comments: number;
  author: string;
  created_utc: number;
  link_flair_text: string | null;
  stickied: boolean;
}
