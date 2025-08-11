import { NextRequest, NextResponse } from 'next/server';
import { markWebhookEventProcessed } from '@/lib/firestore-server';
import logger from '@/lib/logger';

export async function POST(request: NextRequest) {
  logger.debug('POST /api/webhook-events');
  
  try {
    const { eventId } = await request.json();
    logger.debug('Marking webhook event as processed:', eventId);
    
    await markWebhookEventProcessed(eventId);
    logger.debug('Webhook event marked as processed successfully');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error marking webhook event as processed:', error);
    return NextResponse.json(
      { error: 'Failed to mark webhook event as processed' },
      { status: 500 }
    );
  }
}
