'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#111111',
          color: '#ffffff',
          border: '1px solid #333333',
          borderRadius: '6px',
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          padding: '12px 16px',
        },
        success: {
          style: {
            borderColor: '#00cc00',
          },
        },
        error: {
          style: {
            borderColor: '#cc0000',
          },
        },
      }}
    />
  );
}
