export interface SettingsDoc {
  upiVpa: string
  sheetId: string
  registrationOpen: boolean
  activeGmailSender?: string
  updatedAt: any
  updatedBy: string
}

export type PaymentStatus = "PENDING" | "APPROVED" | "REJECTED" | string

export type MemberType = "Leader" | "Member" | "Substitute"

export interface SubstituteData {
  name?: string
  email?: string
  phone?: string
  college?: string
  year?: string
  memberType?: MemberType
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
  memberType?: MemberType
  teamMembers: Array<{
    name: string
    email?: string
    phone?: string
    college?: string
    year?: string
    memberType?: MemberType
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
