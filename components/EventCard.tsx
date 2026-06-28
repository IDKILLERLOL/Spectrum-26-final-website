'use client';

import { Event } from '@/types/spectrum';
import { formatDate, formatTime } from '@/lib/helpers';
import { CountdownTimer } from './ui/CountdownTimer';
import { PillBadge } from './ui/PillBadge';
import { Button } from './ui/button';

export interface EventCardProps {
  event: Event;
  onRegister?: (eventId: string) => void;
  isRegistered?: boolean;
}

export function EventCard({ event, onRegister, isRegistered }: EventCardProps) {
  // Parse event date and time
  const eventDateTime = new Date(`${event.date}T${event.startTime}`).getTime();
  const capacityPercentage = (event.registeredCount / event.capacity) * 100;

  return (
    <div className="bg-[#111111] border border-[#333333] rounded-lg p-6 hover:border-[#555555] transition-colors">
      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt={event.name}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
      )}

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{event.name}</h3>
            <PillBadge variant="default">{event.category.toUpperCase()}</PillBadge>
          </div>
        </div>

        <p className="text-sm text-[#cccccc]">{event.description}</p>

        <div className="space-y-2 text-xs text-[#999999]">
          <p>
            📅 {formatDate(new Date(`${event.date}T${event.startTime}`).getTime())} • {formatTime(new Date(`${event.date}T${event.startTime}`).getTime())} - {formatTime(new Date(`${event.date}T${event.endTime}`).getTime())}
          </p>
          <p>📍 {event.location}</p>
        </div>

        <div className="bg-[#0d0d0d] rounded p-2">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#666666]">Capacity</span>
            <span className="text-white">
              {event.registeredCount} / {event.capacity}
            </span>
          </div>
          <div className="w-full bg-[#1a1a1a] rounded-full h-2 overflow-hidden border border-[#333333]">
            <div
              className="bg-white h-full rounded-full transition-all"
              style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
            />
          </div>
        </div>

        <div className="text-xs text-[#999999]">
          <CountdownTimer targetTimestamp={eventDateTime} />
        </div>

        {onRegister && (
          <Button
            onClick={() => onRegister(event.id || '')}
            disabled={isRegistered || event.registeredCount >= event.capacity}
            className="w-full mt-4"
          >
            {isRegistered ? 'Already Registered' : 'Register Now'}
          </Button>
        )}
      </div>
    </div>
  );
}
