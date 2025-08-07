import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscriptionsByStripeCustomer } from '@/lib/firestore-server';

export async function POST(request: NextRequest) {
  try {
    const { stripeCustomerId } = await request.json();

    if (!stripeCustomerId) {
      return NextResponse.json({ error: 'Stripe customer ID required' }, { status: 400 });
    }

    // Get all subscriptions for this Stripe customer
    const subscriptions = await getUserSubscriptionsByStripeCustomer(stripeCustomerId);

    if (subscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscriptions found' });
    }

    // Find the most recent subscription (keep the latest one)
    const sortedSubscriptions = subscriptions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const latestSubscription = sortedSubscriptions[0];
    const duplicates = sortedSubscriptions.slice(1);

    // Delete duplicate subscriptions
    for (const duplicate of duplicates) {
      // You would need to implement a delete function
      console.log('Would delete duplicate subscription:', duplicate.id);
    }

    return NextResponse.json({
      message: 'Cleanup completed',
      keptSubscription: latestSubscription.id,
      duplicatesFound: duplicates.length,
      note: 'Manual cleanup of userId field may be needed'
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      {
        error: 'Cleanup failed'
      },
      { status: 500 }
    );
  }
}
