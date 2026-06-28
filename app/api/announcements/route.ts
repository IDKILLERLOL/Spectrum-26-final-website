import { NextRequest, NextResponse } from 'next/server';
import { getAnnouncements, createAnnouncement } from '@/lib/firebase-utils';
import { Announcement } from '@/types/spectrum';
import { where } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const eventId = request.nextUrl.searchParams.get('eventId');
    const announcements = await getAnnouncements(eventId || undefined);

    return NextResponse.json(
      { success: true, data: announcements },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const announcementData = await request.json();

    // Validate required fields
    if (!announcementData.title || !announcementData.message) {
      return NextResponse.json(
        { error: 'Title and message required' },
        { status: 400 }
      );
    }

    const announcementId = await createAnnouncement({
      ...announcementData,
      type: announcementData.type || 'info',
      targetAudience: announcementData.targetAudience || 'all',
    } as Omit<Announcement, 'id'>);

    if (!announcementId) {
      return NextResponse.json(
        { error: 'Failed to create announcement' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, announcementId },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create announcement' },
      { status: 500 }
    );
  }
}
