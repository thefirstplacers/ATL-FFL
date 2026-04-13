'use client';

import { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex justify-center gap-4 md:gap-6">
      {Object.entries(timeLeft).map(([label, value]) => (
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
