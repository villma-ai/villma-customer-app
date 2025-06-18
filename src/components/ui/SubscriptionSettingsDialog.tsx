'use client';

import { useState, useEffect } from 'react';
import { UserSubscription } from '@/types/user';
import { updateUserSubscription, generateApiToken } from '@/lib/firestore';

interface SubscriptionSettingsDialogProps {
  subscription: UserSubscription | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function SubscriptionSettingsDialog({
  subscription,
  isOpen,
  onClose,
  onUpdate
}: SubscriptionSettingsDialogProps) {
  const [webshopUrl, setWebshopUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (subscription) {
      setWebshopUrl(subscription.webshopUrl || '');
      setApiToken(subscription.apiToken || '');
    }
  }, [subscription]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleGenerateToken = () => {
    const newToken = generateApiToken();
    setApiToken(newToken);
  };

  const handleCopyToken = async () => {
    if (!apiToken) return;

    try {
      await navigator.clipboard.writeText(apiToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy token:', err);
    }
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscription) return;

    // Validate URL if provided
    if (webshopUrl && !validateUrl(webshopUrl)) {
      setError('Please enter a valid URL (e.g., https://your-webshop.com)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await updateUserSubscription(subscription.id, {
        webshopUrl: webshopUrl || undefined,
        apiToken: apiToken || undefined
      });
      onUpdate();
      onClose();
    } catch (err) {
      setError('Failed to update subscription settings. Please try again.');
      console.error('Error updating subscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !subscription) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Subscription Settings
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Configure your {subscription.planName} subscription
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label
              htmlFor="webshopUrl"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Webshop URL
            </label>
            <input
              type="url"
              id="webshopUrl"
              value={webshopUrl}
              onChange={(e) => setWebshopUrl(e.target.value)}
              placeholder="https://your-webshop.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the URL where your chatbot will be installed (optional)
            </p>
          </div>

          <div>
            <label
              htmlFor="apiToken"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              API Token
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="apiToken"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="Generate a token"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors font-mono text-sm"
                  readOnly
                />
                <button
                  type="button"
                  onClick={handleGenerateToken}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm font-medium"
                >
                  Generate
                </button>
              </div>
              {apiToken && (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleCopyToken}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    {copied ? (
                      <>
                        <svg
                          className="w-4 h-4 mr-2 text-green-600"
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
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Copy Token
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This token is used to authenticate your chatbot integration
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
