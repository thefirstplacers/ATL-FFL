'use client';

import { useState } from 'react';
import { timeAgo } from '@/lib/utils';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  description: string;
}

interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  category: string;
}

const FILTERS = ['All', 'NFL', 'Fantasy', 'Draft', 'Commissioner'];

export default function NewsFeed({ news, blogPosts }: { news: NewsItem[]; blogPosts: BlogPost[] }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [showBlog, setShowBlog] = useState(false);

  const filteredNews = activeFilter === 'All'
    ? news
    : news.filter((item) => item.category === activeFilter);

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => { setShowBlog(false); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!showBlog ? 'bg-gold text-navy' : 'bg-surface text-text-secondary hover:bg-surface-hover'}`}
        >
          News Feed
        </button>
        <button
          onClick={() => setShowBlog(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${showBlog ? 'bg-gold text-navy' : 'bg-surface text-text-secondary hover:bg-surface-hover'}`}
        >
          Commissioner&apos;s Corner
        </button>
      </div>

      {showBlog ? (
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
          {/* Category Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {FILTERS.filter(f => f !== 'Commissioner').map((filter) => (
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
