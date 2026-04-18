'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[page error]', error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="glass-card p-8">
        <div className="text-5xl mb-4">😵</div>
        <h1 className="text-2xl font-bold mb-2">Something broke on our end</h1>
        <p className="text-text-secondary mb-6">
          This page couldn&apos;t load. Sleeper&apos;s API may be having a moment, or we shipped a bug.
        </p>
        {error.digest && (
          <p className="text-text-muted text-xs mb-6 font-mono">ref: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-gold hover:bg-gold-light text-navy font-bold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 bg-surface hover:bg-surface-hover border border-border rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
