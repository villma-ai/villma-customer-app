import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, getStripePriceId, stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is properly configured
    if (!stripe) {
      return NextResponse.json(
        {
          error: 'Stripe is not properly configured. Please check your environment variables.'
        },
        { status: 500 }
      );
    }

    const { planName, billingCycle, customerEmail } = await request.json();

    console.log('Creating checkout session with:', {
      planName,
      billingCycle,
      customerEmail
    });

    if (!planName || !billingCycle || !customerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the Stripe price ID for the selected plan
    const priceId = getStripePriceId(planName, billingCycle);

    if (!priceId) {
      return NextResponse.json({ error: 'Invalid plan or billing cycle' }, { status: 400 });
    }

    console.log('Using price ID:', priceId);

    // Create checkout session
    const session = await createCheckoutSession({
      priceId,
      customerEmail,
      successUrl: `${request.nextUrl.origin}/subscriptions?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${request.nextUrl.origin}/plans?canceled=true`,
      metadata: {
        planName,
        billingCycle,
        customerEmail
      }
    });

    console.log('Checkout session created:', session.id);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
