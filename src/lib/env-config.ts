/**
 * Environment-specific configuration loader
 * Loads different configurations based on NODE_ENV
 */

interface EnvConfig {
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

const config = {
  firestore: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    databaseName: process.env.FIRESTORE_DATABASE_NAME || 'default'
  },
  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ''
  }
};

export function getEnvConfig(): EnvConfig {
 
  console.log('🔍 Config Debug:', {
    config: config
  });
  
  return config as EnvConfig;
}

export function getClientSafeConfig() {
  const config = getEnvConfig();
  return {
    firestore: config.firestore,
    stripe: {
      publishableKey: config.stripe.publishableKey
    }
  };
}
