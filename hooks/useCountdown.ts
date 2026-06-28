'use client';

import { useState, useEffect } from 'react';
import { getTimeRemaining } from '@/lib/helpers';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOver: boolean;
}

export function useCountdown(targetTimestamp: number): TimeRemaining {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    getTimeRemaining(targetTimestamp)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(targetTimestamp));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTimestamp]);

  return timeRemaining;
}
