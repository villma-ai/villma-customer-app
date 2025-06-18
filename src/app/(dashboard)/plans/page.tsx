import { Suspense } from 'react';
import SubscriptionPlansPage from '@/components/pages/SubscriptionPlansPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata = {
  title: 'Available Plans - Villma Customer App',
  description: 'Choose the perfect subscription plan for your business needs'
};

export default function PlansPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SubscriptionPlansPage />
    </Suspense>
  );
}
