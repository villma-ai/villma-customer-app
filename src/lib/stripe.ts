import Stripe from 'stripe';
import { getRuntimeConfig } from './runtime-config';

// Get runtime configuration
const config = getRuntimeConfig();

// Helper function to check if Stripe is properly configured
function isStripeConfigured(): boolean {
  return !!(
    config.stripe.secretKey &&
    config.stripe.secretKey !== 'sk_test_dummy_secret_key' &&
    config.stripe.secretKey.startsWith('sk_')
  );
}

// Initialize Stripe only if properly configured
export const stripe = isStripeConfigured()
  ? new Stripe(config.stripe.secretKey, {
      apiVersion: '2025-05-28.basil'
    })
  : null;

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: config.stripe.publishableKey,
  secretKey: config.stripe.secretKey,
  webhookSecret: config.stripe.webhookSecret
};

// Product and price IDs for your subscription plans
export const STRIPE_PRODUCTS = {
  BASE_MONTHLY: config.stripe.products.baseMonthly,
  BASE_YEARLY: config.stripe.products.baseYearly,
  EXTRA_MONTHLY: config.stripe.products.extraMonthly,
  EXTRA_YEARLY: config.stripe.products.extraYearly
};

// Helper function to get Stripe price ID based on plan
export function getStripePriceId(planName: string, billingCycle: string): string {
  const key =
    `${planName.toUpperCase()}_${billingCycle.toUpperCase()}` as keyof typeof STRIPE_PRODUCTS;
  return STRIPE_PRODUCTS[key];
}

// Helper function to create a checkout session
export async function createCheckoutSession({
  priceId,
  customerEmail,
  successUrl,
  cancelUrl,
  metadata = {}
}: {
  priceId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) {
  if (!stripe) {
    throw new Error('Stripe is not properly configured. Please check your environment variables.');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1
      }
    ],
    customer_email: customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    subscription_data: {
      metadata
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required'
  });

  return session;
}

// Helper function to create a customer portal session
export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  if (!stripe) {
    throw new Error('Stripe is not properly configured. Please check your environment variables.');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl
  });

  return session;
}
