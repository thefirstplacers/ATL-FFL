import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';
import NewsFeed from '@/components/NewsFeed';
import { fetchRSS } from '@/lib/rss';
import { BLOG_POSTS } from '@/lib/blog-posts';

export const revalidate = 1800;

export const metadata: Metadata = {
  title: 'News & Updates',
  description: 'NFL headlines, fantasy news, Reddit discussions, and Commissioner\'s Corner posts.',
};

export default async function NewsPage() {
  // Reddit is fetched client-side (see RedditFeed component) because Reddit
  // rate-limits Vercel's shared serverless IPs aggressively — each visitor's
  // own IP hits Reddit directly instead.
  const feeds = await Promise.all([
    fetchRSS('https://www.espn.com/espn/rss/nfl/news', 'ESPN', 'NFL'),
    // NFL.com retired its RSS endpoint (301s to the homepage) — CBS replaces it
    fetchRSS('https://www.cbssports.com/rss/headlines/nfl/', 'CBS Sports', 'NFL'),
    fetchRSS('https://www.espn.com/espn/rss/fantasy', 'ESPN Fantasy', 'Fantasy'),
  ]);

  const allNews = feeds
    .flat()
    .filter((item) => item.title)
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="News & Updates" subtitle="Stay up to date with NFL, fantasy, and league news" />
      <NewsFeed news={allNews} blogPosts={BLOG_POSTS} />
    </div>
  );
}
