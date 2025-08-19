import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createUserSubscription, getUserProfileByEmail, getSubscriptionPlans, getSubscriptionByStripeId } from '@/lib/firestore-server';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (!stripe) {
      console.error('❌ Stripe is not configured');
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.status !== 'complete') {
      return NextResponse.json({ 
        error: 'Session is not complete', 
        status: session.status 
      }, { status: 400 });
    }

    let subscription = null;
    if (session.subscription && typeof session.subscription === 'string') {
      subscription = await stripe.subscriptions.retrieve(session.subscription);
    }

    if (!subscription) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
    }

    // Get user profile by email
    const userEmail = session.customer_details?.email || session.metadata?.customerEmail;
    
    if (!userEmail) {
      return NextResponse.json({ error: 'No customer email found' }, { status: 400 });
    }

    // Check if subscription already exists by Stripe subscription ID
    const existingSubscription = await getSubscriptionByStripeId(subscription.id);
    
    if (existingSubscription) {
      console.log('✅ Subscription already exists with ID:', existingSubscription.id);
      return NextResponse.json({ 
        success: true,
        subscriptionId: existingSubscription.id,
        sessionId: session.id,
        subscriptionStatus: subscription.status,
        customerEmail: userEmail,
        message: 'Subscription already exists'
      });
    }

    // Get user profile by email
    const userProfile = await getUserProfileByEmail(userEmail);
    
    if (!userProfile) {
      return NextResponse.json({ error: 'No user profile found for email' }, { status: 400 });
    }

    // Get plan details from database
    const plans = await getSubscriptionPlans();
    const planName = session.metadata?.planName || 'BASE';
    const billingCycle = session.metadata?.billingCycle || 'monthly';
    const plan = plans.find(p => p.name === planName && p.billingCycle === billingCycle);
    
    if (!plan) {
      return NextResponse.json({ 
        error: 'Plan not found', 
        planName, 
        billingCycle,
        availablePlans: plans.map(p => ({ name: p.name, billingCycle: p.billingCycle }))
      }, { status: 400 });
    }

    // Create user subscription
    const currentPeriodStart = (subscription as any).current_period_start;
    const currentPeriodEnd = (subscription as any).current_period_end;
    
    const userSubscription = {
      userId: userProfile.uid,
      planId: plan.id,
      planName: plan.name,
      planBillingCycle: plan.billingCycle,
      planPrice: plan.price,
      planDescription: plan.description,
      status: subscription.status as 'active' | 'cancelled' | 'pending' | 'expired',
      stripeCustomerId: subscription.customer as string,
      stripeSubscriptionId: subscription.id,
      startDate: currentPeriodStart ? new Date(currentPeriodStart * 1000) : new Date(),
      endDate: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      hasExtraProdData: plan.hasExtraProdData || false
    };
    
    const subscriptionId = await createUserSubscription(userSubscription);
    console.log('✅ User subscription created with ID:', subscriptionId);

    return NextResponse.json({ 
      success: true,
      subscriptionId,
      sessionId: session.id,
      subscriptionStatus: subscription.status,
      customerEmail: userEmail
    });
  } catch (error) {
    console.error('❌ Session processing error:', error);
    return NextResponse.json({ 
      error: 'Processing failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
