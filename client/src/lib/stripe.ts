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
      successUrl: `${window.location.origin}/app?success=true`,
      cancelUrl: `${window.location.origin}/app?canceled=true`,
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

  try {
    const result = await stripe.redirectToCheckout({ sessionId });
    
    if (result.error) {
      throw new Error(result.error.message || 'Failed to redirect to checkout');
    }
  } catch (error: any) {
    // Fallback: direct redirect to Stripe checkout URL
    const checkoutUrl = `https://checkout.stripe.com/c/pay/${sessionId}`;
    window.location.href = checkoutUrl;
  }
}

export async function createCustomerPortalSession(customerId?: string) {
  const response = await fetch('/api/create-portal-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customerId,
      returnUrl: `${window.location.origin}/app/settings`,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create portal session: ${error}`);
  }

  const { url } = await response.json();
  window.location.href = url;
}