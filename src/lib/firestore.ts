import { getClientConfig } from './runtime-config';

// Note: This file now only contains type definitions and utility functions
// The actual Firestore operations are handled by the server-side firestore-server.ts

// Local type definitions (replace with proper types when @villma/villma-ts-shared is available)
export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  address: {
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
  stripePriceId: string;
  hasExtraProdData?: boolean;
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  planBillingCycle: 'monthly' | 'yearly';
  planPrice: number;
  planDescription: string;
  status: 'active' | 'cancelled' | 'pending' | 'expired';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  webshopUrl?: string;
  apiToken?: string;
  ecommerceType?: 'shopify' | 'woocommerce' | 'prestashop' | 'custom';
  apiBaseUrl?: string;
  apiKey?: string;
  shopifyClientId?: string;
  shopifyClientSecret?: string;
  storeUrl?: string;
  consumerKey?: string;
  consumerSecret?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  hasExtraProdData?: boolean;
}

// User Product Functions
export interface UserProduct {
  id: string;
  title: string;
  userId: string;
  userSubscriptionPlanId: string;
  description: string;
}

// Helper function to get collection names from configuration
function getCollectionName(collectionKey: 'users' | 'subscriptionPlans' | 'userSubscriptions' | 'webhookEvents' | 'userProducts'): string {
  const config = getClientConfig();
  return config.firestore.collections[collectionKey];
}

// Utility: Check if a user profile is complete
export function isUserProfileComplete(profile: UserProfile | null): boolean {
  if (!profile) return false;
  return Boolean(
    profile.firstName &&
    profile.lastName &&
    profile.address &&
    profile.address.street &&
    profile.address.city &&
    profile.address.postalCode &&
    profile.address.country
  );
}

// Utility: Check if a subscription's settings are complete
export function isSubscriptionSettingsComplete(subscription: UserSubscription): boolean {
  if (!subscription) return false;
  if (!subscription.ecommerceType) return false;
  switch (subscription.ecommerceType) {
    case 'custom':
      return Boolean(
        subscription.webshopUrl &&
        subscription.apiToken &&
        subscription.apiBaseUrl &&
        subscription.apiKey
      );
    case 'shopify':
      return Boolean(
        subscription.webshopUrl &&
        subscription.apiToken &&
        subscription.shopifyClientId &&
        subscription.shopifyClientSecret
      );
    case 'woocommerce':
      return Boolean(
        subscription.webshopUrl &&
        subscription.apiToken &&
        subscription.storeUrl &&
        subscription.consumerKey &&
        subscription.consumerSecret
      );
    case 'prestashop':
      return Boolean(
        subscription.webshopUrl &&
        subscription.apiToken &&
        subscription.storeUrl &&
        subscription.apiKey
      );
    default:
      return false;
  }
}

// Generate a random API token
export function generateApiToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Client-side API functions that call server endpoints
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`/api/users/${uid}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function createUserProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<void> {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!response.ok) throw new Error('Failed to create user profile');
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    const response = await fetch(`/api/users/${uid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update user profile');
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const response = await fetch('/api/subscription-plans');
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return [];
  }
}

export async function getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
  try {
    const response = await fetch(`/api/user-subscriptions?userId=${userId}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    return [];
  }
}

export async function createUserSubscription(
  subscription: Omit<UserSubscription, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const response = await fetch('/api/user-subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });
    if (!response.ok) throw new Error('Failed to create user subscription');
    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Error creating user subscription:', error);
    throw error;
  }
}

export async function updateUserSubscription(
  subscriptionId: string,
  updates: Partial<UserSubscription>
): Promise<void> {
  try {
    const response = await fetch(`/api/user-subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update user subscription');
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}

export async function getUserProfileByEmail(email: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(`/api/users/by-email?email=${encodeURIComponent(email)}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile by email:', error);
    return null;
  }
}

export async function getUserSubscriptionsByStripeCustomer(
  stripeCustomerId: string
): Promise<UserSubscription[]> {
  try {
    const response = await fetch(`/api/user-subscriptions/by-stripe-customer?customerId=${stripeCustomerId}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching user subscriptions by Stripe customer:', error);
    return [];
  }
}

export async function isWebhookEventProcessed(eventId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/webhook-events/processed?eventId=${eventId}`);
    if (!response.ok) return false;
    const result = await response.json();
    return result.processed;
  } catch (error) {
    console.error('Error checking webhook event:', error);
    return false;
  }
}

export async function markWebhookEventProcessed(eventId: string): Promise<void> {
  try {
    const response = await fetch('/api/webhook-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    });
    if (!response.ok) throw new Error('Failed to mark webhook event as processed');
  } catch (error) {
    console.error('Error marking webhook event as processed:', error);
    throw error;
  }
}

export async function getUserSubscriptionById(
  subscriptionId: string
): Promise<UserSubscription | null> {
  try {
    const response = await fetch(`/api/user-subscriptions/${subscriptionId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching user subscription by ID:', error);
    return null;
  }
}

export async function addUserProduct(
  product: Pick<UserProduct, 'id' | 'title' | 'userId' | 'userSubscriptionPlanId'> & {
    description?: string;
  }
): Promise<void> {
  try {
    const response = await fetch('/api/user-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    if (!response.ok) throw new Error('Failed to add user product');
  } catch (error) {
    console.error('Error adding user product:', error);
    throw error;
  }
}

export async function getUserProducts(userId: string): Promise<UserProduct[]> {
  try {
    const response = await fetch(`/api/user-products?userId=${userId}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching user products:', error);
    return [];
  }
}

export async function updateUserProductDescription(productId: string, description: string): Promise<void> {
  try {
    const response = await fetch(`/api/user-products/${productId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }),
    });
    if (!response.ok) throw new Error('Failed to update user product description');
  } catch (error) {
    console.error('Error updating user product description:', error);
    throw error;
  }
}
