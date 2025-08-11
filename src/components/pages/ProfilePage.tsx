'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, createUserProfile } from '@/lib/firestore';
import ProfileForm from '@/components/dashboard/ProfileForm';
import { UserProfile } from '@villma/villma-ts-shared';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const router = useRouter();

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
  }, [currentUser, router]);

  async function handleCreateProfile() {
    if (!currentUser) return;
    
    setCreatingProfile(true);
    try {
      // Create a basic profile for the user
      const newProfile: Omit<UserProfile, 'createdAt' | 'updatedAt'> = {
        uid: currentUser.uid,
        email: currentUser.email || '',
        firstName: '',
        lastName: '',
        address: {
          street: '',
          city: '',
          postalCode: '',
          country: ''
        }
      };
      
      await createUserProfile(newProfile);
      
      // Reload the profile
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error creating user profile:', error);
    } finally {
      setCreatingProfile(false);
    }
  }

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
          <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-sky-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Your Profile</h3>
          <p className="text-gray-500 mb-6">
            Welcome! Please complete your profile to continue.
          </p>
          <button
            onClick={handleCreateProfile}
            disabled={creatingProfile}
            className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {creatingProfile ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Profile...
              </div>
            ) : (
              'Create Profile'
            )}
          </button>
        </div>
      </div>
    );
  }

  return <ProfileForm userProfile={userProfile} onProfileUpdate={handleProfileUpdate} />;
}
