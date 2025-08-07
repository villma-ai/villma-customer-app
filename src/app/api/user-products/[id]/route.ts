import { NextRequest, NextResponse } from 'next/server';
import { updateUserProductDescription } from '@/lib/firestore-server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  console.log('🔍 API Debug - PATCH /api/user-products/[id]:', { id });
  
  try {
    const { description } = await request.json();
    console.log('🔍 API Debug - Update product description:', description);
    
    await updateUserProductDescription(id, description);
    console.log('🔍 API Debug - Product description updated successfully');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('🔍 API Debug - Error updating product description:', error);
    return NextResponse.json(
      { error: 'Failed to update product description' },
      { status: 500 }
    );
  }
}
