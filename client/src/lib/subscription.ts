// COMMENTED OUT: Paid feature - Subscription management system
// This file will be uncommented when implementing paid features

/*
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


// All subscription code commented out...
// Original getUserSubscription implementation
// [Full implementation will be restored when implementing paid features]
*/



// Usage tracking
// getCurrentUsage implementation
// [Full implementation will be restored when implementing paid features]



// canUserUseAiRating implementation
// [Full implementation will be restored when implementing paid features]

// Subscription status helpers
// [Helper functions will be restored when implementing paid features]

// Real-time subscription listener
// [Full implementation will be restored when implementing paid features]

// Real-time usage listener
// [Full implementation will be restored when implementing paid features]
*/

// Placeholder functions for free users
export async function getUserSubscription(userId: string): Promise<null> {
  return null;
}

export async function getCurrentUsage(userId: string): Promise<null> {
  return null;
}

export async function canUserUseAiRating(userId: string): Promise<{ canUse: boolean; reason?: string; current?: number; limit?: number | 'unlimited' }> {
  return { canUse: false, reason: 'AI rating not available in free version' };
}

export function subscribeToUserSubscription(userId: string, callback: any): () => void {
  // No-op for free users
  return () => {};
}

export function subscribeToUserUsage(userId: string, callback: any): () => void {
  // No-op for free users  
  return () => {};
}

export function isSubscriptionActive(subscription: any): boolean {
  return false;
}

export function isPaidPlan(planType: any): boolean {
  return false;
}