'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/firestore';
import ProfileForm from '@/components/dashboard/ProfileForm';
import { UserProfile } from '@villma/villma-ts-shared';

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserProfile() {
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    loadUserProfile();
  }, [currentUser]);

  function handleProfileUpdate(updatedProfile: UserProfile) {
    setUserProfile(updatedProfile);
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading your profile...</p>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-center py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Profile Not Found
          </h3>
          <p className="text-gray-500">
            We couldn&apos;t load your profile. Please try refreshing the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProfileForm
      userProfile={userProfile}
      onProfileUpdate={handleProfileUpdate}
    />
  );
}
