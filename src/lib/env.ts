/**
 * Environment variable validation utility
 * Checks all required environment variables at startup
 */

import { getRuntimeConfig } from './runtime-config';

interface EnvVar {
  name: string;
  required: boolean;
  description: string;
}

const requiredEnvVars: EnvVar[] = [

  // Stripe Configuration
  {
    name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    required: true,
    description: 'Stripe publishable key for client-side payments'
  },
  {
    name: 'STRIPE_SECRET_KEY',
    required: true,
    description: 'Stripe secret key for server-side operations'
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: true,
    description: 'Stripe webhook secret for webhook verification'
  },

  // Stripe Product/Price IDs
  {
    name: 'STRIPE_BASE_MONTHLY_PRICE_ID',
    required: true,
    description: 'Stripe price ID for Base monthly plan'
  },
  {
    name: 'STRIPE_BASE_YEARLY_PRICE_ID',
    required: true,
    description: 'Stripe price ID for Base yearly plan'
  },
  {
    name: 'STRIPE_EXTRA_MONTHLY_PRICE_ID',
    required: true,
    description: 'Stripe price ID for Extra monthly plan'
  },
  {
    name: 'STRIPE_EXTRA_YEARLY_PRICE_ID',
    required: true,
    description: 'Stripe price ID for Extra yearly plan'
  }
];

export function validateEnvironmentVariables(): void {
  // Skip validation during build time if no environment variables are set
  const config = getRuntimeConfig();
  if (
    process.env.NODE_ENV === 'production' &&
    (!config.stripe.secretKey || config.stripe.secretKey === 'sk_test_dummy_secret_key')
  ) {
    console.log('⚠️  Skipping environment validation during build (no runtime variables set)');
    return;
  }

  const missingVars: EnvVar[] = [];
  const emptyVars: EnvVar[] = [];

  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar.name];

    if (envVar.required) {
      if (value === undefined) {
        missingVars.push(envVar);
      } else if (value.trim() === '') {
        emptyVars.push(envVar);
      }
    }
  }

  if (missingVars.length > 0 || emptyVars.length > 0) {
    console.error('❌ Environment variable validation failed!');
    console.error('');

    if (missingVars.length > 0) {
      console.error('Missing required environment variables:');
      missingVars.forEach((envVar) => {
        console.error(`  - ${envVar.name}: ${envVar.description}`);
      });
      console.error('');
    }

    if (emptyVars.length > 0) {
      console.error('Empty required environment variables:');
      emptyVars.forEach((envVar) => {
        console.error(`  - ${envVar.name}: ${envVar.description}`);
      });
      console.error('');
    }

    console.error(
      'Please set all required environment variables in your .env.local file or deployment environment.'
    );
    console.error('');
    console.error('Example .env.local file:');
    console.error('```');
    console.error('');
    console.error('# Stripe Configuration');
    console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...');
    console.error('STRIPE_SECRET_KEY=sk_test_...');
    console.error('STRIPE_WEBHOOK_SECRET=whsec_...');
    console.error('');
    console.error('# Stripe Product/Price IDs');
    console.error('STRIPE_BASE_MONTHLY_PRICE_ID=price_...');
    console.error('STRIPE_BASE_YEARLY_PRICE_ID=price_...');
    console.error('STRIPE_EXTRA_MONTHLY_PRICE_ID=price_...');
    console.error('STRIPE_EXTRA_YEARLY_PRICE_ID=price_...');
    console.error('```');

    // In development, throw an error to prevent the app from starting
    if (process.env.NODE_ENV === 'development') {
      throw new Error(
        'Environment variables validation failed. Please check the console output above.'
      );
    }

    // In production, log the error but don't throw to avoid crashing the app
    console.error(
      '⚠️  App will continue to run but may not function properly without these environment variables.'
    );
  } else {
    console.log('✅ All required environment variables are set correctly!');
  }
}

// Export the list of required env vars for reference
export { requiredEnvVars };
