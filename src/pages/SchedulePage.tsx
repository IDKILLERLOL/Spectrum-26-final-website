import React, { useState, useEffect } from 'react';
import { getScheduleSlots } from '../lib/firestore';
import { SchedulePageClient } from './schedule/SchedulePageClient';
import type { ScheduleSlot } from '../types';

export function SchedulePage() {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);

  useEffect(() => {
    getScheduleSlots()
      .then((data) => {
        if (data && data.length > 0) setSlots(data);
      })
      .catch(console.error);
  }, []);

  // Map local ScheduleSlot[] to ScheduleItem[] expected by new UI component
  const mappedSchedule = slots.map(slot => ({
    time: slot.displayTime,
    title: slot.name,
    description: slot.description || 'Schedule round execution.'
  }));

  return <SchedulePageClient schedule={mappedSchedule} />;
}
