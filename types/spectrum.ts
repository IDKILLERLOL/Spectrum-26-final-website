// Firestore Document Types for Spectrum 26
export interface Event {
  id?: string;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  registeredCount: number;
  category: 'workshop' | 'talk' | 'social' | 'other';
  imageUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Registration {
  id?: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  userCollege: string;
  eventId: string;
  eventName: string;
  registrationDate: number;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  transactionId?: string;
  upiId?: string;
  passCode: string;
  qrCode: string;
  checkInTime?: number;
  checkInLocation?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Announcement {
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  eventId?: string;
  targetAudience: 'all' | 'registered' | 'admin';
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
}

export interface AdminUser {
  id?: string;
  email: string;
  role: 'admin' | 'gate-operator' | 'organizer';
  permissions: string[];
  addedAt: number;
  addedBy: string;
}

export interface AuditLog {
  id?: string;
  adminEmail: string;
  action: string;
  details: Record<string, any>;
  timestamp: number;
  ipAddress?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  registrations: Registration[];
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}
