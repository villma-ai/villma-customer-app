import { NextRequest, NextResponse } from 'next/server';
import { getUserProfileByEmail } from '@/lib/firestore-server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  
  console.log('🔍 API Debug - GET /api/users/by-email:', { email });
  
  if (!email) {
    return NextResponse.json(
      { error: 'Email is required' },
      { status: 400 }
    );
  }
  
  try {
    const userProfile = await getUserProfileByEmail(email);
    console.log('🔍 API Debug - User profile by email result:', userProfile);
    
    if (!userProfile) {
      return NextResponse.json(null, { status: 404 });
    }
    
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('🔍 API Debug - Error fetching user profile by email:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile by email' },
      { status: 500 }
    );
  }
}
