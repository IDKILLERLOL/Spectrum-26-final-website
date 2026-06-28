import * as admin from 'firebase-admin';

const adminSdkKey = process.env.FIREBASE_ADMIN_SDK_KEY;

if (!admin.apps.length && adminSdkKey) {
  try {
    const serviceAccount = JSON.parse(adminSdkKey);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

export default admin;
