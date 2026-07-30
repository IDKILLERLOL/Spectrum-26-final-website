// ─── Firestore Data Layer ─────────────────────────────────────────────────────
// All Firestore reads/writes go through this module.
// Uses the named database from firebase-applet-config.json.

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  runTransaction,
  serverTimestamp,
  Timestamp,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  QueryConstraint,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { initializeApp, getApps } from 'firebase/app';
import fallbackConfig from '../../firebase-applet-config.json';
import type {
  User,
  Event,
  Registration,
  TeamMember,
  Winner,
  AdminWhitelistEntry,
  AuditLog,
  AuditActionType,
  ScheduleSlot,
  ScheduleEventType,
} from '../types';
import { FALLBACK_EVENTS } from '../types';

const getEnv = (key: string): string => {
  try {
    // @ts-ignore
    return import.meta.env[key] || process.env[key] || '';
  } catch {
    try {
      return process.env[key] || '';
    } catch {
      return '';
    }
  }
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY') || fallbackConfig.apiKey || "",
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN') || fallbackConfig.authDomain || "",
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID') || fallbackConfig.projectId || "",
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET') || fallbackConfig.storageBucket || "",
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || fallbackConfig.messagingSenderId || "",
  appId: getEnv('VITE_FIREBASE_APP_ID') || fallbackConfig.appId || "",
  measurementId: getEnv('VITE_FIREBASE_MEASUREMENT_ID') || fallbackConfig.measurementId || "",
  firestoreDatabaseId: getEnv('VITE_FIREBASE_DATABASE_ID') || fallbackConfig.firestoreDatabaseId || "(default)"
};

// ─── Init ─────────────────────────────────────────────────────────────────────

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const DB_ID: string = firebaseConfig.firestoreDatabaseId || '(default)';
export const db = getFirestore(app, DB_ID);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function tsToDate(v: unknown): Date {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  if (typeof v === 'string') return new Date(v);
  return new Date();
}

function snapToUser(snap: DocumentSnapshot | QueryDocumentSnapshot): User {
  const d = snap.data()!;
  return {
    id: snap.id,
    email: d.email ?? '',
    name: d.name ?? '',
    phone: d.phone ?? '',
    authMethod: d.authMethod ?? 'google',
    createdAt: tsToDate(d.createdAt),
    college: d.college ?? '',
  };
}

function snapToEvent(snap: DocumentSnapshot | QueryDocumentSnapshot): Event {
  const d = snap.data()!;
  const isTeam = d.isTeamEvent ?? false;
  return {
    id: snap.id,
    name: d.name ?? '',
    category: d.category ?? 'TECH',
    isTeamEvent: isTeam,
    maxTeams: d.maxTeams ?? null,
    currentTeamCount: d.currentTeamCount ?? 0,
    registrationOpen: d.registrationOpen ?? false,
    price: d.price ?? null,
    description: d.description ?? '',
    rulesUrl: d.rulesUrl ?? null,
    minMembers: d.minMembers ?? (isTeam ? 2 : 1),
    maxMembers: d.maxMembers ?? (isTeam ? 4 : 1),
  };
}

function snapToRegistration(snap: DocumentSnapshot | QueryDocumentSnapshot): Registration {
  const d = snap.data()!;
  return {
    id: snap.id,
    eventId: d.eventId ?? '',
    leaderId: d.leaderId ?? '',
    feeStatus: d.feeStatus ?? 'PENDING',
    upiTransactionRef: d.upiTransactionRef ?? null,
    checkedIn: d.checkedIn ?? false,
    createdAt: tsToDate(d.createdAt),
    lastEditedBy: d.lastEditedBy ?? '',
    lastEditedAt: tsToDate(d.lastEditedAt),
    teamName: d.teamName ?? null,
  };
}

function snapToTeamMember(snap: DocumentSnapshot | QueryDocumentSnapshot): TeamMember {
  const d = snap.data()!;
  return {
    id: snap.id,
    registrationId: d.registrationId ?? '',
    userId: d.userId ?? '',
    role: d.role ?? 'MEMBER',
    name: d.name ?? '',
    email: d.email ?? '',
    phone: d.phone ?? '',
    status: d.status ?? 'ACTIVE',
    addedAt: tsToDate(d.addedAt),
    removedAt: d.removedAt ? tsToDate(d.removedAt) : null,
    college: d.college ?? '',
  };
}

function snapToWinner(snap: DocumentSnapshot | QueryDocumentSnapshot): Winner {
  const d = snap.data()!;
  return {
    id: snap.id,
    eventId: d.eventId ?? '',
    placement: d.placement ?? 1,
    registrationId: d.registrationId ?? '',
    recordedBy: d.recordedBy ?? '',
    recordedAt: tsToDate(d.recordedAt),
    lastEditedBy: d.lastEditedBy ?? '',
    lastEditedAt: tsToDate(d.lastEditedAt),
  };
}

function snapToAuditLog(snap: DocumentSnapshot | QueryDocumentSnapshot): AuditLog {
  const d = snap.data()!;
  return {
    id: snap.id,
    actorEmail: d.actorEmail ?? null,
    actorName: d.actorName ?? null,
    actorId: d.actorId ?? null,
    actorType: d.actorType ?? 'PARTICIPANT',
    actionType: d.actionType ?? '',
    targetRegistrationId: d.targetRegistrationId ?? null,
    targetEventId: d.targetEventId ?? null,
    teamName: d.teamName ?? null,
    eventName: d.eventName ?? null,
    diffOld: d.diffOld ?? null,
    diffNew: d.diffNew ?? null,
    timestamp: tsToDate(d.timestamp),
    ipAddress: d.ipAddress ?? null,
  };
}

// ─── Audit Log (append-only) ──────────────────────────────────────────────────

/**
 * Logs a team action to Google Sheets using a Google Apps Script Web App URL.
 */
