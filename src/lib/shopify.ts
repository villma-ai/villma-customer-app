export async function fetchShopifyProducts(
  shopDomain: string,
  adminApiToken: string,
  search: string
): Promise<Array<{ id: string; title: string }>> {
  const response = await fetch('/api/shopify/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shopDomain, adminApiToken, search })
  });
  if (!response.ok) {
    throw new Error('Failed to fetch products from Shopify');
  }
  const data = await response.json();
  return data.products || [];
}
