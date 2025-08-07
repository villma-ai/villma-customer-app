import { 
  signInWithGoogle as firebaseSignInWithGoogle, 
  signOut as firebaseSignOut, 
  onAuthStateChange,
  convertFirebaseUser
} from './firebase';

// User interface to replace Firebase User
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Authentication state interface
export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
}

// Sign in with Google using Firebase
export async function signInWithGoogle(): Promise<AuthUser> {
  try {
    const user = await firebaseSignInWithGoogle();
    if (!user) {
      throw new Error('Failed to sign in with Google');
    }
    return user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

// Sign out using Firebase
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut();
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

// Listen to auth state changes
export function onAuthStateChanged(callback: (user: AuthUser | null) => void) {
  return onAuthStateChange(callback);
}

// Email/Password authentication (simulated)
export async function signInWithEmailAndPassword(email: string, password: string): Promise<AuthUser> {
  // In a real implementation, this would call your backend API
  // For now, we'll simulate authentication with basic validation
  
  // Basic email validation
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  
  // Basic password validation
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  
  // Simulate user lookup (in real implementation, this would check against your database)
  const existingUser = localStorage.getItem(`user_${email}`);
  if (!existingUser) {
    throw new Error('No account found with this email address.');
  }
  
  // In a real implementation, you would verify the password hash
  const user: AuthUser = {
    uid: `email_${Date.now()}`,
    email,
    displayName: email.split('@')[0],
    photoURL: null,
    emailVerified: true,
  };

  localStorage.setItem('authUser', JSON.stringify(user));
  return user;
}

export async function createUserWithEmailAndPassword(email: string, password: string): Promise<AuthUser> {
  // In a real implementation, this would call your backend API
  // For now, we'll simulate registration with validation
  
  // Basic email validation
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  
  // Basic password validation
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  
  // Check if user already exists (in real implementation, this would check your database)
  const existingUser = localStorage.getItem(`user_${email}`);
  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }
  
  // Create new user
  const user: AuthUser = {
    uid: `email_${Date.now()}`,
    email,
    displayName: email.split('@')[0],
    photoURL: null,
    emailVerified: false,
  };

  // Store user for future login attempts (in real implementation, this would be in your database)
  localStorage.setItem(`user_${email}`, JSON.stringify(user));
  localStorage.setItem('authUser', JSON.stringify(user));
  return user;
}
