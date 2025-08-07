import { NextResponse } from 'next/server';

export async function GET() {
  // Server-side environment variables (not exposed to client)
  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  };

  // Validate required Firebase config
  const requiredFields = ['apiKey', 'authDomain'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);

  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration:', missingFields);
    return NextResponse.json(
      { error: 'Firebase configuration incomplete' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    firebase: firebaseConfig
  });
}
