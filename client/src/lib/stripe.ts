import { loadStripe } from '@stripe/stripe-js';
import { PlanType } from '../types/subscription';

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export async function createCheckoutSession(planType: PlanType, userId: string) {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      planType,
      userId,
      successUrl: `${window.location.origin}/settings?success=true`,
      cancelUrl: `${window.location.origin}/settings?canceled=true`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create checkout session: ${error}`);
  }

  const { sessionId } = await response.json();
  
  const stripe = await stripePromise;
  if (!stripe) {
    throw new Error('Stripe failed to load');
  }

  const { error } = await stripe.redirectToCheckout({ sessionId });
  
  if (error) {
    throw new Error(error.message);
  }
}

export async function createCustomerPortalSession() {
  const response = await fetch('/api/create-portal-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      returnUrl: `${window.location.origin}/settings`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create portal session: ${error}`);
  }

  const { url } = await response.json();
  window.location.href = url;
}