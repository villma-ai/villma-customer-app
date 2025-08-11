import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile, createUserProfile, updateUserProfile } from '@/lib/firestore-server';
import logger from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;

  try {
    const userProfile = await getUserProfile(uid);

    if (!userProfile) {
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(userProfile);
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;
  logger.debug('PATCH /api/users/[uid]:', { uid });
  
  try {
    const updates = await request.json();
    logger.debug('Update data:', updates);
    
    await updateUserProfile(uid, updates);
    logger.debug('User profile updated successfully');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
