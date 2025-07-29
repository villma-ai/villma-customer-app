import { NextRequest, NextResponse } from 'next/server';

interface ShopifyTokenCache {
  accessToken: string;
  expiresAt: number;
}

const tokenCache = new Map<string, ShopifyTokenCache>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeDomain, clientId, clientSecret } = body;

    if (!storeDomain || !clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let cleanDomain = storeDomain.replace(/^https?:\/\//, '');

    if (cleanDomain.includes('/admin/api/')) {
      cleanDomain = cleanDomain.split('/admin/api/')[0];
    }

    const cacheKey = `${cleanDomain}-${clientId}`;
    const now = Date.now();

    const cached = tokenCache.get(cacheKey);
    if (cached && cached.expiresAt > now + 60000) {
      return NextResponse.json({ accessToken: cached.accessToken });
    }

    const baseUrl = `https://${cleanDomain}/admin`;
    const tokenUrl = `${baseUrl}/oauth/access_token`;

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      }).toString()
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to fetch access token: ${errorText}` },
        { status: response.status }
      );
    }

    const tokenData = await response.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token received from Shopify' },
        { status: 400 }
      );
    }

    const expiresIn = 3600;
    const expiresAt = now + expiresIn * 1000;

    tokenCache.set(cacheKey, {
      accessToken,
      expiresAt
    });

    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Error in Shopify token endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 