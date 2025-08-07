import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionPlans } from '@/lib/firestore-server';

export async function GET() {
  console.log('🔍 API Debug - GET /api/subscription-plans');
  
  try {
    const plans = await getSubscriptionPlans();
    console.log('🔍 API Debug - Subscription plans result:', plans);
    
    return NextResponse.json(plans);
  } catch (error) {
    console.error('🔍 API Debug - Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}
