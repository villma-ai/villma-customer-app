import { Firestore, DocumentData, QueryDocumentSnapshot, Timestamp } from '@google-cloud/firestore';
import { getClientConfig } from './runtime-config';

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
  shopDomain?: string;
  clientId?: string;
  clientSecret?: string;
  storeUrl?: string;
  consumerKey?: string;
  consumerSecret?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  hasExtraProdData?: boolean;
}

// Helper function to get collection names from configuration
function getCollectionName(collectionKey: 'users' | 'subscriptionPlans' | 'userSubscriptions' | 'webhookEvents' | 'userProducts'): string {
  const config = getClientConfig();
  const collectionName = config.firestore.collections[collectionKey];
  return collectionName;
}

// Utility function to convert Firestore Timestamps to Date objects
function convertTimestamps(data: Record<string, unknown>): Record<string, unknown> {
  if (!data) return data;

  const converted = { ...data };

  // Convert known date fields
  const dateFields = ['createdAt', 'updatedAt', 'startDate', 'endDate', 'dueDate', 'paidAt'];

  dateFields.forEach((field) => {
    if (converted[field] && converted[field] instanceof Timestamp) {
      converted[field] = (converted[field] as Timestamp).toDate();
    }
  });

  return converted;
}

// Helper function to get Firestore instance for server-side operations
function getFirestoreInstance(): Firestore {
  try {
    // Get runtime configuration
    const config = getClientConfig();
    
    // Initialize Google Cloud Firestore
    const firestoreOptions: any = {
      projectId: config.firestore.projectId,
      databaseId: config.firestore.databaseName
    };

    // Initialize Firestore
    const firestore = new Firestore(firestoreOptions);
    console.log('🔗 Connected to Firestore database:', config.firestore.databaseName);
    return firestore;
  } catch (error) {
    console.error('❌ Failed to initialize Firestore:', error);
    throw error;
  }
}

// User Profile Functions
export async function createUserProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>) {
  const dbInstance = getFirestoreInstance();
  const userRef = dbInstance.collection(getCollectionName('users')).doc(profile.uid);
  const now = new Date();

  // Use set with merge: true to handle existing profiles gracefully
  await userRef.set({
    ...profile,
    createdAt: now,
    updatedAt: now
  }, { merge: true });

  console.log('✅ User profile created/updated successfully');
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const dbInstance = getFirestoreInstance();
  const userRef = dbInstance.collection(getCollectionName('users')).doc(uid);
  const userDoc = await userRef.get();

  if (userDoc.exists) {
    const data = userDoc.data();
    return convertTimestamps(data || {}) as unknown as UserProfile;
  }

  return null;
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>) {
  console.log('🔍 Updating user profile for UID:', uid, 'with updates:', updates);
  const dbInstance = getFirestoreInstance();
  const userRef = dbInstance.collection(getCollectionName('users')).doc(uid);
  
  const updateData = {
    ...updates,
    updatedAt: new Date()
  };
  
  console.log('🔍 Updating document with data:', updateData);
  await userRef.update(updateData);
  console.log('✅ User profile updated successfully');
}

// Subscription Plan Functions
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const dbInstance = getFirestoreInstance();
  const plansRef = dbInstance.collection(getCollectionName('subscriptionPlans'));
  const plansSnap = await plansRef.get();

  return plansSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
    id: doc.id,
    ...convertTimestamps(doc.data() || {})
  })) as unknown as SubscriptionPlan[];
}

export async function createUserSubscription(
  subscription: Omit<UserSubscription, 'id' | 'createdAt' | 'updatedAt'>
) {
  const dbInstance = getFirestoreInstance();
  const subscriptionRef = dbInstance.collection(getCollectionName('userSubscriptions'));
  const now = new Date();

  const docRef = await subscriptionRef.add({
    ...subscription,
    createdAt: now,
    updatedAt: now
  });

  console.log('✅ User subscription created with ID:', docRef.id);
  return docRef.id;
}

export async function getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
  const dbInstance = getFirestoreInstance();
  const subscriptionsRef = dbInstance.collection(getCollectionName('userSubscriptions'));
  const q = subscriptionsRef.where('userId', '==', userId);
  const subscriptionsSnap = await q.get();

  return subscriptionsSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
    id: doc.id,
    ...convertTimestamps(doc.data() || {})
  })) as unknown as UserSubscription[];
}

// Get user subscriptions by Stripe customer ID
export async function getUserSubscriptionsByStripeCustomer(
  stripeCustomerId: string
): Promise<UserSubscription[]> {
  const dbInstance = getFirestoreInstance();
  const subscriptionsRef = dbInstance.collection(getCollectionName('userSubscriptions'));
  const q = subscriptionsRef.where('stripeCustomerId', '==', stripeCustomerId);
  const subscriptionsSnap = await q.get();

  return subscriptionsSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
    id: doc.id,
    ...convertTimestamps(doc.data() || {})
  })) as unknown as UserSubscription[];
}