export async function logToGoogleSheets(
  teamName: string,
  eventName: string,
  action: string,
  actorEmail: string,
  actorType: string,
  details: string
): Promise<void> {
  const webAppUrl = getEnv('VITE_GOOGLE_SHEETS_WEBAPP_URL');
  if (!webAppUrl) {
    return;
  }

  const payload = {
    teamName,
    eventName,
    action,
    actorEmail,
    actorType,
    details,
    timestamp: new Date().toISOString()
  };

  try {
    await fetch(webAppUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('[google-sheets] Error writing to Google Sheet:', err);
  }
}

export async function appendAuditLog(entry: Omit<AuditLog, 'id'>): Promise<void> {
  let teamName = entry.teamName || null;
  let eventName = 'General';
  let actorName = entry.actorName || null;
  let actorId = entry.actorId || null;

  if (entry.actorEmail) {
    try {
      const uSnap = await getDocs(query(collection(db, 'users'), where('email', '==', entry.actorEmail)));
      if (!uSnap.empty) {
        const uDoc = uSnap.docs[0];
        actorId = uDoc.id;
        actorName = uDoc.data().name || null;
      } else {
        if (entry.actorType === 'ADMIN') {
          actorName = entry.actorEmail.split('@')[0];
          actorId = 'admin_' + entry.actorEmail;
        }
      }
    } catch (err) {
      console.warn('[audit-log] Failed to auto-fetch actor details:', err);
    }
  }

  if (entry.targetRegistrationId) {
    try {
      const regSnap = await getDoc(doc(db, 'registrations', entry.targetRegistrationId));
      if (regSnap.exists()) {
        const regData = regSnap.data();
        teamName = regData.teamName || null;
      }
    } catch (err) {
      console.warn('[audit-log] Failed to auto-fetch teamName:', err);
    }
  }

  if (entry.targetEventId) {
    try {
      const evSnap = await getDoc(doc(db, 'events', entry.targetEventId));
      if (evSnap.exists()) {
        eventName = evSnap.data().name || entry.targetEventId;
      }
    } catch (err) {
      console.warn('[audit-log] Failed to auto-fetch eventName:', err);
    }
  }

  // Log to Google Sheets
  if (entry.targetRegistrationId || entry.targetEventId) {
    const finalTeamName = teamName || (entry.targetRegistrationId ? `Team-${entry.targetRegistrationId.substring(0, 6)}` : 'N/A');
    try {
      await logToGoogleSheets(
        finalTeamName,
        eventName,
        entry.actionType,
        entry.actorEmail || 'anonymous',
        entry.actorType,
        JSON.stringify({
          ...(entry.diffNew || entry.diffOld || {}),
          actorName,
          actorId
        })
      );
    } catch (sheetErr) {
      console.warn('[google-sheets] Failed to write log to sheet:', sheetErr);
    }
  }

  await addDoc(collection(db, 'auditLog'), {
    ...entry,
    teamName,
    eventName,
    actorName,
    actorId,
    timestamp: serverTimestamp(),
  });
}

export async function syncAuditLogsToSheets(): Promise<{ success: number; failed: number }> {
  const webAppUrl = getEnv('VITE_GOOGLE_SHEETS_WEBAPP_URL');
  if (!webAppUrl) {
    throw new Error('Google Sheets WebApp URL is not configured.');
  }

  const snap = await getDocs(query(collection(db, 'auditLog'), orderBy('timestamp', 'asc')));
  const logs = snap.docs.map(snapToAuditLog);

  let successCount = 0;
  let failedCount = 0;

  for (const log of logs) {
    let teamName = log.teamName || null;
    let eventName = log.eventName || 'General';

    if (!teamName && log.targetRegistrationId) {
      try {
        const regSnap = await getDoc(doc(db, 'registrations', log.targetRegistrationId));
        if (regSnap.exists()) {
          teamName = regSnap.data().teamName || null;
        }
      } catch {}
    }
    if (eventName === 'General' && log.targetEventId) {
      try {
        const evSnap = await getDoc(doc(db, 'events', log.targetEventId));
        if (evSnap.exists()) {
          eventName = evSnap.data().name || 'General';
        }
      } catch {}
    }

    const finalTeamName = teamName || (log.targetRegistrationId ? `Team-${log.targetRegistrationId.substring(0, 6)}` : 'N/A');

    const payload = {
      teamName: finalTeamName,
      eventName,
      action: log.actionType,
      actorEmail: log.actorEmail || 'anonymous',
      actorType: log.actorType,
      details: JSON.stringify(log.diffNew || log.diffOld || {}),
      timestamp: log.timestamp.toISOString()
    };

    try {
      await fetch(webAppUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      successCount++;
    } catch (err) {
      console.error('[google-sheets] Sync failed for log:', log.id, err);
      failedCount++;
    }
  }

  return { success: successCount, failed: failedCount };
}

export async function getAuditLog(
  opts: {
    pageSize?: number;
    afterDoc?: QueryDocumentSnapshot;
    actionTypeFilter?: string;
  } = {}
): Promise<{ entries: AuditLog[]; lastDoc: QueryDocumentSnapshot | null }> {
  // Query up to 500 audit logs ordered by timestamp (single field index only)
  const snap = await getDocs(query(collection(db, 'auditLog'), orderBy('timestamp', 'desc'), limit(500)));
  let logs = snap.docs;

  if (opts.actionTypeFilter) {
    logs = logs.filter((doc) => doc.data().actionType === opts.actionTypeFilter);
  }

  if (opts.afterDoc) {
    const startIndex = logs.findIndex((doc) => doc.id === opts.afterDoc!.id);
    if (startIndex !== -1) {
      logs = logs.slice(startIndex + 1);
    }
  }

  const pageSize = opts.pageSize ?? 25;
  const pageDocs = logs.slice(0, pageSize);

  return {
    entries: pageDocs.map(snapToAuditLog),
    lastDoc: pageDocs[pageDocs.length - 1] ?? null,
  };
}

// ─── Admin Gate Failure Logging (public-write collection) ────────────────────

export async function logGateFailure(ipAddress: string | null): Promise<void> {
  await addDoc(collection(db, 'adminGateAttempts'), {
    actionType: 'GATE_FAILED',
    actorEmail: null,
    actorType: 'SYSTEM',
    ipAddress,
    timestamp: serverTimestamp(),
  });
}

export async function logUnauthorizedAdminAttempt(
  email: string,
  ipAddress: string | null
): Promise<void> {
  await addDoc(collection(db, 'adminGateAttempts'), {
    actionType: 'UNAUTHORIZED_ADMIN_ATTEMPT',
    actorEmail: email,
    actorType: 'SYSTEM',
    ipAddress,
    timestamp: serverTimestamp(),
  });
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function getUser(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snapToUser(snap) : null;
}

export async function getAllUsers(): Promise<User[]> {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
  return snap.docs.map(snapToUser);
}

/** Creates a User doc if one doesn't already exist. Called on first login. */
export async function upsertUser(
  uid: string,
  email: string,
  name: string,
  authMethod: 'google' | 'otp'
): Promise<User> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snapToUser(snap);
  const data: Omit<User, 'id'> = {
    email,
    name,
    phone: '',
    authMethod,
    createdAt: new Date(),
    college: '',
  };
  await setDoc(ref, { ...data, createdAt: serverTimestamp() });
  return { id: uid, ...data };
}

export async function updateUser(
  uid: string,
  patch: Partial<Pick<User, 'name' | 'phone' | 'email' | 'college'>>
): Promise<void> {
  await setDoc(doc(db, 'users', uid), patch, { merge: true });
}

export async function deleteUserDoc(uid: string, actorEmail: string = 'admin'): Promise<void> {
  const userMemsSnap = await getDocs(
    query(
      collection(db, 'teamMembers'),
      where('userId', '==', uid),
      where('status', '==', 'ACTIVE')
    )
  );

  const regMemsMap: Record<string, any[]> = {};
  const regDocsMap: Record<string, any> = {};
  const winnersToDelete: any[] = [];

  for (const memDoc of userMemsSnap.docs) {
    const memData = memDoc.data();
    const registrationId = memData.registrationId;

    const regMemsSnap = await getDocs(
      query(
        collection(db, 'teamMembers'),
        where('registrationId', '==', registrationId),
        where('status', '==', 'ACTIVE')
      )
    );
    regMemsMap[registrationId] = regMemsSnap.docs;

    if (regMemsSnap.docs.length <= 1) {
      const regSnap = await getDoc(doc(db, 'registrations', registrationId));
      if (regSnap.exists()) {
        regDocsMap[registrationId] = regSnap;
      }
      
      const wSnap = await getDocs(
        query(
          collection(db, 'winners'),
          where('registrationId', '==', registrationId)
        )
      );
      winnersToDelete.push(...wSnap.docs);
    }
  }

  await runTransaction(db, async (tx) => {
    tx.delete(doc(db, 'users', uid));

    // Process each registration they belong to
    for (const memDoc of userMemsSnap.docs) {
      const memData = memDoc.data();
      const registrationId = memData.registrationId;
      const activeMembers = regMemsMap[registrationId] || [];

      if (activeMembers.length <= 1) {
        // ONLY member -> delete entire registration
        const regSnap = regDocsMap[registrationId];
        if (regSnap && regSnap.exists()) {
          const regData = regSnap.data();
          const eventRef = doc(db, 'events', regData.eventId);

          for (const mDoc of activeMembers) {
            tx.delete(mDoc.ref);
          }

          tx.delete(regSnap.ref);
          tx.update(eventRef, { currentTeamCount: increment(-1) });
        }
      } else {
        // Multiple members -> just remove this user
        tx.delete(memDoc.ref);

        if (memData.role === 'LEADER') {
          const nextLeaderDoc = activeMembers.find((m) => m.id !== memDoc.id);
          if (nextLeaderDoc) {
            tx.update(nextLeaderDoc.ref, { role: 'LEADER' });
            tx.update(doc(db, 'registrations', registrationId), {
              leaderId: nextLeaderDoc.data().userId || ''
            });
          }
        }
      }
    }

    // Delete associated winners
    winnersToDelete.forEach((wDoc) => {
      tx.delete(wDoc.ref);
    });
  });

  await appendAuditLog({
    actorEmail,
    actorType: 'ADMIN',
    actionType: 'USER_DELETED',
    targetRegistrationId: null,
    targetEventId: null,
    diffOld: { userId: uid },
    diffNew: null,
    timestamp: new Date(),
    ipAddress: null,
  });
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function getEvents(): Promise<Event[]> {
  const snap = await getDocs(collection(db, 'events'));
  const dbEvents = snap.docs.map(snapToEvent);

  if (dbEvents.length === 0) {
    // Database is empty: seed default events once
    for (const fe of FALLBACK_EVENTS) {
      try {
        const ref = doc(db, 'events', fe.id);
        const data = {
          name: fe.name,
          category: fe.category,
          isTeamEvent: fe.isTeamEvent,
          maxTeams: fe.maxTeams,
          currentTeamCount: fe.currentTeamCount,
          registrationOpen: fe.registrationOpen,
          price: fe.price,
          description: fe.description,
          rulesUrl: fe.rulesUrl,
          minMembers: fe.minMembers,
          maxMembers: fe.maxMembers,
        };
        await setDoc(ref, data);
        dbEvents.push({ id: fe.id, ...data });
      } catch (err) {
        console.error('Error seeding fallback event to Firestore:', fe.id, err);
      }
    }
  }

  // Sort events list by category then name in memory
  dbEvents.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  return dbEvents;
}

export async function getEvent(eventId: string): Promise<Event | null> {
  try {
    const snap = await getDoc(doc(db, 'events', eventId));
    if (snap.exists()) return snapToEvent(snap);
  } catch {}
  return null;
}

export async function createEvent(
  data: Omit<Event, 'id' | 'currentTeamCount'>,
  actorEmail: string
): Promise<Event> {
  const ref = await addDoc(collection(db, 'events'), {
    ...data,
    currentTeamCount: 0,
  });
  await appendAuditLog({
    actorEmail,
    actorType: 'ADMIN',
    actionType: 'EVENT_CREATED',
    targetRegistrationId: null,
    targetEventId: ref.id,
    diffOld: null,
    diffNew: data as Record<string, unknown>,
    timestamp: new Date(),
    ipAddress: null,
  });
  const snap = await getDoc(ref);
  return snapToEvent(snap);
}

export async function updateEvent(
  eventId: string,
  patch: Partial<Omit<Event, 'id' | 'currentTeamCount'>>,
  actorEmail: string
): Promise<void> {
  const before = await getEvent(eventId);
  await updateDoc(doc(db, 'events', eventId), patch);
  await appendAuditLog({
    actorEmail,
    actorType: 'ADMIN',
    actionType: 'EVENT_UPDATED',
    targetRegistrationId: null,
    targetEventId: eventId,
    diffOld: before as Record<string, unknown> | null,
    diffNew: patch as Record<string, unknown>,
    timestamp: new Date(),
    ipAddress: null,
  });
}

export async function deleteEvent(eventId: string, actorEmail: string): Promise<void> {
  const event = await getEvent(eventId);
  if (!event) throw new Error('Event not found');
  if (event.currentTeamCount > 0) throw new Error('Cannot delete event with registered teams');
  await deleteDoc(doc(db, 'events', eventId));
  appendAuditLog({
    actorEmail,
    actorType: 'ADMIN',
    actionType: 'EVENT_DELETED',
    targetRegistrationId: null,
    targetEventId: eventId,
    diffOld: event as Record<string, unknown>,
    diffNew: null,
    timestamp: new Date(),
    ipAddress: null,
  }).catch(console.error);
}

// ─── Registrations ────────────────────────────────────────────────────────────

export async function getRegistration(regId: string): Promise<Registration | null> {
  const snap = await getDoc(doc(db, 'registrations', regId));
  return snap.exists() ? snapToRegistration(snap) : null;
}

export async function getMyRegistrations(uid: string, email?: string): Promise<Registration[]> {
  // Primary lookup: by Firebase UID
  const memberByUid = await getDocs(
    query(
      collection(db, 'teamMembers'),
      where('userId', '==', uid),
      where('status', '==', 'ACTIVE')
    )
  );

  const regIdSet = new Set<string>(memberByUid.docs.map((d) => d.data().registrationId as string));

  // Secondary lookup: by email
  if (email) {
    const memberByEmail = await getDocs(
      query(
        collection(db, 'teamMembers'),
        where('email', '==', email),
        where('status', '==', 'ACTIVE')
      )
    );
    memberByEmail.docs.forEach((d) => regIdSet.add(d.data().registrationId as string));
  }

  if (regIdSet.size === 0) return [];
  const regs = await Promise.all([...regIdSet].map((id) => getRegistration(id)));
  return regs.filter(Boolean) as Registration[];
}

/**
 * Links all TeamMember docs with matching email to the given uid.
 * Called on every login so that members get dashboard access.
 */
export async function linkMemberToUser(email: string, uid: string): Promise<void> {
  try {
    const snap = await getDocs(
      query(
        collection(db, 'teamMembers'),
        where('email', '==', email)
      )
    );
    if (snap.empty) return;
    await Promise.all(
      snap.docs.map(async (d) => {
        if (d.data().userId !== uid) {
          await updateDoc(doc(db, 'teamMembers', d.id), { userId: uid });
          const memberData = d.data();
          if (memberData && memberData.role === 'LEADER' && memberData.registrationId) {
            await updateDoc(doc(db, 'registrations', memberData.registrationId), {
              leaderId: uid,
            });
          }
        }
      })
    );
  } catch (err) {
    // Non-blocking — don't crash login flow if this fails
    console.warn('[linkMemberToUser] Failed to link member:', err);
  }
}

/** All registrations (for admin panel). Sorted in-memory to avoid composite index requirement. */
export async function getAllRegistrations(): Promise<Registration[]> {
  const snap = await getDocs(collection(db, 'registrations'));
  const regs = snap.docs.map(snapToRegistration);
  regs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return regs;
}

/** Returns true if the user already has an ACTIVE registration for the given event. */
export async function hasExistingRegistration(uid: string, eventId: string): Promise<string | null> {
  // Check if user is a LEADER of any registration for this event
  const snap = await getDocs(
    query(
      collection(db, 'registrations'),
      where('leaderId', '==', uid),
      where('eventId', '==', eventId)
    )
  );
  if (!snap.empty) return snap.docs[0].id;
  return null;
}

/**
 * Creates a registration + a LEADER TeamMember row for the registrant.
 * Increments event.currentTeamCount atomically.
 */
export async function createRegistration(
  eventId: string,
  leader: { uid: string; name: string; email: string; phone: string; college?: string },
  actorEmail: string,
  members: { name: string; email: string; phone: string; college?: string }[] = [],
  teamName?: string
): Promise<Registration> {
  // Duplicate registration guard: check if user is already registered as leader
  const existing = await hasExistingRegistration(leader.uid, eventId);
  if (existing) throw new Error(`ALREADY_REGISTERED:${existing}`);

  let regId = '';

  await runTransaction(db, async (tx) => {
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await tx.get(eventRef);
    if (!eventSnap.exists()) throw new Error('Event not found');
    const event = snapToEvent(eventSnap);
    if (!event.registrationOpen) throw new Error('Registration is closed');
    if (event.maxTeams !== null && event.currentTeamCount >= event.maxTeams)
      throw new Error('Event is full');

    const regRef = doc(collection(db, 'registrations'));
    regId = regRef.id;
    tx.set(regRef, {
      eventId,
      leaderId: leader.uid,
      feeStatus: 'PENDING',
      upiTransactionRef: null,
      checkedIn: false,
      createdAt: serverTimestamp(),
      lastEditedBy: leader.uid,
      lastEditedAt: serverTimestamp(),
      teamName: teamName || null,
    });

    const memberRef = doc(collection(db, 'teamMembers'));
    tx.set(memberRef, {
      registrationId: regId,
      userId: leader.uid,
      role: 'LEADER',
      name: leader.name,
      email: leader.email,
      phone: leader.phone,
      college: leader.college ?? '',
      status: 'ACTIVE',
      addedAt: serverTimestamp(),
      removedAt: null,
    });

    // Seed any extra team members entered during registration
    for (const m of members) {
      const extraMemberRef = doc(collection(db, 'teamMembers'));
      tx.set(extraMemberRef, {
        registrationId: regId,
        userId: '',  // Will be linked when that member logs in via linkMemberToUser
        role: 'MEMBER',
        name: m.name,
        email: m.email,
        phone: m.phone,
        college: m.college ?? leader.college ?? '',
        status: 'ACTIVE',
        addedAt: serverTimestamp(),
        removedAt: null,
      });
    }

    tx.update(eventRef, { currentTeamCount: increment(1) });
  });

  await appendAuditLog({
    actorEmail,
    actorType: 'PARTICIPANT',
    actionType: 'REGISTRATION_CREATED',
    targetRegistrationId: regId,
    targetEventId: eventId,
    diffOld: null,
    diffNew: { eventId, leaderId: leader.uid, memberCount: members.length + 1 },
    timestamp: new Date(),
    ipAddress: null,
  });
  const snap = await getDoc(doc(db, 'registrations', regId));
  autoSyncToSheets().catch(console.error);
  return snapToRegistration(snap);
}

export async function adminCreateRegistration(
  eventId: string,
  leader: { name: string; email: string; phone: string; college?: string },
  members: { name: string; email: string; phone: string; college?: string }[],
  adminEmail: string,
  teamName?: string
): Promise<Registration> {
  // 1. Look up if leader has an existing user doc
  const userSnap = await getDocs(
    query(collection(db, 'users'), where('email', '==', leader.email))
  );
  const leaderUid = userSnap.empty ? '' : userSnap.docs[0].id;

  // 2. Check if leader email is already in any active registration for this event
  const memberSnap = await getDocs(
    query(
      collection(db, 'teamMembers'),
      where('email', '==', leader.email),
      where('status', '==', 'ACTIVE')
    )
  );

  const existingRegIds = memberSnap.docs.map((d) => d.data().registrationId as string);
  for (const regId of existingRegIds) {
    const regDoc = await getDoc(doc(db, 'registrations', regId));
    if (regDoc.exists() && regDoc.data().eventId === eventId) {
      throw new Error(`LEADER_ALREADY_REGISTERED:${regId}`);
    }
  }

  // Same check for team members (prevent duplicates in same event)
  for (const m of members) {
    if (!m.email) continue;
    const mMemberSnap = await getDocs(
      query(
        collection(db, 'teamMembers'),
        where('email', '==', m.email),
        where('status', '==', 'ACTIVE')
      )
    );
    const mRegIds = mMemberSnap.docs.map((d) => d.data().registrationId as string);
    for (const regId of mRegIds) {
      const regDoc = await getDoc(doc(db, 'registrations', regId));
      if (regDoc.exists() && regDoc.data().eventId === eventId) {
        throw new Error(`MEMBER_ALREADY_REGISTERED:${m.email}:${regId}`);
      }
    }
  }

  let regId = '';

  await runTransaction(db, async (tx) => {
    const eventRef = doc(db, 'events', eventId);
    const eventSnap = await tx.get(eventRef);
    if (!eventSnap.exists()) throw new Error('Event not found');

    const regRef = doc(collection(db, 'registrations'));
    regId = regRef.id;
    tx.set(regRef, {
      eventId,
      leaderId: leaderUid,
      feeStatus: 'PENDING',
      upiTransactionRef: null,
      checkedIn: false,
      createdAt: serverTimestamp(),
      lastEditedBy: adminEmail,
      lastEditedAt: serverTimestamp(),
      teamName: teamName || null,
    });

    const memberRef = doc(collection(db, 'teamMembers'));
    tx.set(memberRef, {
      registrationId: regId,
      userId: leaderUid,
      role: 'LEADER',
      name: leader.name,
      email: leader.email,
      phone: leader.phone,
      college: leader.college ?? '',
      status: 'ACTIVE',
      addedAt: serverTimestamp(),
      removedAt: null,
    });

    for (const m of members) {
      const mUserSnap = await getDocs(
        query(collection(db, 'users'), where('email', '==', m.email))
      );
      const mUid = mUserSnap.empty ? '' : mUserSnap.docs[0].id;

      const extraMemberRef = doc(collection(db, 'teamMembers'));
      tx.set(extraMemberRef, {
        registrationId: regId,
        userId: mUid,
        role: 'MEMBER',
        name: m.name,
        email: m.email,
        phone: m.phone,
        college: m.college ?? leader.college ?? '',
        status: 'ACTIVE',
        addedAt: serverTimestamp(),
        removedAt: null,
      });
    }

    tx.update(eventRef, { currentTeamCount: increment(1) });
  });

  await appendAuditLog({
    actorEmail: adminEmail,
    actorType: 'ADMIN',
    actionType: 'REGISTRATION_CREATED',
    targetRegistrationId: regId,
    targetEventId: eventId,
    diffOld: null,
    diffNew: { eventId, leaderEmail: leader.email, memberCount: members.length + 1, createdByAdmin: true },
    timestamp: new Date(),
    ipAddress: null,
  });

  const snap = await getDoc(doc(db, 'registrations', regId));
  autoSyncToSheets().catch(console.error);
  return snapToRegistration(snap);
}

// ─── Team Members ─────────────────────────────────────────────────────────────

export async function getTeamMembers(registrationId: string): Promise<TeamMember[]> {
  const snap = await getDocs(
    query(
      collection(db, 'teamMembers'),
      where('registrationId', '==', registrationId)
    )
  );
  const members = snap.docs.map(snapToTeamMember);
  members.sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime());
  return members;
}

export async function getActiveTeamMembers(registrationId: string): Promise<TeamMember[]> {
  const snap = await getDocs(
    query(
      collection(db, 'teamMembers'),
      where('registrationId', '==', registrationId),
      where('status', '==', 'ACTIVE')
    )
  );
  const members = snap.docs.map(snapToTeamMember);
  members.sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime());
  return members;
}

export async function addTeamMember(
  registrationId: string,
  member: { name: string; email: string; phone: string; userId?: string },
  actorEmail: string,
  actorType: 'PARTICIPANT' | 'ADMIN'
): Promise<TeamMember> {
  const ref = await addDoc(collection(db, 'teamMembers'), {
    registrationId,
    userId: member.userId ?? '',
    role: 'MEMBER',
    name: member.name,
    email: member.email,
    phone: member.phone,
    status: 'ACTIVE',
    addedAt: serverTimestamp(),
    removedAt: null,
  });
  await appendAuditLog({
    actorEmail,
    actorType,
    actionType: 'MEMBER_ADDED',
    targetRegistrationId: registrationId,
    targetEventId: null,
    diffOld: null,
    diffNew: { name: member.name, email: member.email },
    timestamp: new Date(),
    ipAddress: null,
  });
  const snap = await getDoc(ref);
  autoSyncToSheets().catch(console.error);
  return snapToTeamMember(snap);
}

export async function updateTeamMember(
  memberId: string,
  registrationId: string,
  patch: Partial<Pick<TeamMember, 'name' | 'email' | 'phone' | 'college'>>,
  actorEmail: string,
  actorType: 'PARTICIPANT' | 'ADMIN'
): Promise<void> {
  const before = (await getDoc(doc(db, 'teamMembers', memberId))).data();
  await updateDoc(doc(db, 'teamMembers', memberId), patch);
  await appendAuditLog({
    actorEmail,
    actorType,
    actionType: 'MEMBER_EDITED',
    targetRegistrationId: registrationId,
    targetEventId: null,
    diffOld: before as Record<string, unknown>,
    diffNew: patch as Record<string, unknown>,
    timestamp: new Date(),
    ipAddress: null,
  });
  autoSyncToSheets().catch(console.error);
}

/** Soft-deletes a team member (status → REMOVED, never hard-delete). */
export async function removeTeamMember(
  memberId: string,
  registrationId: string,
  actorEmail: string,
  actorType: 'PARTICIPANT' | 'ADMIN'
): Promise<void> {
  const before = (await getDoc(doc(db, 'teamMembers', memberId))).data();
  await updateDoc(doc(db, 'teamMembers', memberId), {
    status: 'REMOVED',
    removedAt: serverTimestamp(),
  });
  await appendAuditLog({
    actorEmail,
    actorType,
    actionType: 'MEMBER_REMOVED',
    targetRegistrationId: registrationId,
    targetEventId: null,
    diffOld: before as Record<string, unknown>,
    diffNew: { status: 'REMOVED' },
    timestamp: new Date(),
    ipAddress: null,
  });
  autoSyncToSheets().catch(console.error);
}

/**
 * Transfers leadership atomically.
 * Invariant: exactly one LEADER at all times.
 */
export async function transferLeadership(
  registrationId: string,
  currentLeaderMemberId: string,
  newLeaderMemberId: string,
  newLeaderUserId: string,
  actorEmail: string,
  actorType: 'PARTICIPANT' | 'ADMIN'
): Promise<void> {
  await runTransaction(db, async (tx) => {
    const regRef = doc(db, 'registrations', registrationId);
    const oldRef = doc(db, 'teamMembers', currentLeaderMemberId);
    const newRef = doc(db, 'teamMembers', newLeaderMemberId);

    tx.update(oldRef, { role: 'MEMBER' });
    tx.update(newRef, { role: 'LEADER' });
    tx.update(regRef, { leaderId: newLeaderUserId, lastEditedBy: actorEmail, lastEditedAt: serverTimestamp() });
  });
  await appendAuditLog({
    actorEmail,
    actorType,
    actionType: 'LEADERSHIP_TRANSFERRED',
    targetRegistrationId: registrationId,
    targetEventId: null,
    diffOld: { leaderId: currentLeaderMemberId },
    diffNew: { leaderId: newLeaderMemberId },
    timestamp: new Date(),
    ipAddress: null,
  });
  autoSyncToSheets().catch(console.error);
}

// ─── Fee Status & Check-In ────────────────────────────────────────────────────

export async function updateFeeStatus(
  registrationId: string,
  feeStatus: 'PENDING' | 'PAID',
  upiTransactionRef: string | null,
  actorEmail: string
): Promise<void> {
  const before = await getRegistration(registrationId);
  await updateDoc(doc(db, 'registrations', registrationId), {
    feeStatus,
    upiTransactionRef,
    lastEditedBy: actorEmail,
    lastEditedAt: serverTimestamp(),
  });
  await appendAuditLog({
    actorEmail,
    actorType: 'ADMIN',
    actionType: 'FEE_STATUS_CHANGED',
    targetRegistrationId: registrationId,
    targetEventId: before?.eventId ?? null,
    diffOld: { feeStatus: before?.feeStatus },
    diffNew: { feeStatus },
    timestamp: new Date(),
    ipAddress: null,
  });
  autoSyncToSheets().catch(console.error);
}

export async function submitUpiRef(
  registrationId: string,
  upiTransactionRef: string,
  actorEmail: string
): Promise<void> {
  await updateDoc(doc(db, 'registrations', registrationId), {
    upiTransactionRef,
    lastEditedBy: actorEmail,
    lastEditedAt: serverTimestamp(),
  });
  autoSyncToSheets().catch(console.error);
}

export async function toggleCheckedIn(
  registrationId: string,
  checkedIn: boolean,
  actorEmail: string
): Promise<void> {
  await updateDoc(doc(db, 'registrations', registrationId), {
    checkedIn,
    lastEditedBy: actorEmail,
    lastEditedAt: serverTimestamp(),
  });
  await appendAuditLog({
    actorEmail,
    actorType: 'ADMIN',
    actionType: 'CHECKED_IN_TOGGLED',
    targetRegistrationId: registrationId,
    targetEventId: null,
    diffOld: { checkedIn: !checkedIn },
    diffNew: { checkedIn },
    timestamp: new Date(),
    ipAddress: null,
  });
  autoSyncToSheets().catch(console.error);
}

// ─── Winners ──────────────────────────────────────────────────────────────────

export async function getWinners(eventId?: string): Promise<Winner[]> {
  const constraints: QueryConstraint[] = [];
  if (eventId) constraints.push(where('eventId', '==', eventId));
  const snap = await getDocs(query(collection(db, 'winners'), ...constraints));
  const winners = snap.docs.map(snapToWinner);
  winners.sort((a, b) => a.placement - b.placement);
  return winners;
}

export async function setWinner(
  eventId: string,
  placement: 1 | 2 | 3,
  registrationId: string,
  actorEmail: string
): Promise<void> {
  // Upsert: use eventId+placement as logical key
  const existing = await getDocs(
    query(
      collection(db, 'winners'),
      where('eventId', '==', eventId),
      where('placement', '==', placement)
    )
  );
  const now = serverTimestamp();
  if (existing.empty) {
    await addDoc(collection(db, 'winners'), {
      eventId,
      placement,
      registrationId,
      recordedBy: actorEmail,
      recordedAt: now,
      lastEditedBy: actorEmail,
      lastEditedAt: now,
    });
    await appendAuditLog({
      actorEmail, actorType: 'ADMIN', actionType: 'WINNER_RECORDED',
      targetRegistrationId: registrationId, targetEventId: eventId,
      diffOld: null, diffNew: { placement, registrationId },
      timestamp: new Date(), ipAddress: null,
    });
  } else {
    const ref = existing.docs[0].ref;
    const before = existing.docs[0].data();
    await updateDoc(ref, { registrationId, lastEditedBy: actorEmail, lastEditedAt: now });
    await appendAuditLog({
      actorEmail, actorType: 'ADMIN', actionType: 'WINNER_UPDATED',
      targetRegistrationId: registrationId, targetEventId: eventId,
      diffOld: before as Record<string, unknown>, diffNew: { registrationId },
      timestamp: new Date(), ipAddress: null,
    });
  }
}

export async function clearWinner(
  eventId: string,
  placement: 1 | 2 | 3,
  actorEmail: string
): Promise<void> {
  const existing = await getDocs(
    query(
      collection(db, 'winners'),
      where('eventId', '==', eventId),
      where('placement', '==', placement)
    )
  );
  for (const d of existing.docs) {
    await deleteDoc(d.ref);
    await appendAuditLog({
      actorEmail, actorType: 'ADMIN', actionType: 'WINNER_UPDATED',
      targetRegistrationId: null, targetEventId: eventId,
      diffOld: d.data() as Record<string, unknown>, diffNew: null,
      timestamp: new Date(), ipAddress: null,
    });
  }
}

// ─── Admin Whitelist ──────────────────────────────────────────────────────────

export async function getAdminWhitelist(): Promise<AdminWhitelistEntry[]> {
  const snap = await getDocs(query(collection(db, 'adminWhitelist'), orderBy('addedAt', 'asc')));
  return snap.docs.map((d) => ({
    email: d.id,
    addedBy: d.data().addedBy ?? '',
    addedAt: tsToDate(d.data().addedAt),
  }));
}

export async function isAdminWhitelisted(email: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'adminWhitelist', email));
  return snap.exists();
}

