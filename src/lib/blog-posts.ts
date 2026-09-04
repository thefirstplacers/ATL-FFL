import type { BlogPost } from './types';

// Commissioner's Corner posts. Ordered newest-first. Swap this file (or migrate
// to a CMS later) without touching the UI.
export const BLOG_POSTS: BlogPost[] = [
  {
    id: '2026-09-season-kickoff',
    title: 'Season 8 Is Here — Draft Recap & Week 1',
    author: 'Grant (Commissioner)',
    date: '2026-09-04',
    content:
      "The 2026 draft is in the books! Fifteen rounds, twelve teams, and at least one pick that made the group chat go silent. Carter kicked things off with Bijan at 1.01, Justin paired Jahmyr Gibbs with Josh Allen, and the rest of you... well, the draft board doesn't lie — it's all on the Draft page. Rosters lock into battle Thursday night when the season kicks off. Set your lineups, check the waiver wire after the first injury reports, and remember: the Unicorns are defending champs until someone takes it from them. Good luck in Week 1 — may your studs stay healthy and your opponents' kickers miss left.",
    category: 'Commissioner',
  },
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
