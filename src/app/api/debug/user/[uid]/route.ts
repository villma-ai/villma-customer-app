import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile, getUserSubscriptions } from '@/lib/firestore-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;
  
  try {
    // Get user profile
    const userProfile = await getUserProfile(uid);
    
    // Get user subscriptions
    const subscriptions = await getUserSubscriptions(uid);
    
    return NextResponse.json({
      uid,
      userProfile,
      subscriptions,
      subscriptionCount: subscriptions.length,
      hasProfile: !!userProfile,
      hasSubscriptions: subscriptions.length > 0
    });
  } catch (error) {
    console.error('❌ Debug user endpoint error:', error);
    return NextResponse.json({ error: 'Debug failed' }, { status: 500 });
  }
}
