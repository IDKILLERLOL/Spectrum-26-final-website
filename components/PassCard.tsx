'use client';

import { Registration } from '@/types/spectrum';
import { formatDateTime } from '@/lib/helpers';
import { QRCodeComponent } from './ui/QRCode';
import { PillBadge } from './ui/PillBadge';

export interface PassCardProps {
  registration: Registration;
  showQR?: boolean;
}

export function PassCard({ registration, showQR = true }: PassCardProps) {
  const statusVariant =
    registration.paymentStatus === 'completed'
      ? 'success'
      : registration.paymentStatus === 'failed'
        ? 'error'
        : 'warning';

  return (
    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border-2 border-[#333333] rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{registration.eventName}</h3>
          <p className="text-sm text-[#999999] mt-1">{registration.userName}</p>
        </div>
        <PillBadge variant={statusVariant as any}>{registration.paymentStatus.toUpperCase()}</PillBadge>
      </div>

      {/* QR Code */}
      {showQR && (
        <div className="flex justify-center bg-white rounded-lg p-4">
          <QRCodeComponent value={registration.qrCode} size={200} />
        </div>
      )}

      {/* Pass Code */}
      <div className="bg-[#111111] rounded-lg p-4 border border-[#333333]">
        <p className="text-xs text-[#666666] mb-1">PASS CODE</p>
        <p className="text-2xl font-mono font-bold text-white tracking-wider">{registration.passCode}</p>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <p className="text-[#666666] mb-1">Email</p>
          <p className="text-white break-all">{registration.userEmail}</p>
        </div>
        <div>
          <p className="text-[#666666] mb-1">Phone</p>
          <p className="text-white">{registration.userPhone}</p>
        </div>
        <div>
          <p className="text-[#666666] mb-1">College</p>
          <p className="text-white">{registration.userCollege}</p>
        </div>
        <div>
          <p className="text-[#666666] mb-1">Registered</p>
          <p className="text-white">{formatDateTime(registration.registrationDate)}</p>
        </div>
      </div>

      {/* Check-in Status */}
      {registration.checkInTime ? (
        <div className="bg-[#0d3d0d] border border-[#00cc00] rounded-lg p-3">
          <p className="text-xs text-[#00cc00] font-bold">✓ CHECKED IN</p>
          <p className="text-xs text-[#00cc00] mt-1">{formatDateTime(registration.checkInTime)}</p>
        </div>
      ) : (
        <div className="bg-[#3d3d0d] border border-[#cccc00] rounded-lg p-3">
          <p className="text-xs text-[#ffff00] font-bold">○ PENDING CHECK-IN</p>
          <p className="text-xs text-[#ffff00] mt-1">Show your pass code at the gate</p>
        </div>
      )}
    </div>
  );
}
