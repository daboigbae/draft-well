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
    console.log('Getting subscription for userId:', userId);
    
    // Try the original structure first: subscriptions/{userId}
    const subscriptionDoc = await getDoc(doc(db, 'subscriptions', userId));
    
    if (!subscriptionDoc.exists()) {
      console.log('No subscription found at subscriptions/' + userId);
      return null;
    }

    const data = subscriptionDoc.data();
    console.log('Found subscription data:', data);
    
    const subscription = {
      ...data,
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
  const reportTokens = subscription.reportTokens ?? plan.features.aiRatingsPerMonth;

  // Check if unlimited (999999 or 'unlimited')
  if (reportTokens === 999999 || reportTokens === 'unlimited') {
    return { canUse: true, current: 999999, limit: 'unlimited' };
  }

  // Check if user has tokens remaining
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
  console.log('Setting up subscription listener for userId:', userId);
  
  const subscriptionDoc = doc(db, 'subscriptions', userId);
  
  return onSnapshot(subscriptionDoc, (docSnapshot) => {
    if (!docSnapshot.exists()) {
      console.log('No subscription document found for:', userId);
      callback(null);
      return;
    }

    console.log('Subscription data updated:', docSnapshot.data());
    const data = docSnapshot.data();
    const subscription = {
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
      currentPeriodStart: data.currentPeriodStart?.toDate ? data.currentPeriodStart.toDate() : (data.currentPeriodStart ? new Date(data.currentPeriodStart) : undefined),
      currentPeriodEnd: data.currentPeriodEnd?.toDate ? data.currentPeriodEnd.toDate() : (data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : undefined),
    } as UserSubscription;
    
    callback(subscription);
  });
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