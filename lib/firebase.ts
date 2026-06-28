import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase - avoid duplicate initializations
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable emulators in development if needed
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  try {
    if (!auth.currentUser && window.location.hostname === 'localhost') {
      // Uncomment to use emulators locally
      // connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      // connectFirestoreEmulator(db, 'localhost', 8080);
    }
  } catch (error) {
    // Emulators already connected
  }
}

export default app;