export async function addAdmin(email: string, addedBy: string): Promise<void> {
  await setDoc(doc(db, 'adminWhitelist', email), {
    addedBy,
    addedAt: serverTimestamp(),
  });
  await appendAuditLog({
    actorEmail: addedBy, actorType: 'ADMIN', actionType: 'ADMIN_ADDED',
    targetRegistrationId: null, targetEventId: null,
    diffOld: null, diffNew: { email },
    timestamp: new Date(), ipAddress: null,
  });
}

export async function removeAdmin(email: string, removedBy: string): Promise<void> {
  await deleteDoc(doc(db, 'adminWhitelist', email));
  await appendAuditLog({
    actorEmail: removedBy, actorType: 'ADMIN', actionType: 'ADMIN_REMOVED',
    targetRegistrationId: null, targetEventId: null,
    diffOld: { email }, diffNew: null,
    timestamp: new Date(), ipAddress: null,
  });
}

/**
 * Bootstrap: called during admin sign-in when VITE_BOOTSTRAP_ADMIN_EMAIL is set.
 * Only seeds the whitelist if it is currently empty (safe to call multiple times).
 */
export async function bootstrapFirstAdmin(email: string): Promise<void> {
  const existing = await getDocs(collection(db, 'adminWhitelist'));
  if (!existing.empty) return; // Already seeded — do nothing
  await setDoc(doc(db, 'adminWhitelist', email), {
    addedBy: 'BOOTSTRAP',
    addedAt: serverTimestamp(),
  });
  await appendAuditLog({
    actorEmail: email, actorType: 'SYSTEM', actionType: 'ADMIN_ADDED',
    targetRegistrationId: null, targetEventId: null,
    diffOld: null, diffNew: { email, source: 'BOOTSTRAP' },
    timestamp: new Date(), ipAddress: null,
  });
}

