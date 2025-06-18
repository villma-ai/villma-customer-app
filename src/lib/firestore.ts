import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, SubscriptionPlan, UserSubscription } from '@/types/user';

// Utility function to convert Firestore Timestamps to Date objects
function convertTimestamps(data: Record<string, unknown>): Record<string, unknown> {
  if (!data) return data;

  const converted = { ...data };

  // Convert known date fields
  const dateFields = ['createdAt', 'updatedAt', 'startDate', 'endDate', 'dueDate', 'paidAt'];

  dateFields.forEach(field => {
    if (converted[field] && converted[field] instanceof Timestamp) {
      converted[field] = (converted[field] as Timestamp).toDate();
    }
  });

  return converted;
}

// User Profile Functions
export async function createUserProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>) {
  const userRef = doc(db, 'users', profile.uid);
  const now = new Date();

  await setDoc(userRef, {
    ...profile,
    createdAt: now,
    updatedAt: now
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    return convertTimestamps(data) as unknown as UserProfile;
  }
  return null;
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date()
  });
}

// Subscription Plan Functions
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const plansRef = collection(db, 'subscriptionPlans');
  const plansSnap = await getDocs(plansRef);

  return plansSnap.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps(doc.data())
  })) as unknown as SubscriptionPlan[];
}

export async function createUserSubscription(subscription: Omit<UserSubscription, 'id' | 'createdAt' | 'updatedAt'>) {
  const subscriptionRef = collection(db, 'userSubscriptions');
  const now = new Date();

  const docRef = await addDoc(subscriptionRef, {
    ...subscription,
    createdAt: now,
    updatedAt: now
  });

  return docRef.id;
}

export async function getUserSubscriptions(userId: string): Promise<UserSubscription[]> {
  const subscriptionsRef = collection(db, 'userSubscriptions');
  const q = query(subscriptionsRef, where('userId', '==', userId));
  const subscriptionsSnap = await getDocs(q);

  return subscriptionsSnap.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps(doc.data())
  })) as unknown as UserSubscription[];
}

// Get user subscriptions by Stripe customer ID
export async function getUserSubscriptionsByStripeCustomer(stripeCustomerId: string): Promise<UserSubscription[]> {
  const subscriptionsRef = collection(db, 'userSubscriptions');
  const q = query(subscriptionsRef, where('stripeCustomerId', '==', stripeCustomerId));
  const subscriptionsSnap = await getDocs(q);

  return subscriptionsSnap.docs.map(doc => ({
    id: doc.id,
    ...convertTimestamps(doc.data())
  })) as unknown as UserSubscription[];
}

// Get user profile by email
export async function getUserProfileByEmail(email: string): Promise<UserProfile | null> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('email', '==', email));
  const userSnap = await getDocs(q);

  if (!userSnap.empty) {
    const doc = userSnap.docs[0];
    const data = doc.data();
    return convertTimestamps(data) as unknown as UserProfile;
  }
  return null;
}

// Update user subscription settings
export async function updateUserSubscription(
  subscriptionId: string,
  updates: Partial<Pick<UserSubscription, 'webshopUrl' | 'apiToken' | 'status' | 'endDate' | 'updatedAt'>>
) {
  const subscriptionRef = doc(db, 'userSubscriptions', subscriptionId);
  await updateDoc(subscriptionRef, {
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
  const eventsRef = collection(db, 'webhookEvents');
  const q = query(eventsRef, where('eventId', '==', eventId));
  const eventSnap = await getDocs(q);
  return !eventSnap.empty;
}

export async function markWebhookEventProcessed(eventId: string): Promise<void> {
  const eventsRef = collection(db, 'webhookEvents');
  await addDoc(eventsRef, {
    eventId,
    processedAt: new Date(),
  });
} 