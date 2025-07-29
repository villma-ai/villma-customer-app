'use client';
import { useState, useEffect } from 'react';
import {
  getUserSubscriptionById,
  getUserProducts,
  updateUserProductDescription,
  UserProduct,
  addUserProduct
} from '@/lib/firestore';
import { useShopifyProducts } from '@/hooks/useShopifyProducts';
import { useAuth } from '@/contexts/AuthContext';
import ProductSearchInput from './ProductSearchInput';
import EnhancedProductList from './EnhancedProductList';
import EditProductModal from './EditProductModal';

interface ProductSearchShopifyProps {
  subscriptionId: string;
}

interface SubscriptionDetails {
  ecommerceType: string;
  shopDomain?: string;
  clientId?: string;
  clientSecret?: string;
}

export default function ProductSearchShopify({ subscriptionId }: ProductSearchShopifyProps) {
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [addedProducts, setAddedProducts] = useState<UserProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<UserProduct | null>(null);
  const [saving, setSaving] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch subscription details from Firestore
  useEffect(() => {
    async function fetchSubscription() {
      try {
        const sub = await getUserSubscriptionById(subscriptionId);
        if (sub) {
          setSubscription({
            ecommerceType: sub.ecommerceType || '',
            shopDomain: sub.shopDomain || '',
            clientId: sub.clientId || '',
            clientSecret: sub.clientSecret || ''
          });
        } else {
          setSubscription(null);
        }
      } catch {
        setSubscription(null);
      }
    }
    fetchSubscription();
  }, [subscriptionId]);

  // Fetch added products for this user/subscription
  useEffect(() => {
    if (!currentUser || !subscriptionId) return;
    async function fetchProducts() {
      try {
        const products = await getUserProducts(currentUser!.uid);
        setAddedProducts(products.filter((p) => p.userSubscriptionPlanId === subscriptionId));
      } catch {
        // Handle error silently
      }
    }
    fetchProducts();
  }, [currentUser, subscriptionId]);

  // Use the custom hook for Shopify product search
  const shopDomain = subscription?.shopDomain || '';
  const clientId = subscription?.clientId || '';
  const clientSecret = subscription?.clientSecret || '';

  const {
    products,
    loading,
    error: shopifyError
  } = useShopifyProducts(shopDomain, clientId, clientSecret, search);

  const handleAddProduct = async (product: { id: string; title: string }) => {
    if (!currentUser) return;
    setSaving(true);
    try {
      const firestoreId = product.id.includes('/') ? product.id.split('/').pop() : product.id;
      await addUserProduct({
        id: firestoreId!,
        title: product.title,
        userId: currentUser.uid,
        userSubscriptionPlanId: subscriptionId,
        description: ''
      });
      // Refresh added products
      if (currentUser) {
        const products = await getUserProducts(currentUser.uid);
        setAddedProducts(products.filter((p) => p.userSubscriptionPlanId === subscriptionId));
      }
      setDropdownOpen(false);
    } catch (err) {
      console.error('Failed to add product:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleProductClick = (product: UserProduct) => {
    setSelectedProduct(product);
  };

  const handleSaveDescription = async (description: string) => {
    if (!selectedProduct) return;
    setSaving(true);
    try {
      await updateUserProductDescription(selectedProduct.id, description);
      // Refresh added products
      if (currentUser) {
        const products = await getUserProducts(currentUser.uid);
        setAddedProducts(products.filter((p) => p.userSubscriptionPlanId === subscriptionId));
      }
      setSelectedProduct(null);
    } catch {
      // Handle error silently
    } finally {
      setSaving(false);
    }
  };

  if (!subscription) {
    return <div className="text-gray-500">Loading subscription details...</div>;
  }

  if (subscription.ecommerceType !== 'shopify') {
    return <div className="text-gray-500">This component is only for Shopify subscriptions.</div>;
  }

  return (
    <div>
      <ProductSearchInput
        search={search}
        setSearch={setSearch}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        loading={loading}
        error={shopifyError}
        shopifyError={shopifyError}
        products={products}
        handleAddProduct={handleAddProduct}
        saving={saving}
      />

      <EnhancedProductList products={addedProducts} onProductClick={handleProductClick} />

      {selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onSave={handleSaveDescription}
          saving={saving}
        />
      )}
    </div>
  );
}
