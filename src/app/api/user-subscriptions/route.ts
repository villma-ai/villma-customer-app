import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscriptions, createUserSubscription } from '@/lib/firestore-server';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const subscriptions = await getUserSubscriptions(userId);
    return NextResponse.json(subscriptions);
  } catch (error) {
    logger.error('Error fetching user subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  logger.debug('POST /api/user-subscriptions');
  
  try {
    const subscription = await request.json();
    logger.debug('Creating subscription:', subscription);
    
    const subscriptionId = await createUserSubscription(subscription);
    logger.debug('Subscription created with ID:', subscriptionId);
    
    return NextResponse.json({ id: subscriptionId });
  } catch (error) {
    logger.error('Error creating user subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create user subscription' },
      { status: 500 }
    );
  }
}
