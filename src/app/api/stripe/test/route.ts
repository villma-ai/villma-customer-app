import { NextResponse } from 'next/server';
import { createUserSubscription } from '@/lib/firestore';

export async function GET() {
  try {
    // Test creating a subscription
    const testSubscription = {
      userId: 'test-user-id',
      planId: 'test-plan-id',
      planName: 'BASE',
      planBillingCycle: 'monthly' as const,
      planPrice: 29,
      planDescription: 'Test subscription',
      status: 'active' as const,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      stripeSubscriptionId: 'test-stripe-sub-id',
      stripeCustomerId: 'test-customer-id'
    };

    const subscriptionId = await createUserSubscription(testSubscription);

    return NextResponse.json({
      success: true,
      subscriptionId,
      message: 'Test subscription created successfully'
    });
  } catch (error) {
    console.error('Test subscription creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
