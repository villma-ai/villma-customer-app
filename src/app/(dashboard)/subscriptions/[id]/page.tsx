import Link from 'next/link';
import { Suspense } from 'react';
import { getUserSubscriptionById } from '@/lib/firestore';
import ProductSearchShopify from '@/components/ui/ProductSearchShopify';

interface SubscriptionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SubscriptionDetailPage({ params }: SubscriptionDetailPageProps) {
  const { id } = await params;

  // Fetch subscription to determine ecommerce type
  const subscription = await getUserSubscriptionById(id);
  const ecommerceType = subscription?.ecommerceType;

  const renderProductSearch = () => {
    switch (ecommerceType) {
      case 'shopify':
        return <ProductSearchShopify subscriptionId={id} />;
      case 'woocommerce':
        return <div className="text-gray-500">WooCommerce product search coming soon...</div>;
      case 'prestashop':
        return <div className="text-gray-500">PrestaShop product search coming soon...</div>;
      case 'custom':
        return <div className="text-gray-500">Custom ecommerce product search coming soon...</div>;
      default:
        return (
          <div className="text-gray-500">
            Product search not available for this subscription type.
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Link
        href="/subscriptions"
        className="inline-block mb-6 text-sky-600 hover:text-sky-800 font-medium text-sm underline"
      >
        &larr; Back to My Subscriptions
      </Link>
      <h1 className="text-3xl font-bold mb-4">Enhanced Products</h1>
      <Suspense fallback={<div>Loading product search...</div>}>{renderProductSearch()}</Suspense>
    </div>
  );
}
