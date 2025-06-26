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

interface ProductSearchProps {
  subscriptionId: string;
}

interface SubscriptionDetails {
  ecommerceType: string;
  shopDomain?: string;
  adminApiToken?: string;
  // Add other fields for other platforms as needed
}

export default function ProductSearch({ subscriptionId }: ProductSearchProps) {
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(null);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [addedProducts, setAddedProducts] = useState<UserProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<UserProduct | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch subscription details from Firestore
  useEffect(() => {
    async function fetchSubscription() {
      try {
        const sub = await getUserSubscriptionById(subscriptionId);
        if (sub) {
          setSubscription({
            ecommerceType: sub.ecommerceType || '',
            shopDomain: sub.shopDomain || '',
            adminApiToken: sub.adminApiToken || ''
          });
        } else {
          setSubscription(null);
        }
      } catch {
        setError('Failed to fetch subscription details');
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
        setError('Failed to fetch added products');
      }
    }
    fetchProducts();
  }, [currentUser, subscriptionId]);

  // Use the custom hook for Shopify product search
  const shopDomain = subscription?.ecommerceType === 'shopify' ? subscription.shopDomain || '' : '';
  const adminApiToken =
    subscription?.ecommerceType === 'shopify' ? subscription.adminApiToken || '' : '';
  const {
    products,
    loading,
    error: shopifyError
  } = useShopifyProducts(shopDomain, adminApiToken, search);

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
      setError('Failed to add product');
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
      setError('Failed to update description');
    } finally {
      setSaving(false);
    }
  };

  if (!subscription) {
    return <div className="text-gray-500">Loading subscription details...</div>;
  }

  if (subscription.ecommerceType !== 'shopify') {
    return (
      <div className="text-gray-500">
        Product search is only available for Shopify subscriptions.
      </div>
    );
  }

  return (
    <div>
      <ProductSearchInput
        search={search}
        setSearch={setSearch}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        loading={loading}
        error={error}
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
