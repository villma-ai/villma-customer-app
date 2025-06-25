import { useState, useEffect } from 'react';
import { fetchShopifyProducts } from '@/lib/shopify';

export function useShopifyProducts(shopDomain: string, adminApiToken: string, search: string) {
  const [products, setProducts] = useState<Array<{ id: string; title: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shopDomain || !adminApiToken || !search) {
      setProducts([]);
      return;
    }
    setLoading(true);
    setError(null);
    fetchShopifyProducts(shopDomain, adminApiToken, search)
      .then((products) => setProducts(products))
      .catch(() => setError('Failed to fetch products'))
      .finally(() => setLoading(false));
  }, [shopDomain, adminApiToken, search]);

  return { products, loading, error };
}
