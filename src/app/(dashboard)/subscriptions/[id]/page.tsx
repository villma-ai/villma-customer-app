import Link from 'next/link';
import { Suspense } from 'react';
import ProductSearch from '@/components/ui/ProductSearch';

interface SubscriptionDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SubscriptionDetailPage({ params }: SubscriptionDetailPageProps) {
  const { id } = await params;

  return (
    <div className="max-w-2xl mx-auto py-12">
      <Link
        href="/subscriptions"
        className="inline-block mb-6 text-sky-600 hover:text-sky-800 font-medium text-sm underline"
      >
        &larr; Back to My Subscriptions
      </Link>
      <h1 className="text-3xl font-bold mb-4">Enhanced Products</h1>
      <Suspense fallback={<div>Loading product search...</div>}>
        <ProductSearch subscriptionId={id} />
      </Suspense>
    </div>
  );
}
