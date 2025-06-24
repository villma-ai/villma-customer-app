/**
 * Runtime configuration utility
 * Reads environment variables at runtime instead of build time
 */

interface RuntimeConfig {
  // Firebase Configuration
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
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
    firebase: {
      apiKey: process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.FIREBASE_PROJECT_ID || '',
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.FIREBASE_APP_ID || '',
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      products: {
        baseMonthly: process.env.STRIPE_BASE_MONTHLY_PRICE_ID || '',
        baseYearly: process.env.STRIPE_BASE_YEARLY_PRICE_ID || '',
        extraMonthly: process.env.STRIPE_EXTRA_MONTHLY_PRICE_ID || '',
        extraYearly: process.env.STRIPE_EXTRA_YEARLY_PRICE_ID || '',
      },
    },
  };
}

// Client-side configuration (only safe for client)
export function getClientConfig() {
  const config = getRuntimeConfig();
  return {
    firebase: config.firebase,
    stripe: {
      publishableKey: config.stripe.publishableKey,
    },
  };
}

// Server-side configuration (includes secrets)
export function getServerConfig() {
  return getRuntimeConfig();
} 