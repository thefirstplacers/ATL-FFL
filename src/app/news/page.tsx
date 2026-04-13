import PageHeader from '@/components/ui/PageHeader';
import NewsFeed from '@/components/NewsFeed';

export const revalidate = 1800; // 30 min

async function fetchRSSFeed(url: string, source: string, category: string) {
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    const text = await res.text();

    // Simple XML parsing for RSS items
    const items: Array<{ title: string; link: string; pubDate: string; source: string; category: string; description: string }> = [];
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
        pubDate: getTag('pubDate'),
        source,
        category,
        description: getTag('description').replace(/<[^>]+>/g, '').slice(0, 200),
      });
    }
    return items.slice(0, 10);
  } catch {
    return [];
  }
}

export default async function NewsPage() {
  const feeds = await Promise.all([
    fetchRSSFeed('https://www.espn.com/espn/rss/nfl/news', 'ESPN', 'NFL'),
    fetchRSSFeed('https://www.nfl.com/rss/rsslanding?searchString=home', 'NFL.com', 'NFL'),
    fetchRSSFeed('https://www.espn.com/espn/rss/fantasy', 'ESPN Fantasy', 'Fantasy'),
  ]);

  const allNews = feeds.flat()
    .filter(item => item.title)
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  // Sample blog posts for the Commissioner's Corner
  const blogPosts = [
    {
      id: '1',
      title: 'Welcome to the 2026 Offseason!',
      author: 'Grant (Commissioner)',
      date: '2026-03-01',
      content: 'Another season is in the books! Congratulations to Bill & Grayson for taking home the championship with their "Unicorn" squad. As we head into the offseason, keep an eye on the keeper deadline and start your draft prep early. The 2026 draft is shaping up to be a great one with some exciting rookie talent coming in.',
      category: 'Commissioner',
    },
    {
      id: '2',
      title: '2026 Rookie Class Preview',
      author: 'ATL FFL Staff',
      date: '2026-04-01',
      content: 'The 2026 NFL Draft is approaching and there are some exciting offensive weapons entering the league. Keep an eye on the top running backs and wide receivers who could make an immediate fantasy impact. With our keeper league format (1 keeper per team), making the right draft picks is more important than ever.',
      category: 'Draft',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="News & Updates" subtitle="Stay up to date with NFL, fantasy, and league news" />
      <NewsFeed news={allNews} blogPosts={blogPosts} />
    </div>
  );
}
