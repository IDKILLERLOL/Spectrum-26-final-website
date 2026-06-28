'use client';

import QRCode from 'qrcode.react';

export interface QRCodeProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
  className?: string;
}

export function QRCodeComponent({ value, size = 256, level = 'H', className = '' }: QRCodeProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <QRCode value={value} size={size} level={level} bgColor="#ffffff" fgColor="#000000" />
    </div>
  );
}
