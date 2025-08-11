'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getUserProfile, isUserProfileComplete } from '@/lib/firestore';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, signInWithGoogle, currentUser } = useAuth();
  const router = useRouter();

  // Handle redirect when user is authenticated
  useEffect(() => {
    if (currentUser) {
      handleUserRedirect();
    }
  }, [currentUser]);

  async function handleUserRedirect() {
    if (!currentUser) return;
    
    try {
      const profile = await getUserProfile(currentUser.uid);
      if (isUserProfileComplete(profile)) {
        router.push('/subscriptions');
      } else {
        router.push('/profile');
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      // If we can't get the profile, redirect to profile page to complete it
      router.push('/profile');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // The redirect will be handled by the useEffect above
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        const authError = error as { message: string };
        if (authError.message.includes('user not found') || authError.message.includes('no user')) {
          setError('No account found with this email address.');
        } else if (authError.message.includes('password') || authError.message.includes('invalid')) {
          setError('Invalid email or password. Please try again.');
        } else if (authError.message.includes('email')) {
          setError('Please enter a valid email address.');
        } else {
          setError('Invalid email or password. Please try again.');
        }
      } else {
        setError('Invalid email or password. Please try again.');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      // The redirect will be handled by the useEffect above when currentUser changes
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        const authError = error as { message: string };
        if (authError.message.includes('Redirect initiated')) {
          // This is expected - the page is redirecting to Google
          return; // Don't show error for expected redirect
        } else if (authError.message.includes('popup closed') || authError.message.includes('cancelled')) {
          setError('Google sign-in was cancelled.');
        } else if (authError.message.includes('network') || authError.message.includes('connection')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError('Google sign-in failed. Please try again.');
        }
      } else {
        setError('Google sign-in failed. Please try again.');
      }
      console.error('Google sign-in error:', error);
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold text-gray-900 text-center mt-4 mb-2 tracking-tight">
        Welcome back to Villma
      </h1>
      <p className="text-gray-500 text-center mb-4">Sign in to manage your subscriptions</p>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-gray-900"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-gray-900"
              placeholder="Enter your password"
            />
            <div className="flex justify-end mt-1">
              <Link
                href="/forgot-password"
                className="text-xs text-sky-600 hover:text-sky-800 underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 py-3 px-6 rounded-lg font-semibold transition duration-200 shadow-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
          ) : (
            <Image src="/google.svg" alt="Google" width={30} height={30} />
          )}
          Continue with Google
        </button>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don&apos;t have an account?
            <br />
            <Link
              href="/register"
              className="text-sky-600 hover:text-sky-700 font-medium transition-colors"
            >
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
