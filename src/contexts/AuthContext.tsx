'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  AuthUser, 
  signOut as authSignOut, 
  signInWithGoogle as authSignInWithGoogle,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
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
        
        // Listen to Firebase auth state changes
        const unsubscribe = onAuthStateChanged((user) => {
          console.log('🔍 AuthContext Debug - Firebase auth state changed:', user);
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

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    signInWithGoogle
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
