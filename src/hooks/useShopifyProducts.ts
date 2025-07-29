import { useState, useEffect } from 'react';
import { fetchShopifyProducts } from '@/lib/shopify';

export function useShopifyProducts(
  shopDomain: string,
  clientId: string,
  clientSecret: string,
  search: string
) {
  const [products, setProducts] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shopDomain || !clientId || !clientSecret || !search) {
      setProducts([]);
      return;
    }

    setLoading(true);
    setError(null);

    fetchShopifyProducts(shopDomain, clientId, clientSecret, search)
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [shopDomain, clientId, clientSecret, search]);

  return { products, loading, error };
}
