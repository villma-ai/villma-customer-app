import { Suspense } from 'react';
import ProfilePage from '@/components/pages/ProfilePage';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export const metadata = {
  title: 'Profile - Villma Customer App',
  description: 'Manage your profile information'
};

export default function Profile() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProfilePage />
    </Suspense>
  );
}