// ─── Schedule (“schedule” collection) ───────────────────────────────────────────

function snapToScheduleSlot(snap: DocumentSnapshot | QueryDocumentSnapshot): ScheduleSlot {
  const d = snap.data()!;
  return {
    id: snap.id,
    day: d.day ?? '',
    date: d.date ?? '',
    sortTime: d.sortTime ?? '00:00',
    displayTime: d.displayTime ?? '',
    location: d.location ?? '',
    title: d.title ?? '',
    type: (d.type ?? 'GENERAL') as ScheduleEventType,
    sortOrder: d.sortOrder ?? 0,
    createdAt: tsToDate(d.createdAt),
    updatedAt: tsToDate(d.updatedAt),
  };
}

const FALLBACK_SCHEDULE = [
  {
    day: "Day 01",
    date: "Monday, Sep 28",
    sortTime: "09:00",
    displayTime: "9:00 AM - 10:00 AM",
    location: "Main Auditorium",
    title: "Opening Ceremony",
    type: "GENERAL",
    sortOrder: 0
  },
  {
    day: "Day 01",
    date: "Monday, Sep 28",
    sortTime: "10:00",
    displayTime: "10:00 AM - 1:00 PM",
    location: "Lab 1, CSE Block",
    title: "Reverse Engineering",
    type: "TECH",
    sortOrder: 1
  },
  {
    day: "Day 01",
    date: "Monday, Sep 28",
    sortTime: "10:30",
    displayTime: "10:30 AM - 1:30 PM",
    location: "Seminar Hall",
    title: "BGMI Match",
    type: "NON_TECH",
    sortOrder: 2
  },
  {
    day: "Day 01",
    date: "Monday, Sep 28",
    sortTime: "13:00",
    displayTime: "1:00 PM - 2:00 PM",
    location: "Cafeteria",
    title: "Lunch Break",
    type: "BREAK",
    sortOrder: 3
  },
  {
    day: "Day 01",
    date: "Monday, Sep 28",
    sortTime: "14:00",
    displayTime: "2:00 PM - 5:00 PM",
    location: "Lab 3, CSE Block",
    title: "Speed Typing",
    type: "TECH",
    sortOrder: 4
  },
  {
    day: "Day 02",
    date: "Tuesday, Sep 29",
    sortTime: "09:30",
    displayTime: "9:30 AM - 12:30 PM",
    location: "Lab 2, CSE Block",
    title: "Code Prism",
    type: "TECH",
    sortOrder: 0
  },
  {
    day: "Day 02",
    date: "Tuesday, Sep 29",
    sortTime: "10:00",
    displayTime: "10:00 AM - 1:00 PM",
    location: "Gaming Lounge",
    title: "FC 26 Tournament",
    type: "NON_TECH",
    sortOrder: 1
  },
  {
    day: "Day 02",
    date: "Tuesday, Sep 29",
    sortTime: "13:00",
    displayTime: "1:00 PM - 2:00 PM",
    location: "Cafeteria",
    title: "Lunch Break",
    type: "BREAK",
    sortOrder: 2
  },
  {
    day: "Day 02",
    date: "Tuesday, Sep 29",
    sortTime: "14:30",
    displayTime: "2:30 PM - 4:30 PM",
    location: "Main Auditorium",
    title: "Closing & Prize Distribution",
    type: "GENERAL",
    sortOrder: 3
  }
];

