import { NextRequest, NextResponse } from 'next/server';
import { getUserProducts, addUserProduct } from '@/lib/firestore-server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  console.log('🔍 API Debug - GET /api/user-products:', { userId });
  
  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }
  
  try {
    const products = await getUserProducts(userId);
    console.log('🔍 API Debug - User products result:', products);
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('🔍 API Debug - Error fetching user products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 API Debug - POST /api/user-products');
  
  try {
    const product = await request.json();
    console.log('🔍 API Debug - Adding user product:', product);
    
    await addUserProduct(product);
    console.log('🔍 API Debug - User product added successfully');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('🔍 API Debug - Error adding user product:', error);
    return NextResponse.json(
      { error: 'Failed to add user product' },
      { status: 500 }
    );
  }
}
