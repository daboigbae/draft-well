import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
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

// User subscription management
export async function createUserSubscription(
  userId: string, 
  planType: PlanType = 'free'
): Promise<UserSubscription> {
  const subscription: UserSubscription = {
    planType,
    status: 'active',
    reportTokens: 2, // Give all new users 2 report tokens
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(doc(db, 'subscriptions', userId), {
    ...subscription,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return subscription;
}

export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  try {
    const subscriptionDoc = await getDoc(doc(db, 'subscriptions', userId));
    
    if (!subscriptionDoc.exists()) {
      // Create default free subscription for new users
      return await createUserSubscription(userId);
    }

    const data = subscriptionDoc.data();
    
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

export async function updateUserSubscription(
  userId: string, 
  updates: Partial<UserSubscription>
): Promise<void> {
  await updateDoc(doc(db, 'subscriptions', userId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

// Fix missing reportTokens for existing subscriptions
export async function fixMissingReportTokens(userId: string): Promise<void> {
  const subscription = await getUserSubscription(userId);
  
  if (subscription && subscription.reportTokens === undefined) {
    console.log('Adding missing reportTokens to subscription');
    
    let reportTokens = 2; // Default for free
    if (subscription.planType === 'starter') {
      reportTokens = 20;
    } else if (subscription.planType === 'pro') {
      reportTokens = 999999; // Unlimited
    }
    
    await updateUserSubscription(userId, { reportTokens });
    console.log(`Added reportTokens: ${reportTokens} to subscription`);
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

export async function incrementUsage(userId: string, planType: PlanType): Promise<UsageRecord> {
  const monthKey = getCurrentMonthKey();
  const usageId = `${userId}_${monthKey}`;
  const usageRef = doc(db, 'usage', usageId);
  
  const existingUsage = await getDoc(usageRef);
  
  if (existingUsage.exists()) {
    const currentCount = existingUsage.data().ratingsUsed || 0;
    const newUsage = {
      ratingsUsed: currentCount + 1,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(usageRef, newUsage);
    
    return {
      userId,
      month: monthKey,
      planType,
      ratingsUsed: currentCount + 1,
      createdAt: existingUsage.data().createdAt?.toDate() || new Date(),
      updatedAt: new Date(),
    };
  } else {
    const newUsage: Omit<UsageRecord, 'createdAt' | 'updatedAt'> = {
      userId,
      month: monthKey,
      planType,
      ratingsUsed: 1,
    };
    
    await setDoc(usageRef, {
      ...newUsage,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    return {
      ...newUsage,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

export async function canUserUseAiRating(userId: string): Promise<{ canUse: boolean; reason?: string; current?: number; limit?: number | 'unlimited' }> {
  const subscription = await getUserSubscription(userId);
  if (!subscription) {
    return { canUse: false, reason: 'No subscription found' };
  }

  const plan = getPlanById(subscription.planType);
  const usage = await getCurrentUsage(userId);
  const currentUsage = usage?.ratingsUsed || 0;

  // Use reportTokens from subscription if available, otherwise fall back to plan limit
  const limit = subscription.reportTokens ?? plan.features.aiRatingsPerMonth;

  if (limit === 'unlimited') {
    return { canUse: true, current: currentUsage, limit: 'unlimited' };
  }

  const canUse = currentUsage < (limit as number);
  return {
    canUse,
    reason: canUse ? undefined : 'Token limit exceeded',
    current: currentUsage,
    limit: limit as number,
  };
}

// Subscription status helpers
export function isSubscriptionActive(subscription: UserSubscription): boolean {
  return subscription.status === 'active';
}

export function isPaidPlan(planType: PlanType): boolean {
  return planType === 'starter' || planType === 'pro';
}