export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  vatNumber?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: 'BASE' | 'EXTRA';
  billingCycle: 'monthly' | 'yearly';
  price: number;
  features: string[];
  description: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  planBillingCycle: 'monthly' | 'yearly';
  planPrice: number;
  planDescription: string;
  status: 'active' | 'cancelled' | 'expired' | 'pending';
  startDate: Date;
  endDate: Date;
  webshopUrl?: string;
  apiToken?: string;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  ecommerceType?: 'custom' | 'shopify' | 'woocommerce' | 'prestashop';
  apiBaseUrl?: string;
  apiKey?: string;
  shopDomain?: string;
  adminApiToken?: string;
  storeUrl?: string;
  consumerKey?: string;
  consumerSecret?: string;
  createdAt: Date;
  updatedAt: Date;
} 