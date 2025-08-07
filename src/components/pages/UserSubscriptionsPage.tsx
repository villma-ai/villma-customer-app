'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import UserSubscriptions from '@/components/dashboard/UserSubscriptions';

export default function UserSubscriptionsPage() {
  const { currentUser } = useAuth();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');

    if (success === 'true' && sessionId && currentUser) {
      // Check if we're already processing this session
      if (processingRef.current.has(sessionId)) {
        return;
      }

      setIsProcessing(true);
      processingRef.current.add(sessionId);

      // Process the session automatically
      fetch('/api/stripe/process-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            console.log('✅ Session processed successfully');
            // Remove the URL parameters to avoid reprocessing
            window.history.replaceState({}, '', '/subscriptions');
          } else {
            console.error('❌ Failed to process session:', data);
            // Still remove URL parameters to avoid infinite retries
            window.history.replaceState({}, '', '/subscriptions');
          }
        })
        .catch(error => {
          console.error('❌ Error processing session:', error);
          // Remove URL parameters even on error
          window.history.replaceState({}, '', '/subscriptions');
        })
        .finally(() => {
          setIsProcessing(false);
          processingRef.current.delete(sessionId);
        });
    }
  }, [searchParams, currentUser]);

  if (!currentUser) {
    return null; // Will be handled by AuthFlow
  }

  if (isProcessing) {
    return (
      <div className="max-w-7xl mx-auto py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Processing your subscription...</p>
        </div>
      </div>
    );
  }

  return <UserSubscriptions userId={currentUser.uid} />;
}
