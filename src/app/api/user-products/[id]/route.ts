import { NextRequest, NextResponse } from 'next/server';
import { updateUserProductDescription } from '@/lib/firestore-server';
import logger from '@/lib/logger';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  logger.debug('PATCH /api/user-products/[id]:', { id });
  
  try {
    const { description } = await request.json();
    logger.debug('Update product description:', description);
    
    await updateUserProductDescription(id, description);
    logger.debug('Product description updated successfully');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error updating product description:', error);
    return NextResponse.json(
      { error: 'Failed to update product description' },
      { status: 500 }
    );
  }
}
