import { useState, useEffect } from 'react';
import { getClientConfig } from '@/lib/runtime-config';

interface RuntimeConfig {
  firestore: {
    projectId: string;
    databaseName: string;
    collections: {
      users: string;
      subscriptionPlans: string;
      userSubscriptions: string;
      webhookEvents: string;
      userProducts: string;
    };
  };
  stripe: {
    publishableKey: string;
  };
}

export function useRuntimeConfig() {
  const [config, setConfig] = useState<RuntimeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        // First try to get config from API (for runtime updates)
        const response = await fetch('/api/config');
        if (response.ok) {
          const runtimeConfig = await response.json();
          setConfig(runtimeConfig);
        } else {
          // Fallback to build-time config
          const buildTimeConfig = getClientConfig();
          setConfig(buildTimeConfig);
        }
      } catch (err) {
        // Fallback to build-time config
        const buildTimeConfig = getClientConfig();
        setConfig(buildTimeConfig);
        console.warn('Failed to fetch runtime config, using build-time config:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  return { config, loading, error };
}
