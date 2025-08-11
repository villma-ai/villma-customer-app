/**
 * Runtime configuration utility
 * Reads environment variables at runtime instead of build time
 */

interface RuntimeConfig {
  // Firestore Configuration
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

  // Stripe Configuration
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
    products: {
      baseMonthly: string;
      baseYearly: string;
      extraMonthly: string;
      extraYearly: string;
    };
  };
}

// Runtime configuration getter
export function getRuntimeConfig(): RuntimeConfig {
  return {
    firestore: {
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
      databaseName: process.env.FIRESTORE_DATABASE_NAME || 'default',
      collections: {
        users: process.env.FIRESTORE_COLLECTION_USERS || 'users',
        subscriptionPlans: process.env.FIRESTORE_COLLECTION_SUBSCRIPTION_PLANS || 'subscriptionPlans',
        userSubscriptions: process.env.FIRESTORE_COLLECTION_USER_SUBSCRIPTIONS || 'userSubscriptions',
        webhookEvents: process.env.FIRESTORE_COLLECTION_WEBHOOK_EVENTS || 'webhookEvents',
        userProducts: process.env.FIRESTORE_COLLECTION_USER_PRODUCTS || 'userProducts'
      }
    },
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      products: {
        baseMonthly: process.env.STRIPE_BASE_MONTHLY_PRICE_ID || '',
        baseYearly: process.env.STRIPE_BASE_YEARLY_PRICE_ID || '',
        extraMonthly: process.env.STRIPE_EXTRA_MONTHLY_PRICE_ID || '',
        extraYearly: process.env.STRIPE_EXTRA_YEARLY_PRICE_ID || ''
      }
    }
  };
}

// Client-side configuration (only safe for client)
export function getClientConfig() {
  const config = getRuntimeConfig();
  return {
    firestore: config.firestore,
    stripe: {
      publishableKey: config.stripe.publishableKey
    }
  };
}

// Server-side configuration (includes secrets)
export function getServerConfig() {
  return getRuntimeConfig();
}

// Dynamic configuration for runtime updates
let dynamicConfig: Partial<RuntimeConfig> = {};

// Function to update configuration at runtime
export function updateRuntimeConfig(newConfig: Partial<RuntimeConfig>) {
  dynamicConfig = { ...dynamicConfig, ...newConfig };
}

// Function to get configuration with runtime overrides
export function getDynamicConfig(): RuntimeConfig {
  const baseConfig = getRuntimeConfig();
  return {
    ...baseConfig,
    ...dynamicConfig,
    firestore: {
      ...baseConfig.firestore,
      ...dynamicConfig.firestore
    },
    stripe: {
      ...baseConfig.stripe,
      ...dynamicConfig.stripe
    }
  };
}

// Client-side dynamic configuration
export function getDynamicClientConfig() {
  const config = getDynamicConfig();
  return {
    firestore: config.firestore,
    stripe: {
      publishableKey: config.stripe.publishableKey
    }
  };
}
