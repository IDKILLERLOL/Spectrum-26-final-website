export interface SettingsDoc {
  upiVpa: string
  sheetId: string
  registrationOpen: boolean
  activeGmailSender?: string
  updatedAt: any
  updatedBy: string
}

export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED" | string

export interface SubstituteData {
  name?: string
  email?: string
  phone?: string
  college?: string
  year?: string
}

export interface FirestoreRegistration {
  id?: string
  teamId?: string
  teamName?: string
  teamNameNormalized?: string
  userEmail: string
  fullName: string
  phone: string
  collegeName: string
  year: string
  eventId: string
  eventName: string
  teamMembers: Array<{
    name: string
    email?: string
    phone?: string
    college?: string
    year?: string
  }>
  teamSize: number
  substitute?: SubstituteData | null
  substituteName?: string
  substituteEmail?: string
  substitutePhone?: string
  substituteCollege?: string
  substituteYear?: string
  paymentRefId: string
  amountPaid: number
  paymentStatus: PaymentStatus
  pictureUrl?: string
  checkedIn?: boolean
  paymentVerifiedBy?: string | null
  paymentVerifiedAt?: string | null
  sheetsSyncStatus: "PENDING" | "SYNCED" | "FAILED" | string
  emailSentAt?: string | null
  createdAt: any
  updatedAt: any
}
