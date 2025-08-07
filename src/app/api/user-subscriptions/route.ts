import { NextRequest, NextResponse } from 'next/server';
import { getUserSubscriptions, createUserSubscription } from '@/lib/firestore-server';

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
    console.error('❌ Error fetching user subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 API Debug - POST /api/user-subscriptions');
  
  try {
    const subscription = await request.json();
    console.log('🔍 API Debug - Creating subscription:', subscription);
    
    const subscriptionId = await createUserSubscription(subscription);
    console.log('🔍 API Debug - Subscription created with ID:', subscriptionId);
    
    return NextResponse.json({ id: subscriptionId });
  } catch (error) {
    console.error('🔍 API Debug - Error creating user subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create user subscription' },
      { status: 500 }
    );
  }
}
