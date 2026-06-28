'use client';

import { useAuth } from '@/hooks/useAuth';
import { useFirestore } from '@/hooks/useFirestore';
import { where } from 'firebase/firestore';
import { Registration, Announcement } from '@/types/spectrum';
import { PassCard } from '@/components/PassCard';
import { Skeleton, SkeletonLoader } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  const {
    data: registrations,
    loading: registrationsLoading,
    error: registrationsError,
  } = useFirestore<Registration>('registrations', user ? [where('userId', '==', user.uid)] : []);

  const { data: announcements, loading: announcementsLoading } = useFirestore<Announcement>(
    'announcements',
    [where('targetAudience', 'in', ['all', 'registered'])]
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-6xl mx-auto">
          <SkeletonLoader />
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <main className="min-h-screen bg-black p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white">My Passes</h1>
            <p className="text-[#999999] mt-2">Welcome, {user.displayName || user.email}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/">
              <Button variant="outline">Browse Events</Button>
            </Link>
            <Button onClick={logout} variant="outline">
              Logout
            </Button>
          </div>
        </div>

        {/* Announcements */}
        {announcements.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white">Announcements</h2>
            <div className="space-y-2">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`p-4 rounded-lg border ${
                    announcement.type === 'urgent'
                      ? 'bg-[#3d0d0d] border-[#cc0000]'
                      : announcement.type === 'warning'
                        ? 'bg-[#3d3d0d] border-[#cccc00]'
                        : announcement.type === 'success'
                          ? 'bg-[#0d3d0d] border-[#00cc00]'
                          : 'bg-[#0d0d3d] border-[#0000cc]'
                  }`}
                >
                  <p className="font-bold text-white">{announcement.title}</p>
                  <p className="text-sm text-[#cccccc] mt-1">{announcement.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Passes */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">
            Your Passes ({registrations.length})
          </h2>

          {registrationsLoading ? (
            <SkeletonLoader />
          ) : registrations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#999999]">No registrations yet</p>
              <Link href="/">
                <Button className="mt-4">Browse Events</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6">
              {registrations.map((registration) => (
                <PassCard key={registration.id} registration={registration} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
