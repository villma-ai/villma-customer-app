'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/firestore';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { UserProfile } from '@villma/villma-ts-shared';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, logout } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // If no user is authenticated, redirect to login
    if (!currentUser) {
      router.push('/');
      return;
    }

    async function loadUserProfile() {
      if (!currentUser) return;

      try {
        const profile = await getUserProfile(currentUser.uid);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error loading user profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [currentUser, router]);

  async function handleLogout() {
    try {
      await logout();
      // Redirect to login page after logout
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  // Show loading spinner while checking auth or loading profile
  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Image
                src="/Villma-Logo.jpg"
                alt="Villma.ai"
                width={48}
                height={48}
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer Area</h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {userProfile?.firstName || currentUser?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition duration-200 shadow-lg hover:shadow-xl"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              href="/profile"
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                pathname === '/profile'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Profile
            </Link>
            <Link
              href="/subscriptions"
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                pathname === '/subscriptions' || pathname.startsWith('/subscriptions/')
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Subscriptions
            </Link>
            <Link
              href="/plans"
              className={`py-4 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                pathname === '/plans'
                  ? 'border-sky-500 text-sky-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Available Plans
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          <div className="px-6 py-8">{children}</div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2025 Villma.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
