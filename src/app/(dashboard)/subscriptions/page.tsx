import { Suspense } from 'react';
import UserSubscriptionsPage from '@/components/pages/UserSubscriptionsPage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata = {
  title: 'My Subscriptions - Villma Customer App',
  description: 'Manage your subscriptions and chatbot settings'
};

export default function SubscriptionsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <UserSubscriptionsPage />
    </Suspense>
  );
}
