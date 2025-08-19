/**
 * Server-side environment variable validation utility
 * Checks server-side environment variables for API routes
 */

interface ServerEnvVar {
  name: string;
  required: boolean;
  description: string;
}

const serverEnvVars: ServerEnvVar[] = [
  // Stripe Configuration (Server-side only)
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

  // Stripe Product/Price IDs (Server-side only)
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

export function validateServerEnvironmentVariables(): void {
  // Skip validation during build time or when not in a request context
  if (
    process.env.NODE_ENV === 'production' &&
    typeof window === 'undefined' &&
    !process.env.NEXT_RUNTIME
  ) {
    console.log('⚠️  Skipping environment validation during build (no runtime variables set)');
    return;
  }

  const missingVars: ServerEnvVar[] = [];
  const emptyVars: ServerEnvVar[] = [];

  for (const envVar of serverEnvVars) {
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
    console.error('❌ Server environment variable validation failed!');
    console.error('');

    if (missingVars.length > 0) {
      console.error('Missing required server environment variables:');
      missingVars.forEach((envVar) => {
        console.error(`  - ${envVar.name}: ${envVar.description}`);
      });
      console.error('');
    }

    if (emptyVars.length > 0) {
      console.error('Empty required server environment variables:');
      emptyVars.forEach((envVar) => {
        console.error(`  - ${envVar.name}: ${envVar.description}`);
      });
      console.error('');
    }

    console.error(
      'Please set all required server environment variables in your deployment environment.'
    );
    console.error('');
    console.error('Required server environment variables:');
    console.error('```');
    console.error('# Stripe Configuration');
    console.error('STRIPE_SECRET_KEY=sk_test_...');
    console.error('STRIPE_WEBHOOK_SECRET=whsec_...');
    console.error('');
    console.error('# Stripe Product/Price IDs');
    console.error('STRIPE_BASE_MONTHLY_PRICE_ID=price_...');
    console.error('STRIPE_BASE_YEARLY_PRICE_ID=price_...');
    console.error('STRIPE_EXTRA_MONTHLY_PRICE_ID=price_...');
    console.error('STRIPE_EXTRA_YEARLY_PRICE_ID=price_...');
    console.error('```');

    throw new Error(
      'Server environment variables validation failed. Please check the console output above.'
    );
  } else {
    console.log('✅ All required server environment variables are set correctly!');
  }
}

// Export the list of server env vars for reference
export { serverEnvVars };
