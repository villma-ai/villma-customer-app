'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserProfile, UserProfile } from '@/lib/firestore';
import { z } from 'zod';

interface ProfileFormProps {
  userProfile: UserProfile | null;
  onProfileUpdate: (profile: UserProfile) => void;
}

// Zod validation schema
const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  phone: z.string().optional(),
  company: z.string().optional(),
  vatNumber: z.string().optional(),
  address: z.object({
    street: z
      .string()
      .min(1, 'Street address is required')
      .max(100, 'Street address must be less than 100 characters'),
    city: z.string().min(1, 'City is required').max(50, 'City must be less than 50 characters'),
    postalCode: z
      .string()
      .min(1, 'Postal code is required')
      .max(20, 'Postal code must be less than 20 characters'),
    country: z
      .string()
      .min(1, 'Country is required')
      .max(50, 'Country must be less than 50 characters')
  })
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Type for form errors
type FormErrors = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  vatNumber?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
};

export default function ProfileForm({ userProfile, onProfileUpdate }: ProfileFormProps) {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: userProfile?.firstName || '',
    lastName: userProfile?.lastName || '',
    phone: userProfile?.phone || '',
    company: userProfile?.company || '',
    vatNumber: userProfile?.vatNumber || '',
    address: {
      street: userProfile?.address?.street || '',
      city: userProfile?.address?.city || '',
      postalCode: userProfile?.address?.postalCode || '',
      country: userProfile?.address?.country || ''
    }
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!currentUser || !userProfile) return;

    try {
      setLoading(true);
      setMessage('');
      setErrors({});

      // Validate form data with Zod
      const validatedData = profileSchema.parse(formData);

      const updatedProfile = {
        ...userProfile,
        ...validatedData,
        updatedAt: new Date()
      };

      await updateUserProfile(currentUser.uid, validatedData);
      onProfileUpdate(updatedProfile);
      setMessage('Profile updated successfully!');

      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      if (err instanceof z.ZodError) {
        // Handle Zod validation errors
        const fieldErrors: FormErrors = {};
        err.errors.forEach((error) => {
          if (error.path[0] === 'address') {
            const addressField = error.path[1] as keyof ProfileFormData['address'];
            if (!fieldErrors.address) fieldErrors.address = {};
            fieldErrors.address[addressField] = error.message;
          } else {
            const field = error.path[0] as keyof ProfileFormData;
            fieldErrors[field] = error.message;
          }
        });
        setErrors(fieldErrors);
      } else {
        setMessage('Failed to update profile. Please try again.');
        console.error('Profile update error:', err);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;

    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));

      // Clear address field error when user starts typing
      if (errors.address?.[addressField as keyof ProfileFormData['address']]) {
        setErrors((prev) => ({
          ...prev,
          address: {
            ...prev.address,
            [addressField]: undefined
          }
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));

      // Clear field-specific error when user starts typing
      if (errors[name as keyof ProfileFormData]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined
        }));
      }
    }
  }

  if (!userProfile) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Profile Information</h2>
        <p className="text-gray-600">Manage your personal and billing information</p>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes('successfully')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-sky-600"
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
            Personal Information
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ${
                  errors.firstName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ${
                  errors.lastName ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-sky-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            Company Information
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="company"
                id="company"
                value={formData.company}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ${
                  errors.company ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
            </div>

            <div>
              <label htmlFor="vatNumber" className="block text-sm font-medium text-gray-700 mb-2">
                VAT Number
              </label>
              <input
                type="text"
                name="vatNumber"
                id="vatNumber"
                value={formData.vatNumber}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ${
                  errors.vatNumber ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.vatNumber && <p className="mt-1 text-sm text-red-600">{errors.vatNumber}</p>}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center mr-3">
              <svg
                className="w-5 h-5 text-sky-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            Billing Address
          </h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="address.street"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Street Address *
              </label>
              <input
                type="text"
                name="address.street"
                id="address.street"
                value={formData.address.street}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ${
                  errors.address?.street ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.address?.street && (
                <p className="mt-1 text-sm text-red-600">{errors.address.street}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="address.city"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                City *
              </label>
              <input
                type="text"
                name="address.city"
                id="address.city"
                value={formData.address.city}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ${
                  errors.address?.city ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.address?.city && (
                <p className="mt-1 text-sm text-red-600">{errors.address.city}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="address.postalCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Postal Code *
              </label>
              <input
                type="text"
                name="address.postalCode"
                id="address.postalCode"
                value={formData.address.postalCode}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ${
                  errors.address?.postalCode ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.address?.postalCode && (
                <p className="mt-1 text-sm text-red-600">{errors.address.postalCode}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="address.country"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Country *
              </label>
              <input
                type="text"
                name="address.country"
                id="address.country"
                value={formData.address.country}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200 ${
                  errors.address?.country ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.address?.country && (
                <p className="mt-1 text-sm text-red-600">{errors.address.country}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
