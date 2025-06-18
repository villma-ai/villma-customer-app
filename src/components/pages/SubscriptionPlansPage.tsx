'use client';

import { useAuth } from '@/contexts/AuthContext';
import SubscriptionPlans from '@/components/dashboard/SubscriptionPlans';

export default function SubscriptionPlansPage() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null; // Will be handled by AuthFlow
  }

  return <SubscriptionPlans userId={currentUser.uid} />;
}
