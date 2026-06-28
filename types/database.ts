export interface Event {
  id?: string
  name: string
  category: 'TECH' | 'NON_TECH'
  description: string
  rules: string[]
  price: number
  maxSeats: number
  registeredCount: number
  registrationOpen: boolean
  bannerUrl: string | null
  prizePool: string | null
  googleFormUrl: string | null
  createdAt: string
}

export interface Registration {
  id?: string
  participantId: string
  name: string
  email: string
  eventId: string
  eventName: string
  eventCategory: 'TECH' | 'NON_TECH'
  paymentStatus: 'PENDING' | 'PAID' | 'FREE'
  upiTransactionId: string | null
  stripeSessionId: null
  registrationTimestamp: string
}

export interface Announcement {
  id?: string
  title: string
  content: string
  isActive: boolean
  createdAt: string
}

export interface AdminWhitelist {
  id?: string
  email: string
  addedAt: string
}

export interface AdminAuditLog {
  id?: string
  adminEmail: string | null
  actionType: 'FAILED_GATE_1' | 'UNAUTHORIZED_OAUTH' | 'LOGIN_SUCCESS' | 'LOGOUT'
  ipAddress: string | null
  isSuspicious: boolean
  timestamp: string
}
