'use client';

import { useState } from 'react';
import { timeAgo } from '@/lib/utils';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  description?: string;
}

interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  category: string;
}

const FILTERS = ['All', 'NFL', 'Fantasy', 'Draft'];

const TWITTER_ACCOUNTS = [
  { handle: 'AdamSchefter', label: 'Adam Schefter', desc: 'Breaking NFL News' },
  { handle: 'FieldYates', label: 'Field Yates', desc: 'Fantasy Analysis' },
  { handle: 'FantasyPros', label: 'FantasyPros', desc: 'Rankings & Advice' },
  { handle: 'PredictionStrike', label: 'PredictionStrike', desc: 'Player Stock Market' },
  { handle: 'RotoWire', label: 'RotoWire', desc: 'Real-Time Player Alerts' },
  { handle: 'NFLFantasy', label: 'NFL Fantasy', desc: 'Official NFL Fantasy' },
  { handle: 'SleeperHQ', label: 'Sleeper', desc: 'Platform Updates' },
  { handle: 'MatthewBerryTMR', label: 'Matthew Berry', desc: 'Fantasy Guru' },
  { handle: 'JayGlazer', label: 'Jay Glazer', desc: 'NFL Insider' },
];

type TabType = 'news' | 'social' | 'blog';

interface RedditPost {
  title: string;
  url: string;
  permalink: string;
  score: number;
  numComments: number;
  author: string;
  created: number;
  flair: string;
}

export default function NewsFeed({ news, blogPosts, redditPosts }: { news: NewsItem[]; blogPosts: BlogPost[]; redditPosts: RedditPost[] }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<TabType>('news');

  const filteredNews = activeFilter === 'All'
    ? news
    : news.filter((item) => item.category === activeFilter);

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'news' as TabType, label: 'News Feed', icon: '📰' },
          { key: 'social' as TabType, label: 'Social Feed', icon: '𝕏' },
          { key: 'blog' as TabType, label: "Commissioner's Corner", icon: '📝' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === tab.key ? 'bg-gold text-navy' : 'bg-surface text-text-secondary hover:bg-surface-hover'
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'social' ? (
        /* Social Feed */
        <div>
          {/* Reddit r/fantasyfootball */}
          <div className="glass-card overflow-hidden mb-6">
            <div className="px-5 py-3 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF4500] flex items-center justify-center text-white font-bold text-xs">r/</div>
                <div>
                  <h3 className="font-bold">r/fantasyfootball</h3>
                  <p className="text-text-muted text-xs">Hot posts &middot; 2M+ members</p>
                </div>
              </div>
              <a href="https://www.reddit.com/r/fantasyfootball/" target="_blank" rel="noopener noreferrer" className="text-gold text-xs hover:underline">
                View on Reddit →
              </a>
            </div>
            {redditPosts.length > 0 ? (
              <div className="divide-y divide-border/20">
                {redditPosts.map((post, i) => (
                  <a
                    key={i}
                    href={`https://www.reddit.com${post.permalink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 flex items-start gap-3 hover:bg-surface-hover transition-colors block"
                  >
                    <div className="flex flex-col items-center min-w-[40px] pt-1">
                      <span className="text-[#FF4500] text-xs font-bold">▲</span>
                      <span className="text-sm font-bold text-text-secondary">
                        {post.score > 0 ? (post.score >= 1000 ? `${(post.score / 1000).toFixed(1)}k` : post.score) : '•'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm leading-snug">{post.title}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {post.flair && <span className="px-2 py-0.5 rounded text-xs bg-[#FF4500]/20 text-[#FF4500]">{post.flair}</span>}
                        <span className="text-text-muted text-xs">u/{post.author}</span>
                        {post.numComments > 0 && <span className="text-text-muted text-xs">&middot; {post.numComments} comments</span>}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-text-muted text-sm">
                Unable to load Reddit posts. <a href="https://www.reddit.com/r/fantasyfootball/" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Visit the subreddit directly</a>.
              </div>
            )}
          </div>

          {/* X Accounts */}
          <div className="glass-card p-5 mb-4">
            <h3 className="text-lg font-bold mb-1">Fantasy Football on X</h3>
            <p className="text-text-secondary text-sm">Top accounts for breaking news, analysis, and hot takes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TWITTER_ACCOUNTS.map((account) => (
              <a
                key={account.handle}
                href={`https://x.com/${account.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-5 hover:scale-[1.02] transition-transform block"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-lg font-bold text-gold">
                    𝕏
                  </div>
                  <div>
                    <div className="font-bold text-sm">{account.label}</div>
                    <div className="text-text-muted text-xs">@{account.handle}</div>
                  </div>
                </div>
                <p className="text-text-secondary text-sm">{account.desc}</p>
                <div className="mt-3 text-gold text-xs font-medium">View on X →</div>
              </a>
            ))}
          </div>
        </div>
      ) : activeTab === 'blog' ? (
        /* Blog Posts */
        <div className="space-y-6">
          <div className="glass-card p-6 bg-gold/5 border-gold/20">
            <h3 className="text-lg font-bold text-gold mb-2">Weekly Mailer</h3>
            <p className="text-text-secondary text-sm">
              Each week during the season, a different league member writes the weekly mailer with hot takes, analysis, and predictions.
              Check back during the season for the latest posts!
            </p>
          </div>
          {blogPosts.map((post) => (
            <article key={post.id} className="glass-card p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 rounded text-xs font-medium bg-gold/20 text-gold">{post.category}</span>
                <span className="text-text-muted text-xs">{new Date(post.date).toLocaleDateString()}</span>
              </div>
              <h3 className="text-xl font-bold mb-2">{post.title}</h3>
              <p className="text-text-secondary text-sm mb-3">{post.content}</p>
              <div className="text-text-muted text-xs">By {post.author}</div>
            </article>
          ))}
        </div>
      ) : (
        /* News Feed */
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeFilter === filter ? 'bg-info text-white' : 'bg-surface text-text-secondary hover:bg-surface-hover'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {filteredNews.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-text-muted">No news articles found. RSS feeds may be temporarily unavailable.</p>
              <p className="text-text-muted text-sm mt-2">Try checking back later or visit ESPN, NFL.com, or Yahoo Sports directly.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNews.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-card p-4 block hover:border-gold/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm hover:text-gold transition-colors">{item.title}</h3>
                      {item.description && (
                        <p className="text-text-muted text-xs mt-1 line-clamp-2">{item.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded text-xs bg-surface text-text-secondary">{item.source}</span>
                        <span className="text-text-muted text-xs">{item.pubDate ? timeAgo(item.pubDate) : ''}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
