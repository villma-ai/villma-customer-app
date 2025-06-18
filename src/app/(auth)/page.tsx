import { Suspense } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AuthFlow from '@/components/auth/AuthFlow';

export default function AuthPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AuthFlow />
    </Suspense>
  );
}
