'use client';

import { useState, useEffect } from 'react';

function diffParts(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

export default function CountdownTimer({
  targetDate,
  completedLabel = "It's game time! 🏈",
}: {
  targetDate: string;
  completedLabel?: string;
}) {
  // null until mounted (avoids SSR/client clock mismatch), then live parts or 'done'
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof diffParts> | 'done' | null>(null);

  useEffect(() => {
    const tick = () => {
      const parts = diffParts(targetDate);
      setTimeLeft(parts ?? 'done');
      if (!parts) clearInterval(timer);
    };
    const timer = setInterval(tick, 1000);
    tick();
    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft === 'done') {
    return <div className="text-3xl md:text-4xl font-black text-gold">{completedLabel}</div>;
  }

  const parts = timeLeft ?? { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return (
    <div className="flex justify-center gap-4 md:gap-6">
      {Object.entries(parts).map(([label, value]) => (
        <div key={label} className="text-center">
          <div className="text-3xl md:text-5xl font-black text-gold tabular-nums">
            {String(value).padStart(2, '0')}
          </div>
          <div className="text-text-muted text-xs uppercase tracking-wider mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}
