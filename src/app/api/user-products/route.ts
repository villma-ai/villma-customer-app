import { NextRequest, NextResponse } from 'next/server';
import { getUserProducts, addUserProduct } from '@/lib/firestore-server';
import logger from '@/lib/logger';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  logger.debug('GET /api/user-products', { userId });
  
  if (!userId) {
    logger.warn('Missing userId parameter');
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }
  
  try {
    const products = await getUserProducts(userId);
    logger.debug('User products retrieved successfully', { 
      userId, 
      productCount: products.length 
    });
    
    return NextResponse.json(products);
  } catch (error) {
    logger.error('Error fetching user products', { 
      userId, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return NextResponse.json(
      { error: 'Failed to fetch user products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  logger.debug('POST /api/user-products');
  
  try {
    const product = await request.json();
    logger.debug('Adding user product', { 
      productId: product.id,
      userId: product.userId 
    });
    
    await addUserProduct(product);
    logger.debug('User product added successfully', { 
      productId: product.id 
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error adding user product', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return NextResponse.json(
      { error: 'Failed to add user product' },
      { status: 500 }
    );
  }
}
