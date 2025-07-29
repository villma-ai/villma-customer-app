// Token cache interface
interface ShopifyTokenCache {
  accessToken: string;
  expiresAt: number; // Unix timestamp
}

// In-memory cache for Shopify tokens (in production, consider using Redis or similar)
const tokenCache = new Map<string, ShopifyTokenCache>();

// Function to fetch/refresh Shopify access token with caching
export async function fetchShopifyAccessToken(
  storeDomain: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const cacheKey = `${storeDomain}-${clientId}`;
  const now = Date.now();

  // Check if we have a valid cached token
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > now + 60000) {
    // 1 minute buffer
    return cached.accessToken;
  }

  try {
    const baseUrl = `https://${storeDomain}/admin`;
    const tokenUrl = `${baseUrl}/oauth/access_token`;

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch access token: ${errorText}`);
    }

    const tokenData = await response.json();
    const accessToken = tokenData.access_token;

    // Cache the token with expiration (Shopify tokens typically expire in 1 hour)
    // If the response doesn't include expires_in, we'll assume 1 hour
    const expiresIn = tokenData.expires_in || 3600; // Default to 1 hour
    const expiresAt = now + expiresIn * 1000;

    tokenCache.set(cacheKey, {
      accessToken,
      expiresAt
    });

    return accessToken;
  } catch (error) {
    console.error('Error fetching Shopify access token:', error);
    throw new Error('Failed to fetch Shopify access token');
  }
}

// Function to clear expired tokens from cache
export function clearExpiredTokens(): void {
  const now = Date.now();
  for (const [key, token] of tokenCache.entries()) {
    if (token.expiresAt <= now) {
      tokenCache.delete(key);
    }
  }
}

// Updated function to fetch products with automatic token refresh
export async function fetchShopifyProducts(
  shopDomain: string,
  clientId: string,
  clientSecret: string,
  search: string
): Promise<Array<{ id: string; title: string }>> {
  try {
    // Clear expired tokens first
    clearExpiredTokens();

    // Get a fresh access token (will use cached if valid)
    const accessToken = await fetchShopifyAccessToken(shopDomain, clientId, clientSecret);

    const response = await fetch('/api/shopify/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopDomain,
        accessToken: accessToken, // Use the fresh token
        search
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products from Shopify');
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    throw error;
  }
}