/** Returns all schedule slots sorted by day then sortTime. */
export async function getScheduleSlots(): Promise<ScheduleSlot[]> {
  const snap = await getDocs(collection(db, 'schedule'));
  let slots = snap.docs.map(snapToScheduleSlot);

  if (slots.length === 0) {
    for (const slot of FALLBACK_SCHEDULE) {
      try {
        const ref = await addDoc(collection(db, 'schedule'), {
          ...slot,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        slots.push({
          id: ref.id,
          ...slot,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (err) {
        console.error('Error seeding fallback schedule slot:', err);
      }
    }
  }

  slots.sort((a, b) => {
    if (a.day !== b.day) {
      return a.day.localeCompare(b.day);
    }
    if (a.sortTime !== b.sortTime) {
      return a.sortTime.localeCompare(b.sortTime);
    }
    return a.sortOrder - b.sortOrder;
  });
  return slots;
}

export type ScheduleSlotInput = Omit<ScheduleSlot, 'id' | 'createdAt' | 'updatedAt'>;

export async function createScheduleSlot(
  data: ScheduleSlotInput,
  actorEmail: string
): Promise<ScheduleSlot> {
  const ref = await addDoc(collection(db, 'schedule'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await appendAuditLog({
    actorEmail, actorType: 'ADMIN', actionType: 'SCHEDULE_CREATED',
    targetRegistrationId: null, targetEventId: null,
    diffOld: null, diffNew: data as Record<string, unknown>,
    timestamp: new Date(), ipAddress: null,
  });
  const snap = await getDoc(ref);
  return snapToScheduleSlot(snap);
}

export async function updateScheduleSlot(
  slotId: string,
  patch: Partial<ScheduleSlotInput>,
  actorEmail: string
): Promise<void> {
  const before = (await getDoc(doc(db, 'schedule', slotId))).data();
  await updateDoc(doc(db, 'schedule', slotId), {
    ...patch,
    updatedAt: serverTimestamp(),
  });
  await appendAuditLog({
    actorEmail, actorType: 'ADMIN', actionType: 'SCHEDULE_UPDATED',
    targetRegistrationId: null, targetEventId: null,
    diffOld: before as Record<string, unknown> ?? null,
    diffNew: patch as Record<string, unknown>,
    timestamp: new Date(), ipAddress: null,
  });
}

export async function deleteScheduleSlot(
  slotId: string,
  actorEmail: string
): Promise<void> {
  const before = (await getDoc(doc(db, 'schedule', slotId))).data();
  await deleteDoc(doc(db, 'schedule', slotId));
  await appendAuditLog({
    actorEmail, actorType: 'ADMIN', actionType: 'SCHEDULE_DELETED',
    targetRegistrationId: null, targetEventId: null,
    diffOld: before as Record<string, unknown> ?? null, diffNew: null,
    timestamp: new Date(), ipAddress: null,
  });
}

export async function deleteRegistration(
  registrationId: string,
  eventId: string,
  actorEmail: string
): Promise<void> {
  const regRef = doc(db, 'registrations', registrationId);
  const eventRef = doc(db, 'events', eventId);
  const before = (await getDoc(regRef)).data();

  // Find associated team members
  const memsSnap = await getDocs(
    query(
      collection(db, 'teamMembers'),
      where('registrationId', '==', registrationId)
    )
  );

  // Check other active registrations for each member beforehand
  const usersToDelete: string[] = [];
  const emailsToClearOtp: string[] = [];

  for (const docSnap of memsSnap.docs) {
    const mData = docSnap.data();
    const userId = mData.userId;
    const email = mData.email;

    if (userId) {
      const otherMems = await getDocs(
        query(
          collection(db, 'teamMembers'),
          where('userId', '==', userId),
          where('status', '==', 'ACTIVE')
        )
      );
      const otherRegsCount = otherMems.docs.filter((d) => d.data().registrationId !== registrationId).length;
      if (otherRegsCount === 0) {
        usersToDelete.push(userId);
      }
    }

    if (email) {
      emailsToClearOtp.push(email);
    }
  }

  // Find associated winners
  const winnersSnap = await getDocs(
    query(
      collection(db, 'winners'),
      where('registrationId', '==', registrationId)
    )
  );

  await runTransaction(db, async (tx) => {
    const regSnap = await tx.get(regRef);
    if (!regSnap.exists()) return;

    // Hard-delete team members associated with this registration
    memsSnap.docs.forEach((docSnap) => {
      tx.delete(docSnap.ref);
    });

    tx.delete(regRef);
    tx.update(eventRef, { currentTeamCount: increment(-1) });

    // Clean up users
    usersToDelete.forEach((userId) => {
      tx.delete(doc(db, 'users', userId));
    });

    // Clear OTP store
    emailsToClearOtp.forEach((email) => {
      tx.delete(doc(db, 'otpStore', btoa(email)));
    });

    // Delete associated winners
    winnersSnap.docs.forEach((wDoc) => {
      tx.delete(wDoc.ref);
    });
  });

  await appendAuditLog({
    actorEmail,
    actorType: 'ADMIN',
    actionType: 'REGISTRATION_DELETED',
    targetRegistrationId: registrationId,
    targetEventId: eventId,
    diffOld: before as Record<string, unknown> ?? null,
    diffNew: null,
    timestamp: new Date(),
    ipAddress: null,
  });
  autoSyncToSheets().catch(console.error);
}

export async function saveSystemGmailToken(token: string): Promise<void> {
  await setDoc(doc(db, 'systemConfig', 'gmail'), {
    token,
    updatedAt: serverTimestamp(),
  });
}

export async function getSystemGmailToken(): Promise<string | null> {
  try {
    const snap = await getDoc(doc(db, 'systemConfig', 'gmail'));
    return snap.exists() ? snap.data().token : null;
  } catch (err) {
    console.error('Error fetching system Gmail token:', err);
    return null;
  }
}

export async function clearSystemGmailToken(): Promise<void> {
  try {
    await deleteDoc(doc(db, 'systemConfig', 'gmail'));
  } catch (err) {
    console.error('Error deleting system Gmail token:', err);
  }
}

export async function updateTeamName(
  registrationId: string,
  teamName: string,
  actorEmail: string,
  actorType: 'PARTICIPANT' | 'ADMIN'
): Promise<void> {
  const before = await getRegistration(registrationId);
  await updateDoc(doc(db, 'registrations', registrationId), {
    teamName,
    lastEditedBy: actorEmail,
    lastEditedAt: serverTimestamp(),
  });
  await appendAuditLog({
    actorEmail,
    actorType,
    actionType: 'TEAM_NAME_UPDATED',
    targetRegistrationId: registrationId,
    targetEventId: null,
    diffOld: { teamName: before?.teamName ?? null },
    diffNew: { teamName },
    timestamp: new Date(),
    ipAddress: null,
  });
}

export async function getSystemSpreadsheetId(): Promise<string | null> {
  try {
    const snap = await getDoc(doc(db, 'systemConfig', 'googleSheets'));
    return snap.exists() ? snap.data().spreadsheetId : null;
  } catch (err) {
    console.error('Error getting system spreadsheet ID:', err);
    return null;
  }
}

export async function saveSystemSpreadsheetId(spreadsheetId: string): Promise<void> {
  try {
    await setDoc(doc(db, 'systemConfig', 'googleSheets'), {
      spreadsheetId,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error saving system spreadsheet ID:', err);
  }
}

export async function autoSyncToSheets(): Promise<void> {
  try {
    const sheetId = await getSystemSpreadsheetId();
    if (!sheetId) return;

    const { syncRegistrationsToGoogleSheets } = await import('./workspace');

    const events = await getEvents();
    const regs = await getAllRegistrations();
    const snap = await getDocs(collection(db, 'teamMembers'));
    const members = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

    await syncRegistrationsToGoogleSheets(sheetId, events, regs, members);
  } catch (err) {
    console.warn('[sheets-autosync] Failed auto sync:', err);
  }
}
