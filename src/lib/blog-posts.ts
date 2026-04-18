import type { BlogPost } from './types';

// Commissioner's Corner posts. Ordered newest-first. Swap this file (or migrate
// to a CMS later) without touching the UI.
export const BLOG_POSTS: BlogPost[] = [
  {
    id: '2026-04-rookie-preview',
    title: '2026 Rookie Class Preview',
    author: 'ATL FFL Staff',
    date: '2026-04-01',
    content:
      "The 2026 NFL Draft is approaching and there are some exciting offensive weapons entering the league. Keep an eye on the top running backs and wide receivers who could make an immediate fantasy impact. With our keeper league format (1 keeper per team), making the right draft picks is more important than ever.",
    category: 'Draft',
  },
  {
    id: '2026-03-welcome',
    title: 'Welcome to the 2026 Offseason!',
    author: 'Grant (Commissioner)',
    date: '2026-03-01',
    content:
      'Another season is in the books! Congratulations to Bill & Grayson for taking home the championship with their "Unicorn" squad. As we head into the offseason, keep an eye on the keeper deadline and start your draft prep early. The 2026 draft is shaping up to be a great one with some exciting rookie talent coming in.',
    category: 'Commissioner',
  },
];
