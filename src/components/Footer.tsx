import { LEAGUE_NAME, LEAGUE_EST } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-navy-light border-t border-border/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center">
              <span className="text-navy font-bold text-xs">FF</span>
            </div>
            <span className="text-text-secondary text-sm">
              {LEAGUE_NAME} &middot; Est. {LEAGUE_EST}
            </span>
          </div>
          <div className="flex items-center gap-4 text-text-muted text-sm">
            <span>Powered by Sleeper</span>
            <span>&middot;</span>
            <span>12-Team League</span>
            <span>&middot;</span>
            <span>3 Divisions</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
