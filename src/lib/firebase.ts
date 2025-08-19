import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  signInWithPopup,
  getRedirectResult,
  onAuthStateChanged, 
  signOut as firebaseSignOut, 
  User 
} from 'firebase/auth';

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

// Sign in with Google - try popup first, fallback to redirect
export async function signInWithGoogle() {
  try {
    const authInstance = await getAuthInstance();
    const provider = await getGoogleProvider();
    
    try {
      // Try popup first (better user experience)
      const result = await signInWithPopup(authInstance, provider);
      return convertFirebaseUser(result.user);
    } catch (popupError) {
      // If popup fails (e.g., due to COOP), fall back to redirect
      await signInWithRedirect(authInstance, provider);
      
      // The page will redirect to Google, so we don't return anything here
      // The result will be handled when the user returns to the app
      throw new Error('Redirect initiated - page will redirect to Google');
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

// Check for redirect result
export async function checkRedirectResult() {
  try {
    const authInstance = await getAuthInstance();
    const result = await getRedirectResult(authInstance);
    if (result) {
      return convertFirebaseUser(result.user);
    }
    return null;
  } catch (error) {
    // Only log errors that aren't related to no redirect result
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as { code: string };
      if (firebaseError.code !== 'auth/no-auth-event') {
        console.error('Error getting redirect result:', error);
      }
    }
    return null;
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
