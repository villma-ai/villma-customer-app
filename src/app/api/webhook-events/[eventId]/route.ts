import { NextRequest, NextResponse } from 'next/server';
import { isWebhookEventProcessed } from '@/lib/firestore-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  console.log('🔍 API Debug - GET /api/webhook-events/[eventId]:', { eventId });
  
  try {
    const processed = await isWebhookEventProcessed(eventId);
    console.log('🔍 API Debug - Webhook event processed result:', processed);
    
    if (processed) {
      return NextResponse.json({ processed: true });
    } else {
      return NextResponse.json(null, { status: 404 });
    }
  } catch (error) {
    console.error('🔍 API Debug - Error checking webhook event:', error);
    return NextResponse.json(
      { error: 'Failed to check webhook event' },
      { status: 500 }
    );
  }
}
