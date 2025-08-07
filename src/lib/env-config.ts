/**
 * Environment-specific configuration loader
 * Loads different configurations based on NODE_ENV
 */

interface EnvConfig {
  google: {
    clientId: string;
  };
  gcp: {
    projectId: string;
  };
  firestore: {
    projectId: string;
    databaseName: string;
  };
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };
}

// Environment-specific configurations
const envConfigs: Record<string, Partial<EnvConfig>> = {
  development: {
    gcp: {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || ''
    },
    firestore: {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
      databaseName: process.env.FIRESTORE_DATABASE_NAME || 'default'
    },
    stripe: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
    }
  },
  production: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
    },
    gcp: {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || ''
    },
    firestore: {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
      databaseName: process.env.FIRESTORE_DATABASE_NAME || 'default'
    },
    stripe: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
    }
  },
  test: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
    },
    gcp: {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || ''
    },
    firestore: {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
      databaseName: process.env.FIRESTORE_DATABASE_NAME || 'default'
    },
    stripe: {
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
    }
  }
};

export function getEnvConfig(): EnvConfig {
  const env = process.env.NODE_ENV || 'development';
  const config = envConfigs[env] || envConfigs.development;
  
  console.log('🔍 Env Config Debug:', {
    NODE_ENV: env,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
    config: config
  });
  
  return config as EnvConfig;
}

export function getClientSafeConfig() {
  const config = getEnvConfig();
  return {
    google: config.google,
    gcp: config.gcp,
    firestore: config.firestore,
    stripe: {
      publishableKey: config.stripe.publishableKey
    }
  };
}
