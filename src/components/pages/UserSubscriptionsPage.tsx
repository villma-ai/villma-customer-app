'use client';

import { useAuth } from '@/contexts/AuthContext';
import UserSubscriptions from '@/components/dashboard/UserSubscriptions';

export default function UserSubscriptionsPage() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null; // Will be handled by AuthFlow
  }

  return <UserSubscriptions userId={currentUser.uid} />;
}
