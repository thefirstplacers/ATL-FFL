import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="glass-card p-8">
        <div className="text-5xl mb-4">🏈</div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-text-secondary mb-6">
          This route doesn&apos;t exist — or maybe it got traded away.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-gold hover:bg-gold-light text-navy font-bold rounded-lg transition-colors inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
