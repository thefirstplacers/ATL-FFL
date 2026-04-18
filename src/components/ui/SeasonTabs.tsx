'use client';

interface SeasonTabsProps {
  seasons: string[];
  selected: string;
  onChange: (season: string) => void;
  renderExtra?: (season: string) => React.ReactNode;
}

export default function SeasonTabs({ seasons, selected, onChange, renderExtra }: SeasonTabsProps) {
  return (
    <div className="flex gap-2 mb-6 flex-wrap" role="tablist" aria-label="Season selector">
      {seasons.map((season) => {
        const isActive = selected === season;
        return (
          <button
            key={season}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(season)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy flex items-center gap-2 ${
              isActive ? 'bg-gold text-navy' : 'bg-surface text-text-secondary hover:bg-surface-hover'
            }`}
          >
            {season}
            {renderExtra?.(season)}
          </button>
        );
      })}
    </div>
  );
}
