import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  UserSubscription, 
  UsageRecord, 
  PlanType, 
  getCurrentMonthKey,
  getPlanById,
  canUseAiRating 
} from '../types/subscription';


export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    // First, get the user's stripeCustomerId from users collection
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return null;
    }

    const stripeCustomerId = userDoc.data()?.stripeCustomerId;
    if (!stripeCustomerId) {
      return null;
    }

    // Then, get subscription data using stripeCustomerId
    const subscriptionDoc = await getDoc(doc(db, 'subscriptions', stripeCustomerId));
    
    if (!subscriptionDoc.exists()) {
      return null;
    }

    const data = subscriptionDoc.data();
    
    const subscription = {
      ...data,
      stripeCustomerId, // Ensure this is included
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
      currentPeriodStart: data.currentPeriodStart?.toDate ? data.currentPeriodStart.toDate() : (data.currentPeriodStart ? new Date(data.currentPeriodStart) : undefined),
      currentPeriodEnd: data.currentPeriodEnd?.toDate ? data.currentPeriodEnd.toDate() : (data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : undefined),
    } as UserSubscription;
    
    return subscription;
  } catch (error) {
    console.error('Error in getUserSubscription:', error);
    throw error;
  }
}



// Usage tracking
export async function getCurrentUsage(userId: string): Promise<UsageRecord | null> {
  const monthKey = getCurrentMonthKey();
  const usageDoc = await getDoc(doc(db, 'usage', `${userId}_${monthKey}`));
  
  if (!usageDoc.exists()) {
    return null;
  }

  const data = usageDoc.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as UsageRecord;
}



export async function canUserUseAiRating(userId: string): Promise<{ canUse: boolean; reason?: string; current?: number; limit?: number | 'unlimited' }> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return { canUse: false, reason: 'No subscription found' };
  }

  const plan = getPlanById(subscription.planType);
  
  // Pro users always have unlimited access regardless of reportTokens value
  if (plan.features.aiRatingsPerMonth === 'unlimited') {
    return { canUse: true, current: 999999, limit: 'unlimited' };
  }

  // For non-unlimited plans, check reportTokens
  const reportTokens = subscription.reportTokens ?? plan.features.aiRatingsPerMonth;
  const canUse = (reportTokens as number) > 0;
  
  return {
    canUse,
    reason: canUse ? undefined : 'No tokens remaining',
    current: reportTokens as number,
    limit: plan.features.aiRatingsPerMonth as number,
  };
}

// Subscription status helpers
export function isSubscriptionActive(subscription: UserSubscription): boolean {
  return subscription.status === 'active';
}

export function isPaidPlan(planType: PlanType): boolean {
  return planType === 'starter' || planType === 'pro';
}

// Real-time subscription listener
export function subscribeToUserSubscription(
  userId: string, 
  callback: (subscription: UserSubscription | null) => void
): (() => void) {
  // First, get the user's stripeCustomerId
  let userUnsubscribe: (() => void) | null = null;
  let subscriptionUnsubscribe: (() => void) | null = null;

  const userDoc = doc(db, 'users', userId);
  
  userUnsubscribe = onSnapshot(userDoc, (userSnapshot) => {
    if (!userSnapshot.exists()) {
      callback(null);
      return;
    }

    const stripeCustomerId = userSnapshot.data()?.stripeCustomerId;
    if (!stripeCustomerId) {
      callback(null);
      return;
    }

    // Clean up previous subscription listener if it exists
    if (subscriptionUnsubscribe) {
      subscriptionUnsubscribe();
    }

    // Set up subscription listener using stripeCustomerId
    const subscriptionDoc = doc(db, 'subscriptions', stripeCustomerId);
    
    subscriptionUnsubscribe = onSnapshot(subscriptionDoc, (docSnapshot) => {
      if (!docSnapshot.exists()) {
        callback(null);
        return;
      }

      const data = docSnapshot.data();
      const subscription = {
        ...data,
        stripeCustomerId, // Ensure this is included
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
        currentPeriodStart: data.currentPeriodStart?.toDate ? data.currentPeriodStart.toDate() : (data.currentPeriodStart ? new Date(data.currentPeriodStart) : undefined),
        currentPeriodEnd: data.currentPeriodEnd?.toDate ? data.currentPeriodEnd.toDate() : (data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : undefined),
      } as UserSubscription;
      
      callback(subscription);
    });
  });

  // Return cleanup function that unsubscribes both listeners
  return () => {
    if (userUnsubscribe) userUnsubscribe();
    if (subscriptionUnsubscribe) subscriptionUnsubscribe();
  };
}

// Real-time usage listener
export function subscribeToUserUsage(
  userId: string, 
  callback: (usage: UsageRecord | null) => void
): (() => void) {
  const monthKey = getCurrentMonthKey();
  const usageDoc = doc(db, 'usage', `${userId}_${monthKey}`);
  
  return onSnapshot(usageDoc, (docSnapshot) => {
    if (!docSnapshot.exists()) {
      callback(null);
      return;
    }

    const data = docSnapshot.data();
    const usage = {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as UsageRecord;
    
    callback(usage);
  });
}