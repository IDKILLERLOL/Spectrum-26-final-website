import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import { Event, Registration, Announcement, AdminUser, AuditLog } from '@/types/spectrum';

// Generic Firestore operations
export async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as T) : null;
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    return null;
  }
}

export async function setDocument<T>(
  collectionName: string,
  docId: string,
  data: T
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data);
    return true;
  } catch (error) {
    console.error(`Error setting document in ${collectionName}:`, error);
    return false;
  }
}

export async function updateDocument<T>(
  collectionName: string,
  docId: string,
  data: Partial<T>
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data as any);
    return true;
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    return false;
  }
}

export async function deleteDocument(collectionName: string, docId: string): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    return false;
  }
}

export async function queryDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[]
): Promise<T[]> {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error);
    return [];
  }
}

export async function getAllDocuments<T>(collectionName: string): Promise<T[]> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
  } catch (error) {
    console.error(`Error getting all documents from ${collectionName}:`, error);
    return [];
  }
}

// Event operations
export async function getEvent(eventId: string): Promise<Event | null> {
  return getDocument<Event>('events', eventId);
}

export async function getAllEvents(): Promise<Event[]> {
  return getAllDocuments<Event>('events');
}

export async function createEvent(event: Omit<Event, 'id'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, 'events'), {
      ...event,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    return null;
  }
}

// Registration operations
export async function getRegistration(registrationId: string): Promise<Registration | null> {
  return getDocument<Registration>('registrations', registrationId);
}

export async function getUserRegistrations(userId: string): Promise<Registration[]> {
  return queryDocuments<Registration>('registrations', [where('userId', '==', userId)]);
}

export async function getEventRegistrations(eventId: string): Promise<Registration[]> {
  return queryDocuments<Registration>('registrations', [where('eventId', '==', eventId)]);
}

export async function getRegistrationByPassCode(passCode: string): Promise<Registration | null> {
  const results = await queryDocuments<Registration>('registrations', [
    where('passCode', '==', passCode),
  ]);
  return results.length > 0 ? results[0] : null;
}

export async function createRegistration(
  registration: Omit<Registration, 'id'>
): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, 'registrations'), {
      ...registration,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating registration:', error);
    return null;
  }
}

// Announcement operations
export async function getAnnouncements(eventId?: string): Promise<Announcement[]> {
  if (eventId) {
    return queryDocuments<Announcement>('announcements', [where('eventId', '==', eventId)]);
  }
  return getAllDocuments<Announcement>('announcements');
}

export async function createAnnouncement(
  announcement: Omit<Announcement, 'id'>
): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, 'announcements'), {
      ...announcement,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating announcement:', error);
    return null;
  }
}

// Admin operations
export async function getAdminUsers(): Promise<AdminUser[]> {
  return getAllDocuments<AdminUser>('adminWhitelist');
}

export async function isUserAdmin(email: string): Promise<boolean> {
  const results = await queryDocuments<AdminUser>('adminWhitelist', [where('email', '==', email)]);
  return results.length > 0;
}

export async function addAdminUser(adminUser: Omit<AdminUser, 'id'>): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, 'adminWhitelist'), {
      ...adminUser,
      addedAt: Date.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding admin user:', error);
    return null;
  }
}

// Audit logging
export async function logAuditEvent(
  adminEmail: string,
  action: string,
  details: Record<string, any>,
  ipAddress?: string
): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, 'adminAuditLogs'), {
      adminEmail,
      action,
      details,
      ipAddress,
      timestamp: Date.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error logging audit event:', error);
    return null;
  }
}
