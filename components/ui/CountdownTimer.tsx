'use client';

import { useCountdown } from '@/hooks/useCountdown';

export interface CountdownTimerProps {
  targetTimestamp: number;
  format?: 'full' | 'compact';
  className?: string;
  onExpire?: () => void;
}

export function CountdownTimer({
  targetTimestamp,
  format = 'full',
  className = '',
  onExpire,
}: CountdownTimerProps) {
  const { days, hours, minutes, seconds, isOver } = useCountdown(targetTimestamp);

  if (isOver) {
    onExpire?.();
    return <span className={className}>Event has started</span>;
  }

  const displayValue =
    format === 'compact'
      ? `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${days}d ${hours}h ${minutes}m ${seconds}s`;

  return <span className={className}>{displayValue}</span>;
}
