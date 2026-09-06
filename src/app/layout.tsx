import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/nav/Navigation';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'ATL FFL · Fantasy Football League',
    template: '%s · ATL FFL',
  },
  description: 'Standings, matchups, news, trade analysis, and more for the ATL Fantasy Football League.',
  applicationName: 'ATL FFL',
  appleWebApp: {
    capable: true,
    title: 'ATL FFL',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'ATL FFL · Fantasy Football League',
    description: 'Standings, matchups, news, trade analysis, and more for the ATL Fantasy Football League.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} antialiased`}>
      <body className="min-h-screen flex flex-col bg-navy text-text-primary">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-gold focus:text-navy focus:rounded-lg focus:font-bold"
        >
          Skip to content
        </a>
        <Navigation />
        <main id="main" className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
