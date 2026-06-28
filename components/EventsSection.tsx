'use client';

import { useFirestore } from '@/hooks/useFirestore';
import { useAuth } from '@/hooks/useAuth';
import { Event, Registration } from '@/types/spectrum';
import { EventCard } from './EventCard';
import { Spinner } from './ui/Spinner';
import { Button } from './ui/button';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { where } from 'firebase/firestore';
import { useState } from 'react';

export function EventsSection() {
  const { user } = useAuth();
  const { data: events, loading: eventsLoading } = useFirestore<Event>('events');
  const { data: userRegistrations } = useFirestore<Registration>(
    'registrations',
    user ? [where('userId', '==', user.uid)] : []
  );
  const [registering, setRegistering] = useState<string | null>(null);

  const registeredEventIds = userRegistrations.map((r) => r.eventId);

  const handleRegister = async (eventId: string) => {
    if (!user) {
      toast.error('Please sign in to register');
      return;
    }

    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    setRegistering(eventId);
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          userName: user.displayName || 'Guest',
          userPhone: '',
          userCollege: '',
          eventId,
          eventName: event.name,
        }),
      });

      if (response.ok) {
        toast.success('Successfully registered!');
      } else {
        toast.error('Registration failed');
      }
    } catch (error) {
      toast.error('Error during registration');
    } finally {
      setRegistering(null);
    }
  };

  return (
    <section className="bg-black py-16 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold text-white">Spectrum 26 Events</h2>
            <p className="text-[#999999] mt-2">Join us for amazing workshops and talks</p>
          </div>
          {user && (
            <Link href="/dashboard">
              <Button>My Passes</Button>
            </Link>
          )}
        </div>

        {eventsLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#999999]">No events available yet</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isRegistered={registeredEventIds.includes(event.id || '')}
                onRegister={handleRegister}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
