'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LEAGUE_NAME } from '@/lib/constants';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/news', label: 'News' },
  { href: '/standings', label: 'Standings' },
  { href: '/matchups', label: 'Matchups' },
  { href: '/teams', label: 'Teams' },
  { href: '/records', label: 'Records' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/players', label: 'Players' },
  { href: '/trade-optimizer', label: 'Trades' },
  { href: '/draft', label: 'Draft' },
  { href: '/transactions', label: 'Activity' },
  { href: '/rivalry', label: 'Rivalry' },
  { href: '/rules', label: 'Rules' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change (Next.js keeps state across navigations in
  // client components) and when the user hits Escape.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');

  return (
    <nav className="sticky top-0 z-50 bg-navy/95 backdrop-blur-md border-b border-border/50" aria-label="Primary">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
            aria-label={`${LEAGUE_NAME} home`}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center" aria-hidden="true">
              <span className="text-navy font-bold text-sm">FF</span>
            </div>
            <span className="font-bold text-lg gradient-text hidden sm:block">{LEAGUE_NAME}</span>
          </Link>

          {/* Desktop nav (≥lg): inline links */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    active
                      ? 'bg-gold/15 text-gold font-medium'
                      : 'text-text-secondary hover:text-gold hover:bg-surface-hover'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Tablet nav (md-lg): horizontally scrollable strip */}
          <div className="hidden md:flex lg:hidden flex-1 overflow-x-auto gap-1 scrollbar-thin" role="list">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`shrink-0 px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                    active
                      ? 'bg-gold/15 text-gold font-medium'
                      : 'text-text-secondary hover:text-gold hover:bg-surface-hover'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <button
            onClick={() => setIsOpen((o) => !o)}
            aria-expanded={isOpen}
            aria-controls="mobile-nav"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-gold hover:bg-surface-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer: slides down, scrollable, backdrop-dimming. One tap-target
          per link means iOS hit area and no cramped 3-column grid. */}
      {isOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 top-16 bg-navy/80 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-nav"
            className="md:hidden relative z-50 bg-navy-light border-t border-border/50 max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <div className="flex flex-col p-2">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setIsOpen(false)}
                    className={`px-4 py-3 rounded-lg text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold ${
                      active
                        ? 'bg-gold/15 text-gold font-medium'
                        : 'text-text-secondary hover:text-gold hover:bg-surface-hover'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
