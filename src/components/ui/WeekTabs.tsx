'use client';

interface WeekTabsProps {
  totalWeeks: number;
  regularSeasonWeeks: number;
  selectedWeek: number;
  onChange: (week: number) => void;
  hasDataForWeek: (week: number) => boolean;
  showBracketButton?: boolean;
  bracketActive?: boolean;
  onBracket?: () => void;
}

export default function WeekTabs({
  totalWeeks,
  regularSeasonWeeks,
  selectedWeek,
  onChange,
  hasDataForWeek,
  showBracketButton,
  bracketActive,
  onBracket,
}: WeekTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Week selector">
      {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => {
        const isPlayoff = week > regularSeasonWeeks;
        const hasData = hasDataForWeek(week);
        const isActive = selectedWeek === week && !bracketActive;
        return (
          <button
            key={week}
            aria-pressed={isActive}
            aria-label={isPlayoff ? `Playoff week ${week - regularSeasonWeeks}` : `Week ${week}`}
            onClick={() => onChange(week)}
            disabled={!hasData}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy ${
              isActive
                ? 'bg-gold text-navy'
                : hasData
                ? isPlayoff
                  ? 'bg-info/20 text-info hover:bg-info/30'
                  : 'bg-surface hover:bg-surface-hover text-text-secondary'
                : 'bg-surface/50 text-text-muted cursor-not-allowed'
            }`}
          >
            {isPlayoff ? `P${week - regularSeasonWeeks}` : `W${week}`}
          </button>
        );
      })}
      {showBracketButton && onBracket && (
        <button
          onClick={onBracket}
          aria-pressed={bracketActive}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-navy ${
            bracketActive ? 'bg-gold text-navy' : 'bg-gold/20 text-gold hover:bg-gold/30'
          }`}
        >
          <span aria-hidden="true">🏆</span> Bracket
        </button>
      )}
    </div>
  );
}
