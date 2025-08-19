'use client';
import { useState, useEffect } from 'react';
import { getUserSubscriptionById } from '@/lib/firestore';
import ProductSearchShopify from './ProductSearchShopify';

interface ProductSearchWrapperProps {
  subscriptionId: string;
}

export default function ProductSearchWrapper({ subscriptionId }: ProductSearchWrapperProps) {
  const [ecommerceType, setEcommerceType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const subscription = await getUserSubscriptionById(subscriptionId);
        if (subscription) {
          setEcommerceType(subscription.ecommerceType || null);
        } else {
          setError('Subscription not found');
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setError('Failed to load subscription details');
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [subscriptionId]);

  if (loading) {
    return <div className="text-gray-500">Loading subscription details...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!ecommerceType) {
    return <div className="text-gray-500">No ecommerce type found</div>;
  }

  const renderProductSearch = () => {
    switch (ecommerceType) {
      case 'shopify':
        return <ProductSearchShopify subscriptionId={subscriptionId} />;
      case 'woocommerce':
        return <div className="text-gray-500">WooCommerce product search coming soon...</div>;
      case 'prestashop':
        return <div className="text-gray-500">PrestaShop product search coming soon...</div>;
      case 'custom':
        return <div className="text-gray-500">Custom ecommerce product search coming soon...</div>;
      default:
        return <div className="text-gray-500">Product search not available for this subscription type.</div>;
    }
  };

  return renderProductSearch();
} 