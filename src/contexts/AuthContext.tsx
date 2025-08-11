'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  AuthUser, 
  signOut as authSignOut, 
  signInWithGoogle as authSignInWithGoogle,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  checkAuthRedirectResult
} from '@/lib/auth';
import { initializeFirebase } from '@/lib/firebase';

interface AuthContextType {
  currentUser: AuthUser | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<AuthUser>;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  function signup(email: string, password: string) {
    return createUserWithEmailAndPassword(email, password);
  }

  function login(email: string, password: string) {
    return signInWithEmailAndPassword(email, password);
  }

  async function logout() {
    return authSignOut();
  }

  async function signInWithGoogle() {
    return authSignInWithGoogle();
  }

  useEffect(() => {
    // Initialize Firebase and set up auth state listener
    const initializeAuth = async () => {
      try {
        await initializeFirebase();
        
        // Check for redirect result first
        const redirectUser = await checkAuthRedirectResult();
        if (redirectUser) {
          setCurrentUser(redirectUser);
          setLoading(false);
          return;
        }
        
        // Check if there's a stored user in localStorage (for email/password auth)
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser) as AuthUser;
            setCurrentUser(user);
            setLoading(false);
            return;
          } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('authUser'); // Clean up invalid data
          }
        }
        
        // Listen to Firebase auth state changes
        const unsubscribe = onAuthStateChanged((user) => {
          setCurrentUser(user);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        setLoading(false);
        return () => {};
      }
    };

    initializeAuth();
  }, []);

  // Monitor localStorage changes for email/password auth
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('authUser');
      if (storedUser && !currentUser) {
        try {
          const user = JSON.parse(storedUser) as AuthUser;
          setCurrentUser(user);
        } catch (error) {
          console.error('Error parsing stored user from storage event:', error);
        }
      }
    };

    // Listen for storage changes (when localStorage is updated from another tab/window)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser]);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
