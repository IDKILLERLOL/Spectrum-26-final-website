import { NextRequest, NextResponse } from 'next/server';
import { createRegistration, getRegistrationByPassCode, updateDocument } from '@/lib/firebase-utils';
import { Registration } from '@/types/spectrum';
import { generatePassCode } from '@/lib/helpers';

export async function POST(request: NextRequest) {
  try {
    const registrationData = await request.json();

    // Validate required fields
    if (!registrationData.userId || !registrationData.eventId || !registrationData.userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate pass code and QR code data
    const passCode = generatePassCode();
    const qrCodeData = JSON.stringify({
      passCode,
      eventId: registrationData.eventId,
      userId: registrationData.userId,
    });

    const registrationId = await createRegistration({
      ...registrationData,
      passCode,
      qrCode: qrCodeData,
      paymentStatus: 'pending',
      registrationDate: Date.now(),
    } as Omit<Registration, 'id'>);

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Failed to create registration' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, registrationId, passCode },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create registration' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const passCode = request.nextUrl.searchParams.get('passCode');

    if (!passCode) {
      return NextResponse.json(
        { error: 'Pass code required' },
        { status: 400 }
      );
    }

    const registration = await getRegistrationByPassCode(passCode);

    if (!registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: registration },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch registration' },
      { status: 500 }
    );
  }
}
