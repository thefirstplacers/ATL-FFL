'use client';

import Link from 'next/link';
import { useState } from 'react';
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
  { href: '/draft', label: 'Draft' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/rivalry', label: 'Rivalry' },
  { href: '/rules', label: 'Rules' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-navy/95 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
              <span className="text-navy font-bold text-sm">FF</span>
            </div>
            <span className="font-bold text-lg gradient-text hidden sm:block">{LEAGUE_NAME}</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-sm text-text-secondary hover:text-gold hover:bg-surface-hover transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-gold hover:bg-surface-hover transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden bg-navy-light border-t border-border/50">
          <div className="grid grid-cols-3 gap-1 p-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="px-3 py-3 rounded-lg text-sm text-center text-text-secondary hover:text-gold hover:bg-surface-hover transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
