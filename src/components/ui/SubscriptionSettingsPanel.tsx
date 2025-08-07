import { useState, useEffect } from 'react';
import { updateUserSubscription, generateApiToken } from '@/lib/firestore';
import { UserSubscription } from '@/lib/firestore';

const ECOMMERCE_TYPES = [
  { value: 'custom', label: 'Custom' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'woocommerce', label: 'WooCommerce' },
  { value: 'prestashop', label: 'PrestaShop' }
];

interface SubscriptionSettingsPanelProps {
  subscription: UserSubscription;
  onClose: () => void;
  onUpdate: () => void;
}

export default function SubscriptionSettingsPanel({
  subscription,
  onClose,
  onUpdate
}: SubscriptionSettingsPanelProps) {
  const [webshopUrl, setWebshopUrl] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [ecommerceType, setEcommerceType] = useState('');
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [shopifyClientId, setShopifyClientId] = useState('');
  const [shopifyClientSecret, setShopifyClientSecret] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [prestaApiKey, setPrestaApiKey] = useState('');

  useEffect(() => {
    if (subscription) {
      setWebshopUrl(subscription.webshopUrl || '');
      setApiToken(subscription.apiToken || '');
      setEcommerceType(subscription.ecommerceType || '');
      setApiBaseUrl(subscription.apiBaseUrl || '');
      setCustomApiKey(subscription.apiKey || '');
      setShopifyClientId(subscription.shopifyClientId || '');
      setShopifyClientSecret(subscription.shopifyClientSecret || '');
      setStoreUrl(subscription.storeUrl || '');
      setConsumerKey(subscription.consumerKey || '');
      setConsumerSecret(subscription.consumerSecret || '');
      setPrestaApiKey(subscription.apiKey || '');
    }
  }, [subscription]);

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
    if (webshopUrl && !validateUrl(webshopUrl)) {
      setError('Please enter a valid URL (e.g., https://your-webshop.com)');
      return;
    }
    if (ecommerceType === 'custom') {
      if (!apiBaseUrl || !customApiKey) {
        setError('API Base URL and API Key are required for Custom integration.');
        return;
      }
    } else if (ecommerceType === 'shopify') {
      if (!webshopUrl || !shopifyClientId || !shopifyClientSecret) {
        setError('Webshop URL, Client ID, and Client Secret are required for Shopify.');
        return;
      }
    } else if (ecommerceType === 'woocommerce') {
      if (!storeUrl || !consumerKey || !consumerSecret) {
        setError('Store URL, Consumer Key, and Consumer Secret are required for WooCommerce.');
        return;
      }
    } else if (ecommerceType === 'prestashop') {
      if (!storeUrl || !prestaApiKey) {
        setError('Store URL and API Key are required for PrestaShop.');
        return;
      }
    }
    setIsLoading(true);
    setError('');
    try {
      const updates: Partial<UserSubscription> = {
        webshopUrl: webshopUrl || undefined,
        apiToken: apiToken || undefined,
        ecommerceType: (ecommerceType as UserSubscription['ecommerceType']) || undefined
      };
      if (ecommerceType === 'custom') {
        updates.apiBaseUrl = apiBaseUrl;
        updates.apiKey = customApiKey;
      } else if (ecommerceType === 'shopify') {
        updates.shopifyClientId = shopifyClientId;
        updates.shopifyClientSecret = shopifyClientSecret;
      } else if (ecommerceType === 'woocommerce') {
        updates.storeUrl = storeUrl;
        updates.consumerKey = consumerKey;
        updates.consumerSecret = consumerSecret;
      } else if (ecommerceType === 'prestashop') {
        updates.storeUrl = storeUrl;
        updates.apiKey = prestaApiKey;
      }
      await updateUserSubscription(subscription.id, updates);
      onUpdate();
      onClose();
    } catch (err) {
      setError('Failed to update subscription settings. Please try again.');
      console.error('Error updating subscription:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-100 my-6 mx-auto">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Subscription Settings</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 col-span-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Ecommerce Type (first column) */}
          <div>
            <label htmlFor="ecommerceType" className="block text-sm font-medium text-gray-700 mb-2">
              Ecommerce Platform
            </label>
            <select
              id="ecommerceType"
              value={ecommerceType}
              onChange={(e) => setEcommerceType(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm"
              required
            >
              <option value="">Select platform</option>
              {ECOMMERCE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          {/* Webshop URL (second and third columns) */}
          <div className="md:col-span-2">
            <label htmlFor="webshopUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Webshop URL
            </label>
            <input
              type="url"
              id="webshopUrl"
              value={webshopUrl}
              onChange={(e) => setWebshopUrl(e.target.value)}
              placeholder="https://your-webshop.com"
              className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the URL where your chatbot will be installed
            </p>
          </div>
          {/* Dynamic Fields */}
          {ecommerceType === 'custom' && (
            <>
              <div>
                <label
                  htmlFor="apiBaseUrl"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  API Base URL
                </label>
                <input
                  type="url"
                  id="apiBaseUrl"
                  value={apiBaseUrl}
                  onChange={(e) => setApiBaseUrl(e.target.value)}
                  placeholder="https://api.yourshop.com"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="customApiKey"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  API Key
                </label>
                <input
                  type="text"
                  id="customApiKey"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="Your API Key"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm"
                  required
                />
              </div>
            </>
          )}
          {ecommerceType === 'shopify' && (
            <>
              <div>
                <label htmlFor="shopifyClientId" className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID
                </label>
                <input
                  type="text"
                  id="shopifyClientId"
                  value={shopifyClientId}
                  onChange={(e) => setShopifyClientId(e.target.value)}
                  placeholder="Your Shopify app client ID"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="shopifyClientSecret"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Client Secret
                </label>
                <input
                  type="password"
                  id="shopifyClientSecret"
                  value={shopifyClientSecret}
                  onChange={(e) => setShopifyClientSecret(e.target.value)}
                  placeholder="Your Shopify app client secret"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm"
                  required
                />
              </div>
            </>
          )}
          {ecommerceType === 'woocommerce' && (
            <>
              <div>
                <label htmlFor="storeUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Store URL
                </label>
                <input
                  type="url"
                  id="storeUrl"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  placeholder="https://yourstore.com"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="consumerKey"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Consumer Key
                </label>
                <input
                  type="text"
                  id="consumerKey"
                  value={consumerKey}
                  onChange={(e) => setConsumerKey(e.target.value)}
                  placeholder="WooCommerce Consumer Key"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="consumerSecret"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Consumer Secret
                </label>
                <input
                  type="text"
                  id="consumerSecret"
                  value={consumerSecret}
                  onChange={(e) => setConsumerSecret(e.target.value)}
                  placeholder="WooCommerce Consumer Secret"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm"
                  required
                />
              </div>
            </>
          )}
          {ecommerceType === 'prestashop' && (
            <>
              <div>
                <label htmlFor="storeUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Store URL
                </label>
                <input
                  type="url"
                  id="storeUrl"
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  placeholder="https://yourstore.com"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="prestaApiKey"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  API Key
                </label>
                <input
                  type="text"
                  id="prestaApiKey"
                  value={prestaApiKey}
                  onChange={(e) => setPrestaApiKey(e.target.value)}
                  placeholder="PrestaShop API Key"
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm"
                  required
                />
              </div>
            </>
          )}
          {/* API Token */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <label htmlFor="apiToken" className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm font-mono"
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
                    className="flex-1 px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center"
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
  );
}
