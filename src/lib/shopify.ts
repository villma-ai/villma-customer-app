// Token cache interface
interface ShopifyTokenCache {
  accessToken: string;
  expiresAt: number; // Unix timestamp
}

// In-memory cache for Shopify tokens (in production, consider using Redis or similar)
const tokenCache = new Map<string, ShopifyTokenCache>();

// Function to fetch/refresh Shopify access token with caching
export async function fetchShopifyAccessToken(
  webshopUrl: string,
  shopifyClientId: string,
  shopifyClientSecret: string
): Promise<string> {
  const cacheKey = `${webshopUrl}-${shopifyClientId}`;
  const now = Date.now();

  // Check if we have a valid cached token
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > now + 60000) {
    return cached.accessToken;
  }

  try {
    const response = await fetch('/api/shopify/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        storeDomain: webshopUrl,
        clientId: shopifyClientId,
        clientSecret: shopifyClientSecret
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch access token');
    }

    const tokenData = await response.json();
    const accessToken = tokenData.accessToken;

    if (!accessToken) {
      throw new Error('No access token received from Shopify');
    }

    const expiresIn = 3600;
    const expiresAt = now + expiresIn * 1000;

    tokenCache.set(cacheKey, {
      accessToken,
      expiresAt
    });

    return accessToken;
  } catch (error) {
    console.error('❌ Error fetching Shopify access token:', error);
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
  webshopUrl: string,
  shopifyClientId: string,
  shopifyClientSecret: string,
  search: string
): Promise<Array<{ id: string; title: string; }>> {
  try {
    // Clear expired tokens first
    clearExpiredTokens();

    // Get a fresh access token (will use cached if valid)
    const accessToken = await fetchShopifyAccessToken(webshopUrl, shopifyClientId, shopifyClientSecret);

    const response = await fetch('/api/shopify/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shopDomain: webshopUrl,
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
