'use client';

import { useState, useEffect } from 'react';

interface Player {
  id: string;
  name: string;
  position: string;
  team: string;
}

interface NewsItem {
  title: string;
  link: string;
  source: string;
  time: string;
}

export default function PlayerNews({ players }: { players: Player[] }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch('/api/news');
        const data = await res.json();

        // Filter news items that mention any player on the roster
        const playerLastNames = players
          .filter(p => p.position !== 'DEF' && p.name !== '?')
          .map(p => {
            const parts = p.name.split(' ');
            return parts[parts.length - 1]; // last name
          })
          .filter(name => name.length > 3); // skip very short names to avoid false matches

        const playerFullNames = players
          .filter(p => p.position !== 'DEF' && p.name !== '?')
          .map(p => p.name);

        const matched = (data.items || []).filter((item: { title: string }) => {
          const title = item.title.toLowerCase();
          // Check full names first (more accurate)
          for (const fullName of playerFullNames) {
            if (title.includes(fullName.toLowerCase())) return true;
          }
          // Then check last names
          for (const lastName of playerLastNames) {
            if (title.includes(lastName.toLowerCase())) return true;
          }
          return false;
        }).slice(0, 10);

        setNews(matched);
      } catch {
        // API might not exist yet, that's fine
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, [players]);

  if (loading) {
    return (
      <div className="glass-card p-5">
        <h3 className="font-bold mb-3 flex items-center gap-2"><span>📰</span> Player News</h3>
        <div className="text-text-muted text-sm animate-pulse">Loading news...</div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-5 py-3 border-b border-border/30">
        <h3 className="font-bold flex items-center gap-2"><span>📰</span> Player News</h3>
        <p className="text-text-muted text-xs mt-1">Recent headlines mentioning players on this roster</p>
      </div>
      {news.length > 0 ? (
        <div className="divide-y divide-border/20">
          {news.map((item, i) => (
            <a
              key={i}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 block hover:bg-surface-hover transition-colors"
            >
              <div className="font-medium text-sm hover:text-gold transition-colors">{item.title}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded text-xs bg-surface text-text-secondary">{item.source}</span>
                {item.time && <span className="text-text-muted text-xs">{item.time}</span>}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="px-5 py-6 text-center text-text-muted text-sm">
          No recent news found for players on this roster. Check back during the NFL season for player-specific updates.
        </div>
      )}
    </div>
  );
}
