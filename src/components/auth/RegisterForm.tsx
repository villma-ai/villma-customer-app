'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createUserProfile } from '@/lib/firestore';
import Link from 'next/link';
import { z } from 'zod';

// Zod validation schema
const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be less than 50 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(100, 'Password must be less than 100 characters'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear field-specific error when user starts typing
    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrors({});

    try {
      // Validate form data with Zod
      const validatedData = registerSchema.parse(formData);

      const userCredential = await signup(validatedData.email, validatedData.password);

      // Create user profile
      await createUserProfile({
        uid: userCredential.user.uid,
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName
      });

      router.push('/profile');
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Handle Zod validation errors
        const fieldErrors: Partial<RegisterFormData> = {};
        err.errors.forEach((error) => {
          const field = error.path[0] as keyof RegisterFormData;
          fieldErrors[field] = error.message;
        });
        setErrors(fieldErrors);
      } else if (err && typeof err === 'object' && 'code' in err) {
        // Handle Firebase auth errors
        const firebaseError = err as { code: string };
        if (firebaseError.code === 'auth/email-already-in-use') {
          setError('An account with this email already exists.');
        } else if (firebaseError.code === 'auth/weak-password') {
          setError('Password is too weak. Please choose a stronger password.');
        } else {
          setError('Failed to create account. Please try again.');
        }
      } else {
        setError('Failed to create account. Please try again.');
      }
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-extrabold text-gray-900 text-center mt-4 mb-2 tracking-tight">
        Welcome to Villma
      </h1>
      <p className="text-gray-500 text-center mb-4">
        Create an account to manage your subscriptions
      </p>
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="First name"
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Last name"
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors ${
                errors.password ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Create a password"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors ${
                errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Account...
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?
            <br />
            <Link
              href="/login"
              className="text-sky-600 hover:text-sky-700 font-medium transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
