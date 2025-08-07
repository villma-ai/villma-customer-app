import { NextRequest, NextResponse } from 'next/server';
import { updateUserSubscription, getUserSubscriptionById } from '@/lib/firestore-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('🔍 API Debug - GET /api/user-subscriptions/[id]:', { id });
  
  try {
    const subscription = await getUserSubscriptionById(id);
    console.log('🔍 API Debug - User subscription result:', subscription);
    
    if (!subscription) {
      return NextResponse.json(null, { status: 404 });
    }
    
    return NextResponse.json(subscription);
  } catch (error) {
    console.error('🔍 API Debug - Error fetching user subscription:', error);
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
  console.log('🔍 API Debug - PATCH /api/user-subscriptions/[id]:', { id });
  
  try {
    const updates = await request.json();
    console.log('🔍 API Debug - Update data:', updates);
    
    await updateUserSubscription(id, updates);
    console.log('🔍 API Debug - Subscription updated successfully');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('🔍 API Debug - Error updating user subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update user subscription' },
      { status: 500 }
    );
  }
}
