import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getRuntimeConfig } from './runtime-config';

// Lazy initialization of Firebase
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function initializeFirebase() {
  try {
    if (app) return { app, auth: authInstance, db: dbInstance };

    // Get runtime configuration
    const config = getRuntimeConfig();

    // Check if we have valid Firebase configuration
    if (!config.firebase.apiKey) {
      console.warn('⚠️  Firebase not properly configured. Skipping initialization.');
      for (const [key, value] of Object.entries(process.env)) {
        console.log(`ENV ${key}: ${value}`);
      }
      return { app: null, auth: null, db: null };

      // Firebase configuration
      const firebaseConfig = {
        apiKey: config.firebase.apiKey,
        authDomain: config.firebase.authDomain,
        projectId: config.firebase.projectId,
        storageBucket: config.firebase.storageBucket,
        messagingSenderId: config.firebase.messagingSenderId,
        appId: config.firebase.appId,
        measurementId: config.firebase.measurementId,
      };

      // Initialize Firebase only if not already initialized
      if (!getApps().length) {
        app = initializeApp(firebaseConfig);
      } else {
        app = getApps()[0];
      }

      // Initialize Firebase services
      authInstance = getAuth(app);
      dbInstance = getFirestore(app);

      return { app, auth: authInstance, db: dbInstance };
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      return { app: null, auth: null, db: null };
    }
  }

// Export lazy-loaded instances
export const auth = (): Auth | null => {
    try {
      const { auth } = initializeFirebase();
      return auth;
    } catch (error) {
      console.error('Error getting auth instance:', error);
      return null;
    }
  };

  export const db = (): Firestore | null => {
    try {
      const { db } = initializeFirebase();
      return db;
    } catch (error) {
      console.error('Error getting db instance:', error);
      return null;
    }
  };

  const getFirebaseApp = (): FirebaseApp | null => {
    try {
      const { app } = initializeFirebase();
      return app;
    } catch (error) {
      console.error('Error getting app instance:', error);
      return null;
    }
  };

  export default getFirebaseApp;
