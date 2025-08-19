import { useState, useEffect } from 'react';
import { fetchShopifyProducts } from '@/lib/shopify';

export function useShopifyProducts(
  webshopUrl: string,
  shopifyClientId: string,
  shopifyClientSecret: string,
  search: string
) {
  const [products, setProducts] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!webshopUrl || !shopifyClientId || !shopifyClientSecret || !search) {
      setProducts([]);
      return;
    }

    setLoading(true);
    setError(null);

    fetchShopifyProducts(webshopUrl, shopifyClientId, shopifyClientSecret, search)
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [webshopUrl, shopifyClientId, shopifyClientSecret, search]);

  return { products, loading, error };
}