// Get user profile by email
export async function getUserProfileByEmail(email: string): Promise<UserProfile | null> {
  const dbInstance = getFirestoreInstance();
  const usersRef = dbInstance.collection(getCollectionName('users'));
  const q = usersRef.where('email', '==', email);
  const userSnap = await q.get();

  if (!userSnap.empty) {
    const doc = userSnap.docs[0];
    const data = doc.data();
    return convertTimestamps(data || {}) as unknown as UserProfile;
  }
  return null;
}

// Update user subscription settings
export async function updateUserSubscription(
  subscriptionId: string,
  updates: Partial<
    Pick<
      UserSubscription,
      | 'webshopUrl'
      | 'apiToken'
      | 'status'
      | 'endDate'
      | 'updatedAt'
      | 'ecommerceType'
      | 'apiBaseUrl'
      | 'apiKey'
      | 'shopDomain'
      | 'clientId'
      | 'clientSecret'
      | 'storeUrl'
      | 'consumerKey'
      | 'consumerSecret'
      | 'planName'
      | 'planBillingCycle'
      | 'planPrice'
      | 'planDescription'
      | 'hasExtraProdData'
    >
  >
) {
  const dbInstance = getFirestoreInstance();
  const subscriptionRef = dbInstance.collection(getCollectionName('userSubscriptions')).doc(subscriptionId);
  await subscriptionRef.update({
    ...updates,
    updatedAt: new Date()
  });
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

// Webhook event tracking to prevent duplicates
export async function isWebhookEventProcessed(eventId: string): Promise<boolean> {
  const dbInstance = getFirestoreInstance();
  const eventsRef = dbInstance.collection(getCollectionName('webhookEvents'));
  const q = eventsRef.where('eventId', '==', eventId);
  const eventSnap = await q.get();
  return !eventSnap.empty;
}

export async function markWebhookEventProcessed(eventId: string): Promise<void> {
  const dbInstance = getFirestoreInstance();
  const eventsRef = dbInstance.collection(getCollectionName('webhookEvents'));
  await eventsRef.add({
    eventId,
    processedAt: new Date()
  });
}

export async function getUserSubscriptionById(
  subscriptionId: string
): Promise<UserSubscription | null> {
  const dbInstance = getFirestoreInstance();
  const subscriptionRef = dbInstance.collection(getCollectionName('userSubscriptions')).doc(subscriptionId);
  const subscriptionSnap = await subscriptionRef.get();
  if (subscriptionSnap.exists) {
    return {
      id: subscriptionSnap.id,
      ...convertTimestamps(subscriptionSnap.data() || {})
    } as unknown as UserSubscription;
  }
  return null;
}

// User Product Functions
export interface UserProduct {
  id: string;
  title: string;
  userId: string;
  userSubscriptionPlanId: string;
  description: string;
}

export async function addUserProduct(
  product: Pick<UserProduct, 'id' | 'title' | 'userId' | 'userSubscriptionPlanId'> & {
    description?: string;
  }
) {
  const dbInstance = getFirestoreInstance();
  const productsRef = dbInstance.collection(getCollectionName('userProducts'));
  const now = new Date();
  await productsRef.doc(product.id).set({
    id: product.id,
    title: product.title,
    userId: product.userId,
    userSubscriptionPlanId: product.userSubscriptionPlanId,
    description: product.description || '',
    createdAt: now,
    updatedAt: now
  });
}

export async function getUserProducts(userId: string): Promise<UserProduct[]> {
  const dbInstance = getFirestoreInstance();
  const productsRef = dbInstance.collection(getCollectionName('userProducts'));
  const q = productsRef.where('userId', '==', userId);
  const productsSnap = await q.get();
  return productsSnap.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
    id: doc.id,
    ...(doc.data() || {})
  })) as UserProduct[];
}

export async function updateUserProductDescription(productId: string, description: string) {
  const dbInstance = getFirestoreInstance();
  const productRef = dbInstance.collection(getCollectionName('userProducts')).doc(productId);
  await productRef.update({
    description,
    updatedAt: new Date()
  });
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
        subscription.shopDomain &&
        subscription.clientId &&
        subscription.clientSecret
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

// Check if subscription already exists by Stripe subscription ID
export async function getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<UserSubscription | null> {
  const dbInstance = getFirestoreInstance();
  const subscriptionsRef = dbInstance.collection(getCollectionName('userSubscriptions'));
  const q = subscriptionsRef.where('stripeSubscriptionId', '==', stripeSubscriptionId);
  const subscriptionsSnap = await q.get();

  if (!subscriptionsSnap.empty) {
    const doc = subscriptionsSnap.docs[0];
    const subscription = {
      id: doc.id,
      ...convertTimestamps(doc.data() || {})
    } as unknown as UserSubscription;
    
    return subscription;
  }

  return null;
} 