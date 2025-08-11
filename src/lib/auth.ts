import { 
  signInWithGoogle as firebaseSignInWithGoogle, 
  signOut as firebaseSignOut, 
  onAuthStateChange,
  convertFirebaseUser,
  checkRedirectResult
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

// Sign in with Google using Firebase (popup with redirect fallback)
export async function signInWithGoogle(): Promise<AuthUser> {
  try {
    const user = await firebaseSignInWithGoogle();
    
    if (!user) {
      throw new Error('Google sign-in failed - no user returned');
    }
    
    return user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

// Check for redirect result
export async function checkAuthRedirectResult(): Promise<AuthUser | null> {
  try {
    return await checkRedirectResult();
  } catch (error) {
    console.error('Error checking redirect result:', error);
    return null;
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
  const existingUserData = localStorage.getItem(`user_${email}`);
  
  if (!existingUserData) {
    throw new Error('No account found with this email address.');
  }
  
  try {
    // Parse the stored user data
    const existingUser = JSON.parse(existingUserData) as AuthUser;
    
    // In a real implementation, you would verify the password hash
    // For now, we'll just use the stored user data
    const user: AuthUser = {
      uid: existingUser.uid,
      email: existingUser.email,
      displayName: existingUser.displayName,
      photoURL: existingUser.photoURL,
      emailVerified: existingUser.emailVerified,
    };

    // Set the current authenticated user
    localStorage.setItem('authUser', JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error('Error parsing stored user data:', error);
    throw new Error('Invalid user data. Please try registering again.');
  }
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
