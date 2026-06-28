'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFirestore } from '@/hooks/useFirestore';
import { Event, Registration, Announcement } from '@/types/spectrum';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/Spinner';
import { PillBadge } from '@/components/ui/PillBadge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { formatDateTime } from '@/lib/helpers';

type Panel = 'events' | 'registrations' | 'announcements';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading, logout } = useAuth();
  const [activePanel, setActivePanel] = useState<Panel>('events');
  const [createEventForm, setCreateEventForm] = useState({
    name: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    capacity: 100,
    category: 'workshop' as const,
  });

  const [createAnnouncementForm, setCreateAnnouncementForm] = useState({
    title: '',
    message: '',
    type: 'info' as const,
  });

  const { data: events, loading: eventsLoading } = useFirestore<Event>('events');
  const { data: registrations, loading: registrationsLoading } = useFirestore<Registration>(
    'registrations'
  );
  const { data: announcements, loading: announcementsLoading } =
    useFirestore<Announcement>('announcements');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    router.push('/');
    return null;
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEventForm),
      });
      if (response.ok) {
        toast.success('Event created successfully');
        setCreateEventForm({
          name: '',
          description: '',
          date: '',
          startTime: '',
          endTime: '',
          location: '',
          capacity: 100,
          category: 'workshop',
        });
      } else {
        toast.error('Failed to create event');
      }
    } catch (error) {
      toast.error('Error creating event');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createAnnouncementForm,
          createdBy: user.email,
          targetAudience: 'all',
        }),
      });
      if (response.ok) {
        toast.success('Announcement created');
        setCreateAnnouncementForm({ title: '', message: '', type: 'info' });
      } else {
        toast.error('Failed to create announcement');
      }
    } catch (error) {
      toast.error('Error creating announcement');
    }
  };

  return (
    <main className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-[#999999] mt-2">{user.email}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/gate">
              <Button variant="outline">Gate Verification</Button>
            </Link>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 border-b border-[#333333]">
          {(['events', 'registrations', 'announcements'] as Panel[]).map((panel) => (
            <button
              key={panel}
              onClick={() => setActivePanel(panel)}
              className={`px-4 py-2 font-bold capitalize border-b-2 transition-colors ${
                activePanel === panel
                  ? 'text-white border-white'
                  : 'text-[#666666] border-transparent hover:text-white'
              }`}
            >
              {panel}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Panel */}
          <div className="lg:col-span-2">
            {activePanel === 'events' && (
              <div className="space-y-6">
                <div className="bg-[#111111] border border-[#333333] rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Events ({events.length})</h3>
                  {eventsLoading ? (
                    <Spinner />
                  ) : events.length === 0 ? (
                    <p className="text-[#666666]">No events yet</p>
                  ) : (
                    <div className="space-y-3">
                      {events.map((event) => (
                        <div
                          key={event.id}
                          className="bg-[#0d0d0d] border border-[#333333] rounded-lg p-4 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <p className="font-bold text-white">{event.name}</p>
                            <p className="text-xs text-[#666666] mt-1">
                              {event.registeredCount} / {event.capacity} registered
                            </p>
                          </div>
                          <PillBadge>{event.category}</PillBadge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activePanel === 'registrations' && (
              <div className="bg-[#111111] border border-[#333333] rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Registrations ({registrations.length})
                </h3>
                {registrationsLoading ? (
                  <Spinner />
                ) : registrations.length === 0 ? (
                  <p className="text-[#666666]">No registrations</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#333333]">
                          <th className="text-left py-2 px-3 text-[#999999]">Name</th>
                          <th className="text-left py-2 px-3 text-[#999999]">Email</th>
                          <th className="text-left py-2 px-3 text-[#999999]">Event</th>
                          <th className="text-left py-2 px-3 text-[#999999]">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {registrations.slice(0, 10).map((reg) => (
                          <tr key={reg.id} className="border-b border-[#1a1a1a]">
                            <td className="py-3 px-3 text-white">{reg.userName}</td>
                            <td className="py-3 px-3 text-[#999999]">{reg.userEmail}</td>
                            <td className="py-3 px-3 text-[#999999]">{reg.eventName}</td>
                            <td className="py-3 px-3">
                              <PillBadge variant={reg.paymentStatus === 'completed' ? 'success' : 'warning'}>
                                {reg.paymentStatus}
                              </PillBadge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {registrations.length > 10 && (
                      <p className="text-xs text-[#666666] mt-4">
                        Showing 10 of {registrations.length}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activePanel === 'announcements' && (
              <div className="bg-[#111111] border border-[#333333] rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                  Announcements ({announcements.length})
                </h3>
                {announcementsLoading ? (
                  <Spinner />
                ) : announcements.length === 0 ? (
                  <p className="text-[#666666]">No announcements</p>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className="bg-[#0d0d0d] border border-[#333333] rounded-lg p-4"
                      >
                        <p className="font-bold text-white">{announcement.title}</p>
                        <p className="text-xs text-[#666666] mt-1">{announcement.message}</p>
                        <p className="text-xs text-[#666666] mt-2">
                          {formatDateTime(announcement.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Panel */}
          <div>
            {activePanel === 'events' && (
              <form onSubmit={handleCreateEvent} className="bg-[#111111] border border-[#333333] rounded-xl p-6 space-y-4">
                <h3 className="font-bold text-white">Create Event</h3>
                <input
                  type="text"
                  placeholder="Event name"
                  value={createEventForm.name}
                  onChange={(e) => setCreateEventForm({ ...createEventForm, name: e.target.value })}
                  className="w-full bg-[#0d0d0d] border border-[#333333] rounded px-3 py-2 text-white text-sm"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={createEventForm.description}
                  onChange={(e) =>
                    setCreateEventForm({ ...createEventForm, description: e.target.value })
                  }
                  className="w-full bg-[#0d0d0d] border border-[#333333] rounded px-3 py-2 text-white text-sm"
                  required
                />
                <input
                  type="date"
                  value={createEventForm.date}
                  onChange={(e) => setCreateEventForm({ ...createEventForm, date: e.target.value })}
                  className="w-full bg-[#0d0d0d] border border-[#333333] rounded px-3 py-2 text-white text-sm"
                  required
                />
                <input
                  type="time"
                  placeholder="Start time"
                  value={createEventForm.startTime}
                  onChange={(e) =>
                    setCreateEventForm({ ...createEventForm, startTime: e.target.value })
                  }
                  className="w-full bg-[#0d0d0d] border border-[#333333] rounded px-3 py-2 text-white text-sm"
                  required
                />
                <input
                  type="time"
                  placeholder="End time"
                  value={createEventForm.endTime}
                  onChange={(e) => setCreateEventForm({ ...createEventForm, endTime: e.target.value })}
                  className="w-full bg-[#0d0d0d] border border-[#333333] rounded px-3 py-2 text-white text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={createEventForm.location}
                  onChange={(e) => setCreateEventForm({ ...createEventForm, location: e.target.value })}
                  className="w-full bg-[#0d0d0d] border border-[#333333] rounded px-3 py-2 text-white text-sm"
                  required
                />
                <input
                  type="number"
                  placeholder="Capacity"
                  value={createEventForm.capacity}
                  onChange={(e) =>
                    setCreateEventForm({ ...createEventForm, capacity: parseInt(e.target.value) })
                  }
                  className="w-full bg-[#0d0d0d] border border-[#333333] rounded px-3 py-2 text-white text-sm"
                  required
                />
                <Button type="submit" className="w-full">
                  Create Event
                </Button>
              </form>
            )}

            {activePanel === 'announcements' && (
              <form
                onSubmit={handleCreateAnnouncement}
                className="bg-[#111111] border border-[#333333] rounded-xl p-6 space-y-4"
              >
                <h3 className="font-bold text-white">Create Announcement</h3>
                <input
                  type="text"
                  placeholder="Title"
                  value={createAnnouncementForm.title}
                  onChange={(e) =>
                    setCreateAnnouncementForm({ ...createAnnouncementForm, title: e.target.value })
                  }
                  className="w-full bg-[#0d0d0d] border border-[#333333] rounded px-3 py-2 text-white text-sm"
                  required
                />
                <textarea
                  placeholder="Message"
                  value={createAnnouncementForm.message}
                  onChange={(e) =>
                    setCreateAnnouncementForm({
                      ...createAnnouncementForm,
                      message: e.target.value,
                    })
                  }
                  className="w-full bg-[#0d0d0d] border border-[#333333] rounded px-3 py-2 text-white text-sm"
                  required
                />
                <select
                  value={createAnnouncementForm.type}
                  onChange={(e) =>
                    setCreateAnnouncementForm({
                      ...createAnnouncementForm,
                      type: e.target.value as any,
                    })
                  }
                  className="w-full bg-[#0d0d0d] border border-[#333333] rounded px-3 py-2 text-white text-sm"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="urgent">Urgent</option>
                </select>
                <Button type="submit" className="w-full">
                  Create Announcement
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
