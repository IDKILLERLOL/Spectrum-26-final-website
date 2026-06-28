import { NextRequest, NextResponse } from 'next/server';
import { getRegistrationByPassCode, updateDocument, logAuditEvent } from '@/lib/firebase-utils';
import { Registration } from '@/types/spectrum';
import { getIpAddress } from '@/lib/helpers';

export async function POST(request: NextRequest) {
  try {
    const { passCode, location, verifiedBy } = await request.json();
    const ipAddress = getIpAddress(request.headers);

    if (!passCode || !verifiedBy) {
      return NextResponse.json(
        { error: 'Pass code and verifier email required' },
        { status: 400 }
      );
    }

    // Get registration
    const registration = await getRegistrationByPassCode(passCode);

    if (!registration || !registration.id) {
      return NextResponse.json(
        { error: 'Invalid pass code' },
        { status: 404 }
      );
    }

    // Check if already checked in
    if (registration.checkInTime) {
      return NextResponse.json(
        {
          error: 'Already checked in',
          data: {
            name: registration.userName,
            eventName: registration.eventName,
            checkInTime: new Date(registration.checkInTime).toLocaleString(),
          },
        },
        { status: 409 }
      );
    }

    // Update registration with check-in info
    const updateSuccess = await updateDocument<Registration>(
      'registrations',
      registration.id,
      {
        checkInTime: Date.now(),
        checkInLocation: location || 'Gate',
        updatedAt: Date.now(),
      }
    );

    if (!updateSuccess) {
      return NextResponse.json(
        { error: 'Failed to verify pass' },
        { status: 500 }
      );
    }

    // Log audit event
    await logAuditEvent(
      verifiedBy,
      'GATE_VERIFICATION',
      {
        passCode,
        registrationId: registration.id,
        userName: registration.userName,
        eventName: registration.eventName,
      },
      ipAddress
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          name: registration.userName,
          eventName: registration.eventName,
          college: registration.userCollege,
          phone: registration.userPhone,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
