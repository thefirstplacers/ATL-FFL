import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/nav/Navigation';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ATL FFL - Fantasy Football League',
  description: 'The official website of the ATL Fantasy Football League. Standings, matchups, news, and more.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.className} antialiased`}>
      <body className="min-h-screen flex flex-col bg-navy text-text-primary">
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
