'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AuthFlow() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      // Redirect authenticated users to dashboard
      router.push('/dashboard');
    }
  }, [currentUser, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (currentUser) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-gradient-to-br from-sky-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/Villma-Logo.jpg"
              alt="Villma.ai"
              width={48}
              height={48}
              className="h-12 w-auto"
            />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to
            <br />
            Villma Customer Area
          </h2>
          <p className="text-gray-600">
            Sign in to your account or create a new one
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
          <div className="space-y-6">
            <LoginForm />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
