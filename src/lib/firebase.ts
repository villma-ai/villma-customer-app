import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut as firebaseSignOut, User } from 'firebase/auth';

// Firebase configuration will be loaded at runtime
let firebaseConfig: any = null;
let app: any = null;
let auth: any = null;
let googleProvider: any = null;

// Initialize Firebase with runtime config
export async function initializeFirebase() {
  if (app) return; // Already initialized

  try {
    // Fetch Firebase config from API
    const response = await fetch('/api/config');
    if (!response.ok) {
      throw new Error('Failed to fetch Firebase config');
    }
    
    const config = await response.json();
    firebaseConfig = {
      apiKey: config.firebase.apiKey,
      authDomain: config.firebase.authDomain,
    };

    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();

    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
}

// Get auth instance (initialize if needed)
export async function getAuthInstance() {
  if (!auth) {
    await initializeFirebase();
  }
  return auth;
}

// Get Google provider (initialize if needed)
export async function getGoogleProvider() {
  if (!googleProvider) {
    await initializeFirebase();
  }
  return googleProvider;
}

// Firebase User to AuthUser conversion
export function convertFirebaseUser(firebaseUser: User | null) {
  if (!firebaseUser) return null;
  
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
  };
}

// Sign in with Google popup
export async function signInWithGoogle() {
  try {
    const authInstance = await getAuthInstance();
    const provider = await getGoogleProvider();
    const result = await signInWithPopup(authInstance, provider);
    return convertFirebaseUser(result.user);
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

// Sign out
export async function signOut() {
  try {
    const authInstance = await getAuthInstance();
    await firebaseSignOut(authInstance);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: any) => void) {
  return onAuthStateChanged(auth || getAuth(), (user) => {
    callback(convertFirebaseUser(user));
  });
}
