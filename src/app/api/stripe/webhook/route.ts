import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONFIG } from '@/lib/stripe';
import {
  createUserSubscription,
  updateUserSubscription,
  getUserSubscriptionsByStripeCustomer,
  getUserProfileByEmail,
  isWebhookEventProcessed,
  markWebhookEventProcessed
} from '@/lib/firestore';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  // Check if Stripe is properly configured
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not properly configured. Please check your environment variables.' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_CONFIG.webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log('Received webhook event:', event.type, 'ID:', event.id);

  // Check if we've already processed this webhook event
  const alreadyProcessed = await isWebhookEventProcessed(event.id);
  if (alreadyProcessed) {
    console.log('Webhook event already processed, skipping:', event.id);
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark this webhook event as processed
    await markWebhookEventProcessed(event.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout session completed:', session.id);
  console.log('Session data:', JSON.stringify(session, null, 2));

  if (!stripe) {
    console.error('Stripe is not properly configured');
    return;
  }

  try {
    // Get the subscription from the session
    if (session.subscription && typeof session.subscription === 'string') {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      console.log('Retrieved subscription:', subscription.id);

      await handleSubscriptionCreated(subscription);
    } else {
      console.log('No subscription found in session');
    }
  } catch (error) {
    console.error('Error handling checkout session:', error);
  }
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id);
  console.log('Subscription data:', JSON.stringify(subscription, null, 2));

  if (!stripe) {
    console.error('Stripe is not properly configured');
    return;
  }

  try {
    // Get metadata from the subscription
    const metadata = subscription.metadata;
    let customerEmail: string | null = null;

    // Try to get customer email from the customer object
    if (subscription.customer) {
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      if (customer && 'email' in customer) {
        customerEmail = customer.email;
      }
    }

    console.log('Metadata:', metadata);
    console.log('Customer email:', customerEmail);

    // Check if subscription already exists to prevent duplicates
    const existingSubscriptions = await getUserSubscriptionsByStripeCustomer(
      subscription.customer as string
    );
    const alreadyExists = existingSubscriptions.some(
      (sub) => sub.stripeSubscriptionId === subscription.id
    );

    if (alreadyExists) {
      console.log('Subscription already exists, skipping creation');
      return;
    }

    // Additional check: look for recent subscriptions with same customer and plan
    const recentSubscriptions = existingSubscriptions.filter((sub) => {
      const createdAt = new Date(sub.createdAt);
      const now = new Date();
      const timeDiff = now.getTime() - createdAt.getTime();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
      return timeDiff < fiveMinutes;
    });

    if (recentSubscriptions.length > 0) {
      console.log('Recent subscription found, skipping creation to prevent duplicates');
      return;
    }

    // Try to get plan info from the subscription items
    const subscriptionItem = subscription.items.data[0];
    const price = subscriptionItem.price;

    // Extract plan name and billing cycle from price metadata or description
    let planName = metadata.planName;
    let billingCycle = metadata.billingCycle;

    // If metadata is empty, try to extract from price
    if (!planName || !billingCycle) {
      if (price.metadata.planName) {
        planName = price.metadata.planName;
      }
      if (price.metadata.billingCycle) {
        billingCycle = price.metadata.billingCycle;
      }

      // Fallback: try to extract from price description
      if (price.nickname) {
        const nickname = price.nickname.toLowerCase();
        if (nickname.includes('base')) {
          planName = 'BASE';
        } else if (nickname.includes('extra')) {
          planName = 'EXTRA';
        }

        if (nickname.includes('monthly') || nickname.includes('month')) {
          billingCycle = 'monthly';
        } else if (nickname.includes('yearly') || nickname.includes('year')) {
          billingCycle = 'yearly';
        }
      }
    }

    console.log('Extracted plan info:', { planName, billingCycle });

    if (planName && billingCycle && customerEmail) {
      // Get the Firebase user ID from the customer email
      const userProfile = await getUserProfileByEmail(customerEmail);
      if (!userProfile) {
        console.error('User profile not found for email:', customerEmail);
        return;
      }

      // Calculate proper dates
      const startDate = new Date(subscription.start_date * 1000);
      const endDate = new Date(subscriptionItem.current_period_end * 1000);

      console.log('Calculated dates:', { startDate, endDate });
      console.log('Subscription item current_period_end:', subscriptionItem.current_period_end);

      const subscriptionData = {
        userId: userProfile.uid, // Use Firebase user ID, not Stripe customer ID
        planId: subscription.id,
        planName: planName,
        planBillingCycle: billingCycle as 'monthly' | 'yearly',
        planPrice: subscriptionItem.price.unit_amount! / 100,
        planDescription: `Stripe subscription for ${planName} ${billingCycle}`,
        status: (subscription.status === 'active' ? 'active' : 'pending') as
          | 'active'
          | 'pending'
          | 'cancelled'
          | 'expired',
        startDate: startDate,
        endDate: endDate,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        hasExtraProdData: planName === 'EXTRA'
      };

      console.log('Creating user subscription with data:', subscriptionData);

      const subscriptionId = await createUserSubscription(subscriptionData);
      console.log('User subscription created with ID:', subscriptionId);
    } else {
      console.error('Missing required data for subscription creation:', {
        planName,
        billingCycle,
        customerEmail
      });
    }
  } catch (error) {
    console.error('Error creating user subscription:', error);
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id);

  try {
    const subscriptionItem = subscription.items.data[0];
    await updateUserSubscription(subscription.id, {
      status: (subscription.status === 'active' ? 'active' : 'cancelled') as
        | 'active'
        | 'pending'
        | 'cancelled'
        | 'expired',
      endDate: new Date(subscriptionItem.current_period_end * 1000),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id);

  try {
    await updateUserSubscription(subscription.id, {
      status: 'cancelled',
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error deleting subscription:', error);
  }
}
