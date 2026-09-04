import { NextResponse } from 'next/server';

async function fetchRSSItems(url: string, source: string) {
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    const text = await res.text();
    const items: Array<{ title: string; link: string; source: string; time: string }> = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    while ((match = itemRegex.exec(text)) !== null) {
      const itemXml = match[1];
      const getTag = (tag: string) => {
        const m = itemXml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
        return (m?.[1] || m?.[2] || '').trim();
      };
      items.push({
        title: getTag('title'),
        link: getTag('link'),
        source,
        time: getTag('pubDate'),
      });
    }
    return items.slice(0, 20);
  } catch {
    return [];
  }
}

export async function GET() {
  const feeds = await Promise.all([
    fetchRSSItems('https://www.espn.com/espn/rss/nfl/news', 'ESPN'),
    fetchRSSItems('https://www.cbssports.com/rss/headlines/nfl/', 'CBS Sports'),
    fetchRSSItems('https://www.espn.com/espn/rss/fantasy', 'ESPN Fantasy'),
  ]);

  const items = feeds.flat()
    .filter(item => item.title)
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return NextResponse.json({ items });
}
