'use client';

import { useState, useEffect } from 'react';
import { getSubscriptionPlans, getUserProfile, isUserProfileComplete } from '@/lib/firestore';
import { createCheckoutSession } from '@/lib/stripe-client';
import { useAuth } from '@/contexts/AuthContext';
import { SubscriptionPlan } from '@villma/villma-ts-shared';

interface SubscriptionPlansProps {
  userId: string;
}

export default function SubscriptionPlans({ userId }: SubscriptionPlansProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly'>('monthly');
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    loadPlans();
    checkProfile();
  }, []);

  async function loadPlans() {
    try {
      const availablePlans = await getSubscriptionPlans();
      setPlans(availablePlans);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  }

  async function checkProfile() {
    if (!userId) return;
    try {
      const profile = await getUserProfile(userId);
      setProfileComplete(isUserProfileComplete(profile));
    } catch {
      setProfileComplete(false);
    }
  }

  async function handlePurchase(plan: SubscriptionPlan) {
    if (!userId || !currentUser?.email) return;

    try {
      setPurchasing(plan.id);
      setMessage('');

      // Create Stripe checkout session
      await createCheckoutSession({
        planName: plan.name,
        billingCycle: plan.billingCycle,
        customerEmail: currentUser.email
      });

      // Note: The user will be redirected to Stripe checkout
      // The success/failure will be handled by the webhook and redirect URLs
    } catch (error) {
      setMessage('Failed to start checkout process. Please try again.');
      console.error('Purchase error:', error);
    } finally {
      setPurchasing(null);
    }
  }

  // Filter plans by active tab
  const filteredPlans = plans.filter((plan) => plan.billingCycle === activeTab);

  if (loading || profileComplete === null) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading available plans...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Available Subscription Plans</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose the perfect plan for your business needs. Scale your AI-powered solutions with our
          flexible subscription options.
        </p>
      </div>

      {message && (
        <div
          className={`mb-8 p-4 rounded-lg max-w-2xl mx-auto ${
            message.includes('Successfully')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      {/* Billing Cycle Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-xl p-1 inline-flex">
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'monthly'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setActiveTab('yearly')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'yearly'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
            <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
              Save 2 months
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 flex flex-col"
          >
            <div className="px-8 py-8 flex flex-col h-full">
              <div className="text-center mb-6">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                    plan.name === 'BASE' ? 'bg-sky-100' : 'bg-indigo-100'
                  }`}
                >
                  <svg
                    className={`w-8 h-8 ${
                      plan.name === 'BASE' ? 'text-sky-600' : 'text-indigo-600'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-5xl font-bold text-sky-600 mb-2">
                  €{plan.price}
                  <span className="text-lg font-normal text-gray-500">
                    /{plan.billingCycle === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8 flex-grow">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {profileComplete ? (
                <button
                  onClick={() => handlePurchase(plan)}
                  disabled={purchasing === plan.id}
                  className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl cursor-pointer"
                >
                  {purchasing === plan.id ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </button>
              ) : (
                <div className="w-full bg-yellow-100 text-yellow-800 border border-yellow-300 rounded-lg py-3 px-6 font-semibold text-center mt-4">
                  Please complete all required profile fields before subscribing to a plan.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Plans Available</h3>
            <p className="text-gray-500">
              Subscription plans are not available at the moment. Please check back later.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
