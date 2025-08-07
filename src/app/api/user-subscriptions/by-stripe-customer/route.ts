import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscriptionsByStripeCustomer } from '@/lib/firestore-server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stripeCustomerId = searchParams.get('stripeCustomerId');
  
  console.log('🔍 API Debug - GET /api/user-subscriptions/by-stripe-customer:', { stripeCustomerId });
  
  if (!stripeCustomerId) {
    return NextResponse.json(
      { error: 'Stripe customer ID is required' },
      { status: 400 }
    );
  }
  
  try {
    const subscriptions = await getUserSubscriptionsByStripeCustomer(stripeCustomerId);
    console.log('🔍 API Debug - User subscriptions by Stripe customer result:', subscriptions);
    
    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('🔍 API Debug - Error fetching user subscriptions by Stripe customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user subscriptions by Stripe customer' },
      { status: 500 }
    );
  }
}
