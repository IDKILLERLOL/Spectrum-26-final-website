import crypto from 'crypto';

// Generate unique pass code for registration
export function generatePassCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let passCode = '';
  for (let i = 0; i < 8; i++) {
    passCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return passCode;
}

// Generate secure token for verification
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Verify secure token (constant-time comparison)
export function verifySecureToken(token: string, hash: string): boolean {
  const tokenBuffer = Buffer.from(token);
  const hashBuffer = Buffer.from(hash);

  if (tokenBuffer.length !== hashBuffer.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < tokenBuffer.length; i++) {
    result |= tokenBuffer[i] ^ hashBuffer[i];
  }

  return result === 0;
}

// Format date for display
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Format time
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format date and time
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Calculate time remaining until event
export function getTimeRemaining(eventTimestamp: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isOver: boolean;
} {
  const now = Date.now();
  const diff = eventTimestamp - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isOver: false,
  };
}

// Validate email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number (Indian format)
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

// Validate UPI ID
export function validateUpiId(upiId: string): boolean {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;
  return upiRegex.test(upiId);
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Truncate text
export function truncateText(text: string, length: number = 100): string {
  return text.length > length ? text.substring(0, length) + '...' : text;
}

// Get IP address from headers
export function getIpAddress(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return headers.get('x-real-ip') || 'unknown';
}

// Delay function for async operations
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
