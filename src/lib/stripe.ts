import Stripe from 'stripe';

// Initialize Stripe with your secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
});

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
};

// Product and price IDs for your subscription plans
export const STRIPE_PRODUCTS = {
  BASE_MONTHLY: process.env.STRIPE_BASE_MONTHLY_PRICE_ID!,
  BASE_YEARLY: process.env.STRIPE_BASE_YEARLY_PRICE_ID!,
  EXTRA_MONTHLY: process.env.STRIPE_EXTRA_MONTHLY_PRICE_ID!,
  EXTRA_YEARLY: process.env.STRIPE_EXTRA_YEARLY_PRICE_ID!,
};

// Helper function to get Stripe price ID based on plan
export function getStripePriceId(planName: string, billingCycle: string): string {
  const key = `${planName.toUpperCase()}_${billingCycle.toUpperCase()}` as keyof typeof STRIPE_PRODUCTS;
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
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    customer_email: customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    subscription_data: {
      metadata,
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
  });

  return session;
}

// Helper function to create a customer portal session
export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
} 