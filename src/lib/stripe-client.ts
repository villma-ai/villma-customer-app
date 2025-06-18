import { loadStripe } from '@stripe/stripe-js';

// Load Stripe on the client side
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Function to redirect to Stripe checkout
export async function redirectToCheckout(sessionId: string) {
  const stripe = await stripePromise;

  if (!stripe) {
    throw new Error('Stripe failed to load');
  }

  const { error } = await stripe.redirectToCheckout({
    sessionId,
  });

  if (error) {
    throw error;
  }
}

// Function to create checkout session and redirect
export async function createCheckoutSession({
  planName,
  billingCycle,
  customerEmail,
}: {
  planName: string;
  billingCycle: string;
  customerEmail: string;
}) {
  try {
    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planName,
        billingCycle,
        customerEmail,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create checkout session');
    }

    // Redirect to Stripe checkout
    await redirectToCheckout(data.sessionId);
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
} 