// Firebase configuration - will be initialized when credentials are provided
import { initializeApp, getApps } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

let app: any = null;
export let auth: Auth | null = null;
export let db: Firestore | null = null;

// Only initialize if credentials are available
if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
      const { getAuth } = require('firebase/auth');
      const { getFirestore } = require('firebase/firestore');
      auth = getAuth(app);
      db = getFirestore(app);
    } else {
      app = getApps()[0];
      const { getAuth } = require('firebase/auth');
      const { getFirestore } = require('firebase/firestore');
      auth = getAuth(app);
      db = getFirestore(app);
    }
  } catch (error) {
    console.warn('Firebase initialization skipped - credentials not configured');
  }
}

export default app;
