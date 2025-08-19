'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRuntimeConfig } from '@/hooks/useRuntimeConfig';

interface ConfigContextType {
  config: any;
  loading: boolean;
  error: string | null;
  updateConfig: (newConfig: any) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

interface ConfigProviderProps {
  children: React.ReactNode;
  initialConfig?: any;
}

export function ConfigProvider({ children, initialConfig }: ConfigProviderProps) {
  const { config: runtimeConfig, loading, error } = useRuntimeConfig();
  const [config, setConfig] = useState(initialConfig || runtimeConfig);

  useEffect(() => {
    if (runtimeConfig && !loading) {
      setConfig(runtimeConfig);
    }
  }, [runtimeConfig, loading]);

  const updateConfig = (newConfig: any) => {
    setConfig({ ...config, ...newConfig });
  };

  const value = {
    config,
    loading,
    error,
    updateConfig
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}
