// ─── Spectrum 26 — TypeScript Interfaces ─────────────────────────────────────
// Matches the data model in CLAUDE.md §2 exactly.
// Do NOT add new fields here without updating Firestore + security rules too.

export interface User {
  id: string;          // Firebase Auth UID
  email: string;
  name: string;
  phone: string;
  authMethod: 'google' | 'otp';
  createdAt: Date;
  college?: string;
}

export interface Event {
  id: string;
  name: string;
  category: 'TECH' | 'NON_TECH';
  isTeamEvent: boolean;
  /** null = TBA / no cap */
  maxTeams: number | null;
  currentTeamCount: number;
  registrationOpen: boolean;
  /** null = TBA */
  price: number | null;
  description: string;
  rulesUrl: string | null;
  minMembers: number;
  maxMembers: number;
}

export const FALLBACK_EVENTS: Event[] = [
  {
    id: "tech-1",
    name: "Reverse Engineering",
    category: "TECH",
    description: "Deconstruct compiled binaries to understand pure logic architecture. Speed and accuracy define the victor.",
    isTeamEvent: false,
    maxTeams: null,
    currentTeamCount: 0,
    registrationOpen: true,
    price: 0,
    rulesUrl: null,
    minMembers: 1,
    maxMembers: 1
  },
  {
    id: "tech-2",
    name: "Speed Typing",
    category: "TECH",
    description: "Raw WPM vs flawless syntax. A mechanical sprint through complex code blocks under pressure.",
    isTeamEvent: false,
    maxTeams: null,
    currentTeamCount: 0,
    registrationOpen: true,
    price: 0,
    rulesUrl: null,
    minMembers: 1,
    maxMembers: 1
  },
  {
    id: "tech-3",
    name: "Code Prism",
    category: "TECH",
    description: "Competitive programming challenge focusing on algorithmic efficiency and data structure optimization.",
    isTeamEvent: false,
    maxTeams: null,
    currentTeamCount: 0,
    registrationOpen: true,
    price: 0,
    rulesUrl: null,
    minMembers: 1,
    maxMembers: 1
  },
  {
    id: "non-tech-1",
    name: "BGMI",
    category: "NON_TECH",
    description: "Squad up. Drop in. Survive. Tactical coordination and raw aiming skill in the ultimate arena.",
    isTeamEvent: true,
    maxTeams: 50,
    currentTeamCount: 0,
    registrationOpen: true,
    price: 800,
    rulesUrl: null,
    minMembers: 4,
    maxMembers: 5
  },
  {
    id: "non-tech-2",
    name: "Free Fire",
    category: "NON_TECH",
    description: "Fast-paced, high-stakes combat. Dominate the skirmish and outlast the competition.",
    isTeamEvent: true,
    maxTeams: 50,
    currentTeamCount: 0,
    registrationOpen: true,
    price: 600,
    rulesUrl: null,
    minMembers: 4,
    maxMembers: 4
  },
  {
    id: "non-tech-3",
    name: "FC 26",
    category: "NON_TECH",
    description: "The ultimate digital pitch. Bring your tactical formations and flawless execution to the tournament.",
    isTeamEvent: false,
    maxTeams: null,
    currentTeamCount: 0,
    registrationOpen: true,
    price: 100,
    rulesUrl: null,
    minMembers: 1,
    maxMembers: 1
  }
];


export interface Registration {
  id: string;
  /** Immutable after creation — enforced in Firestore rules and the UI. */
  eventId: string;
  leaderId: string; // User UID
  feeStatus: 'PENDING' | 'PAID';
  upiTransactionRef: string | null;
  paymentProofUrl?: string | null;
  checkedIn: boolean;
  createdAt: Date;
  lastEditedBy: string; // User UID or admin email
  lastEditedAt: Date;
  teamName?: string | null;
}

export interface TeamMember {
  id: string;
  registrationId: string;
  userId: string; // User UID (may be empty string for manually-added members not yet registered)
  role: 'LEADER' | 'MEMBER';
  name: string;
  email: string;
  phone: string;
  /** Soft-delete only — rows are never hard-deleted. */
  status: 'ACTIVE' | 'REMOVED';
  addedAt: Date;
  removedAt: Date | null;
  college?: string;
}

export interface Winner {
  id: string;
  eventId: string;
  placement: 1 | 2 | 3;
  registrationId: string;
  recordedBy: string;    // admin email
  recordedAt: Date;
  lastEditedBy: string;
  lastEditedAt: Date;
}

export interface AdminWhitelistEntry {
  email: string; // also the Firestore document ID
  addedBy: string;
  addedAt: Date;
}

export type AuditActionType =
  | 'REGISTRATION_CREATED'
  | 'MEMBER_ADDED'
  | 'MEMBER_REMOVED'
  | 'MEMBER_EDITED'
  | 'LEADERSHIP_TRANSFERRED'
  | 'FEE_STATUS_CHANGED'
  | 'CHECKED_IN_TOGGLED'
  | 'EVENT_CREATED'
  | 'EVENT_UPDATED'
  | 'EVENT_DELETED'
  | 'WINNER_RECORDED'
  | 'WINNER_UPDATED'
  | 'ADMIN_ADDED'
  | 'ADMIN_REMOVED'
  | 'PROFILE_UPDATED'
  | 'SCHEDULE_CREATED'
  | 'SCHEDULE_UPDATED'
  | 'SCHEDULE_DELETED'
  | 'GATE_FAILED'
  | 'UNAUTHORIZED_ADMIN_ATTEMPT';


export interface AuditLog {
  id: string;
  /** null for unauthenticated gate failures */
  actorEmail: string | null;
  actorName?: string | null;
  actorId?: string | null;
  actorType: 'PARTICIPANT' | 'ADMIN' | 'SYSTEM';
  actionType: AuditActionType | string;
  targetRegistrationId: string | null;
  targetEventId: string | null;
  teamName?: string | null;
  eventName?: string | null;
  diffOld: Record<string, unknown> | null;
  diffNew: Record<string, unknown> | null;
  timestamp: Date;
  ipAddress: string | null;
}

// ─── Derived / UI helpers ─────────────────────────────────────────────────────

/** True if this event has a hard capacity limit AND it's been reached. */
export function isEventFull(event: Event): boolean {
  return event.maxTeams !== null && event.currentTeamCount >= event.maxTeams;
}

/** True if a participant can currently register for this event. */
export function canRegister(event: Event): boolean {
  return event.registrationOpen && !isEventFull(event);
}

/** Display string for a TECH/NON_TECH category — exactly as specified. */
export function categoryLabel(category: 'TECH' | 'NON_TECH'): string {
  return category === 'TECH' ? 'TECH' : 'NON-TECH';
}

// ─── Schedule ────────────────────────────────────────────────────────────────

export type ScheduleEventType = 'TECH' | 'NON_TECH' | 'GENERAL' | 'BREAK';

export interface ScheduleSlot {
  id: string;
  /** Day label shown as section header, e.g. "Day 01" */
  day: string;
  /** Human-readable date string, e.g. "Monday, Sep 28" */
  date: string;
  /** 24-hour time string used for sorting, e.g. "09:00" */
  sortTime: string;
  /** Display time shown on the card, e.g. "9:00 AM" */
  displayTime: string;
  location: string;
  title: string;
  type: ScheduleEventType;
  /** Optional sort order within the same day; lower = shown first */
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
