import { NextRequest, NextResponse } from 'next/server';
import { createUserProfile } from '@/lib/firestore-server';

export async function POST(request: NextRequest) {
  console.log('🔍 API Debug - POST /api/users');
  
  try {
    const userProfile = await request.json();
    console.log('🔍 API Debug - Creating user profile:', userProfile);
    
    await createUserProfile(userProfile);
    console.log('🔍 API Debug - User profile created successfully');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('🔍 API Debug - Error creating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to create user profile' },
      { status: 500 }
    );
  }
}
