'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserSubscriptions } from '@/lib/firestore';
import SubscriptionSettingsPanel from '@/components/ui/SubscriptionSettingsPanel';
import { UserSubscription } from '@villma/villma-ts-shared';
import { useRouter } from 'next/navigation';

interface UserSubscriptionsProps {
  userId: string;
}

export default function UserSubscriptions({ userId }: UserSubscriptionsProps) {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const router = useRouter();

  const loadUserData = useCallback(async () => {
    try {
      const userSubs = await getUserSubscriptions(userId);
      setSubscriptions(userSubs);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleToggleSettings = (subscription: UserSubscription) => {
    if (selectedSubscription?.id === subscription.id && isSettingsDialogOpen) {
      setIsSettingsDialogOpen(false);
      setSelectedSubscription(null);
    } else {
      setSelectedSubscription(subscription);
      setIsSettingsDialogOpen(true);
    }
  };

  const handleCloseSettings = () => {
    setIsSettingsDialogOpen(false);
    setSelectedSubscription(null);
  };

  const handleSettingsUpdate = () => {
    loadUserData();
  };

  function formatDate(date: Date) {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function truncateText(text: string, maxLength: number = 30) {
    if (!text) return 'Not set';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading your subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Subscriptions */}
      <div id="subscriptions-container" className="mb-12">
        {isSettingsDialogOpen && selectedSubscription ? (
          <SubscriptionSettingsPanel
            subscription={selectedSubscription}
            onClose={handleCloseSettings}
            onUpdate={handleSettingsUpdate}
          />
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">My Subscriptions</h2>
              <p className="text-xl text-gray-600">
                Manage your active subscriptions and chatbot settings
              </p>
            </div>
            {subscriptions.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-2xl mx-auto">
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Active Subscriptions
                </h3>
                <p className="text-gray-500 mb-4">
                  You don&apos;t have any active subscriptions at the moment.
                </p>
                <p className="text-sm text-gray-400">
                  Visit the &quot;Available Plans&quot; page to subscribe to a plan.
                </p>
              </div>
            ) : null}
            {subscriptions.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {subscriptions.map((subscription) => {
                  // Check if the button should be shown
                  const showExtraProdButton =
                    subscription.hasExtraProdData &&
                    subscription.webshopUrl &&
                    subscription.apiToken &&
                    ((subscription.ecommerceType === 'custom' &&
                      subscription.apiBaseUrl &&
                      subscription.apiKey) ||
                      (subscription.ecommerceType === 'shopify' &&
                        subscription.shopDomain &&
                        subscription.adminApiToken) ||
                      (subscription.ecommerceType === 'woocommerce' &&
                        subscription.storeUrl &&
                        subscription.consumerKey &&
                        subscription.consumerSecret) ||
                      (subscription.ecommerceType === 'prestashop' &&
                        subscription.storeUrl &&
                        subscription.apiKey));
                  return (
                    <div
                      key={subscription.id}
                      className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-500 max-w-md mx-auto w-full"
                    >
                      <div
                        className={`px-6 py-4 bg-gradient-to-r ${
                          subscription.hasExtraProdData
                            ? 'from-indigo-600 to-pink-500'
                            : 'from-sky-500 to-indigo-600'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              {subscription.planName}
                            </h3>
                            <p className="text-sky-100 capitalize">
                              {subscription.planBillingCycle} plan
                            </p>
                          </div>
                          <button
                            onClick={() => handleToggleSettings(subscription)}
                            className="transition-all duration-300 p-2 rounded-full cursor-pointer border-2 border-white/30 bg-white/10 shadow hover:bg-white/20 text-white"
                            title="Settings"
                          >
                            <svg
                              className="w-6 h-6 transition-all duration-300 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="px-6 py-6">
                        <div className="flex justify-between items-center mb-6">
                          <span className="text-3xl font-bold text-gray-900">
                            €{subscription.planPrice}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              subscription.status
                            )}`}
                          >
                            {subscription.status}
                          </span>
                        </div>
                        <div className="space-y-3 text-sm text-gray-600 mb-6">
                          {/* Webshop URL and Ecommerce Type */}
                          <div className="flex justify-between items-center mb-2">
                            <span>
                              {subscription.webshopUrl ? (
                                <a
                                  href={subscription.webshopUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sky-600 hover:text-sky-800 underline"
                                >
                                  {truncateText(subscription.webshopUrl, 25)}
                                </a>
                              ) : (
                                <span className="text-gray-400">No webshop URL</span>
                              )}
                            </span>
                            {subscription.ecommerceType && (
                              <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200 capitalize">
                                {subscription.ecommerceType}
                              </span>
                            )}
                          </div>
                          <div className="flex justify-between">
                            <span>Start Date:</span>
                            <span className="font-medium">
                              {formatDate(subscription.startDate)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>End Date:</span>
                            <span className="font-medium">{formatDate(subscription.endDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Billing Cycle:</span>
                            <span className="font-medium capitalize">
                              {subscription.planBillingCycle}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>API Token:</span>
                            <span className="font-medium font-mono text-xs">
                              {subscription.apiToken ? (
                                <span className="text-green-600">✓ Generated</span>
                              ) : (
                                <span className="text-gray-400">Not generated</span>
                              )}
                            </span>
                          </div>
                        </div>
                        {showExtraProdButton && (
                          <button
                            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-semibold transition duration-200 cursor-pointer"
                            onClick={() => router.push(`/subscriptions/${subscription.id}`)}
                          >
                            Enhanced products
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
