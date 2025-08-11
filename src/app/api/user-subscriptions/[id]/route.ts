import { NextRequest, NextResponse } from 'next/server';
import { updateUserSubscription, getUserSubscriptionById } from '@/lib/firestore-server';
import logger from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  logger.debug('GET /api/user-subscriptions/[id]:', { id });
  
  try {
    const subscription = await getUserSubscriptionById(id);
    logger.debug('User subscription result:', subscription);
    
    if (!subscription) {
      return NextResponse.json(null, { status: 404 });
    }
    
    return NextResponse.json(subscription);
  } catch (error) {
    logger.error('Error fetching user subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user subscription' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  logger.debug('PATCH /api/user-subscriptions/[id]:', { id });
  
  try {
    const updates = await request.json();
    logger.debug('Update data:', updates);
    
    await updateUserSubscription(id, updates);
    logger.debug('Subscription updated successfully');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error updating user subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update user subscription' },
      { status: 500 }
    );
  }
}
