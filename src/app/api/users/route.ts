import { NextRequest, NextResponse } from 'next/server';
import { createUserProfile } from '@/lib/firestore-server';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  logger.debug('POST /api/users');
  
  try {
    const userProfile = await request.json();
    logger.debug('Creating user profile', { 
      userId: userProfile.uid,
      email: userProfile.email 
    });
    
    await createUserProfile(userProfile);
    logger.debug('User profile created successfully', { 
      userId: userProfile.uid 
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error creating user profile', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return NextResponse.json(
      { error: 'Failed to create user profile' },
      { status: 500 }
    );
  }
}
