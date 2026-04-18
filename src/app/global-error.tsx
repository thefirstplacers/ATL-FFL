'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: '#111', color: '#f5f5f5', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: 600, margin: '80px auto', padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😵</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Something broke</h1>
          <p style={{ color: '#a0a0a0', marginBottom: 24 }}>
            We hit an unrecoverable error. Refresh the page to try again.
          </p>
          {error.digest && (
            <p style={{ color: '#666', fontSize: 12, marginBottom: 24 }}>ref: {error.digest}</p>
          )}
          <button
            onClick={reset}
            style={{
              padding: '10px 20px',
              background: '#ff6b2b',
              color: '#111',
              fontWeight: 700,
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
