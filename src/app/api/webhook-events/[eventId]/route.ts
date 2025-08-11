import { NextRequest, NextResponse } from 'next/server';
import { isWebhookEventProcessed } from '@/lib/firestore-server';
import logger from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  logger.debug('GET /api/webhook-events/[eventId]:', { eventId });
  
  try {
    const processed = await isWebhookEventProcessed(eventId);
    logger.debug('Webhook event processed result:', processed);
    
    if (processed) {
      return NextResponse.json({ processed: true });
    } else {
      return NextResponse.json(null, { status: 404 });
    }
  } catch (error) {
    logger.error('Error checking webhook event:', error);
    return NextResponse.json(
      { error: 'Failed to check webhook event' },
      { status: 500 }
    );
  }
}
