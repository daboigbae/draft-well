export type PlanType = 'free' | 'starter' | 'pro';

export interface Plan {
  id: PlanType;
  name: string;
  price: number;
  stripePriceId?: string;
  features: {
    aiRatingsPerMonth: number | 'unlimited';
    postReminders: boolean;
    advancedAiFeedback: boolean;
    csvExport: boolean;
  };
}

export interface UserSubscription {
  planType: PlanType;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  status: 'active' | 'canceled' | 'past_due' | 'incomplete';
  createdAt: Date;
  updatedAt: Date;
}

export interface UsageRecord {
  userId: string;
  month: string; // Format: YYYY-MM
  planType: PlanType;
  ratingsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: {
      aiRatingsPerMonth: 2,
      postReminders: false,
      advancedAiFeedback: false,
      csvExport: false,
    },
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 9,
    stripePriceId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID,
    features: {
      aiRatingsPerMonth: 20,
      postReminders: true,
      advancedAiFeedback: false,
      csvExport: false,
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    stripePriceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID,
    features: {
      aiRatingsPerMonth: 'unlimited',
      postReminders: true,
      advancedAiFeedback: true,
      csvExport: true,
    },
  },
];

export function getPlanById(planType: PlanType): Plan {
  return PLANS.find(plan => plan.id === planType) || PLANS[0];
}

export function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function canUseAiRating(plan: Plan, usedCount: number): boolean {
  if (plan.features.aiRatingsPerMonth === 'unlimited') {
    return true;
  }
  return usedCount < plan.features.aiRatingsPerMonth;
}