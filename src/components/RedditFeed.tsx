'use client';

import { useEffect, useState } from 'react';

interface RedditPost {
  title: string;
  url: string;
  permalink: string;
  score: number;
  numComments: number;
  author: string;
  flair: string;
}

type State =
  | { status: 'loading' }
  | { status: 'ready'; posts: RedditPost[] }
  | { status: 'empty' };

// Browser-side fetch bypasses Reddit's rate-limiting on Vercel's serverless
// IPs. Each visitor hits Reddit from their own IP, which Reddit is much more
// permissive with. Falls back to an "Open Reddit" CTA if the user's own
// network is blocked for any reason.
export default function RedditFeed({ subreddit = 'fantasyfootball' }: { subreddit?: string }) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      const hosts = ['www.reddit.com', 'old.reddit.com'];
      for (const host of hosts) {
        try {
          const res = await fetch(
            `https://${host}/r/${subreddit}/hot.json?limit=25&raw_json=1`,
            { signal: controller.signal },
          );
          if (!res.ok) continue;
          const data = await res.json();
          const posts: RedditPost[] = (data?.data?.children || [])
            .filter((c: { data: { stickied: boolean } }) => !c.data.stickied)
            .slice(0, 15)
            .map((c: {
              data: {
                title: string;
                url: string;
                permalink: string;
                score: number;
                num_comments: number;
                author: string;
                link_flair_text: string | null;
              };
            }) => ({
              title: c.data.title,
              url: c.data.url,
              permalink: c.data.permalink,
              score: c.data.score,
              numComments: c.data.num_comments,
              author: c.data.author,
              flair: c.data.link_flair_text || '',
            }));
          if (posts.length > 0) {
            setState({ status: 'ready', posts });
            return;
          }
        } catch (err) {
          if ((err as Error).name === 'AbortError') return;
        }
      }
      setState({ status: 'empty' });
    })();
    return () => controller.abort();
  }, [subreddit]);

  return (
    <div className="glass-card overflow-hidden mb-6">
      <div className="px-5 py-3 border-b border-border/30 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF4500] flex items-center justify-center text-black font-bold text-xs" aria-hidden="true">
            r/
          </div>
          <div>
            <h3 className="font-bold">r/{subreddit}</h3>
            <p className="text-text-muted text-xs">Hot posts · live from Reddit</p>
          </div>
        </div>
        <a
          href={`https://www.reddit.com/r/${subreddit}/`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold text-xs hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
        >
          View on Reddit →
        </a>
      </div>

      {state.status === 'loading' && (
        <div className="divide-y divide-border/20">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-3 flex items-start gap-3 animate-pulse">
              <div className="w-10 h-8 bg-surface-hover rounded" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 bg-surface-hover rounded" />
                <div className="h-2 w-1/3 bg-surface-hover rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {state.status === 'ready' && (
        <div className="divide-y divide-border/20">
          {state.posts.map((post, i) => (
            <a
              key={i}
              href={`https://www.reddit.com${post.permalink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 flex items-start gap-3 hover:bg-surface-hover transition-colors block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <div className="flex flex-col items-center min-w-[40px] pt-1">
                <span className="text-[#FF4500] text-xs font-bold">▲</span>
                <span className="text-sm font-bold text-text-secondary">
                  {post.score >= 1000 ? `${(post.score / 1000).toFixed(1)}k` : post.score}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm leading-snug">{post.title}</div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {post.flair && (
                    <span className="px-2 py-0.5 rounded text-xs bg-[#FF4500]/20 text-[#FF4500]">
                      {post.flair}
                    </span>
                  )}
                  <span className="text-text-muted text-xs">u/{post.author}</span>
                  {post.numComments > 0 && (
                    <span className="text-text-muted text-xs">· {post.numComments} comments</span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {state.status === 'empty' && (
        <div className="px-5 py-8 text-center text-text-muted text-sm">
          <div className="mb-3">Reddit didn&rsquo;t respond. Your network or an ad-blocker may be blocking it.</div>
          <a
            href={`https://www.reddit.com/r/${subreddit}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#FF4500]/10 hover:bg-[#FF4500]/20 text-[#FF4500] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            Open r/{subreddit} →
          </a>
        </div>
      )}
    </div>
  );
}
