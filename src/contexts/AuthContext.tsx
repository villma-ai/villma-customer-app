'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  UserCredential
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<UserCredential>;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function signup(email: string, password: string) {
    const authInstance = auth();
    if (!authInstance) {
      throw new Error('Firebase is not properly configured. Please check your environment variables.');
    }
    return createUserWithEmailAndPassword(authInstance, email, password);
  }

  function login(email: string, password: string) {
    const authInstance = auth();
    if (!authInstance) {
      throw new Error('Firebase is not properly configured. Please check your environment variables.');
    }
    return signInWithEmailAndPassword(authInstance, email, password);
  }

  function logout() {
    const authInstance = auth();
    if (!authInstance) {
      throw new Error('Firebase is not properly configured. Please check your environment variables.');
    }
    return signOut(authInstance);
  }

  useEffect(() => {
    const authInstance = auth();
    if (!authInstance) {
      console.warn('Firebase is not properly configured. Auth state monitoring disabled.');
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
