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
    console.log('Getting subscription for user:', userId);
    const subscriptionDoc = await getDoc(doc(db, 'subscriptions', userId));
    console.log('Subscription doc exists:', subscriptionDoc.exists());
    
    if (!subscriptionDoc.exists()) {
      console.log('Creating default free subscription for new user');
      // Create default free subscription for new users
      return await createUserSubscription(userId);
    }

    const data = subscriptionDoc.data();
    console.log('Raw subscription data:', data);
    
    const subscription = {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      currentPeriodStart: data.currentPeriodStart?.toDate(),
      currentPeriodEnd: data.currentPeriodEnd?.toDate(),
    } as UserSubscription;
    
    console.log('Processed subscription:', subscription);
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

  if (plan.features.aiRatingsPerMonth === 'unlimited') {
    return { canUse: true, current: currentUsage, limit: 'unlimited' };
  }

  const canUse = canUseAiRating(plan, currentUsage);
  return {
    canUse,
    reason: canUse ? undefined : 'Monthly quota exceeded',
    current: currentUsage,
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