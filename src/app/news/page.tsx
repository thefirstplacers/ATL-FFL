import type { Metadata } from 'next';
import PageHeader from '@/components/ui/PageHeader';
import NewsFeed from '@/components/NewsFeed';
import { fetchRSS, fetchRedditRSS } from '@/lib/rss';
import { BLOG_POSTS } from '@/lib/blog-posts';

export const revalidate = 1800;

export const metadata: Metadata = {
  title: 'News & Updates · ATL FFL',
  description: 'NFL headlines, fantasy news, Reddit fantasy football discussions, and Commissioner\'s Corner posts.',
};

export default async function NewsPage() {
  const [feeds, redditPosts] = await Promise.all([
    Promise.all([
      fetchRSS('https://www.espn.com/espn/rss/nfl/news', 'ESPN', 'NFL'),
      fetchRSS('https://www.nfl.com/rss/rsslanding?searchString=home', 'NFL.com', 'NFL'),
      fetchRSS('https://www.espn.com/espn/rss/fantasy', 'ESPN Fantasy', 'Fantasy'),
    ]),
    fetchRedditRSS('fantasyfootball'),
  ]);

  const allNews = feeds
    .flat()
    .filter((item) => item.title)
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <PageHeader title="News & Updates" subtitle="Stay up to date with NFL, fantasy, and league news" />
      <NewsFeed news={allNews} blogPosts={BLOG_POSTS} redditPosts={redditPosts} />
    </div>
  );
}
