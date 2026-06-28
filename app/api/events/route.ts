import { NextRequest, NextResponse } from 'next/server';
import { getAllEvents, createEvent } from '@/lib/firebase-utils';
import { Event } from '@/types/spectrum';

export async function GET() {
  try {
    const events = await getAllEvents();
    return NextResponse.json({ success: true, data: events }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();

    // Validate required fields
    if (!eventData.name || !eventData.date || !eventData.startTime || !eventData.endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const eventId = await createEvent({
      ...eventData,
      registeredCount: 0,
    } as Omit<Event, 'id'>);

    if (!eventId) {
      return NextResponse.json(
        { error: 'Failed to create event' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, eventId },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}
