'use client';
import { useState, useEffect } from 'react';
import { getUserSubscriptionById } from '@/lib/firestore';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';

interface ProductSearchProps {
  subscriptionId: string;
}

interface SubscriptionDetails {
  ecommerceType: string;
  shopDomain?: string;
  adminApiToken?: string;
  // Add other fields for other platforms as needed
}

export default function ProductSearch({ subscriptionId }: ProductSearchProps) {
  const [search, setSearch] = useState('');
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [error, setError] = useState('');

  // Fetch subscription details from Firestore
  useEffect(() => {
    async function fetchSubscription() {
      try {
        const sub = await getUserSubscriptionById(subscriptionId);
        if (sub) {
          setSubscription({
            ecommerceType: sub.ecommerceType || '',
            shopDomain: sub.shopDomain || '',
            adminApiToken: sub.adminApiToken || ''
          });
        } else {
          setSubscription(null);
        }
      } catch {
        setError('Failed to fetch subscription details');
        setSubscription(null);
      }
    }
    fetchSubscription();
  }, [subscriptionId]);

  // Use the custom hook for Shopify product search
  const shopDomain = subscription?.ecommerceType === 'shopify' ? subscription.shopDomain || '' : '';
  const adminApiToken =
    subscription?.ecommerceType === 'shopify' ? subscription.adminApiToken || '' : '';
  const {
    products,
    loading,
    error: shopifyError
  } = useShopifyProducts(shopDomain, adminApiToken, search);

  if (!subscription) {
    return <div className="text-gray-500">Loading subscription details...</div>;
  }

  if (subscription.ecommerceType !== 'shopify') {
    return (
      <div className="text-gray-500">
        Product search is only available for Shopify subscriptions.
      </div>
    );
  }

  return (
    <div>
      <label htmlFor="product-search" className="block text-sm font-medium text-gray-700 mb-2">
        Search Products
      </label>
      <input
        id="product-search"
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Type to search products..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-sm mb-4"
      />
      {loading && <div className="text-gray-500 mb-2">Searching...</div>}
      {(error || shopifyError) && <div className="text-red-600 mb-2">{error || shopifyError}</div>}
      <ul className="space-y-2">
        {products.map((product) => (
          <li key={product.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            {product.title}
          </li>
        ))}
        {!loading && products.length === 0 && search && (
          <li className="text-gray-400">No products found.</li>
        )}
      </ul>
    </div>
  );
}
