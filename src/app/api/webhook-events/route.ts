import { NextRequest, NextResponse } from 'next/server';
import { markWebhookEventProcessed } from '@/lib/firestore-server';

export async function POST(request: NextRequest) {
  console.log('🔍 API Debug - POST /api/webhook-events');
  
  try {
    const { eventId } = await request.json();
    console.log('🔍 API Debug - Marking webhook event as processed:', eventId);
    
    await markWebhookEventProcessed(eventId);
    console.log('🔍 API Debug - Webhook event marked as processed successfully');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('🔍 API Debug - Error marking webhook event as processed:', error);
    return NextResponse.json(
      { error: 'Failed to mark webhook event as processed' },
      { status: 500 }
    );
  }
}
