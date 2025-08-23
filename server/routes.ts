import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Firebase Admin
let adminApp;
try {
  adminApp = initializeApp();
} catch (error) {
  // App already initialized
}
const adminDb = getFirestore();

export async function registerRoutes(app: Express): Promise<Server> {
  // Stripe checkout session creation
  app.post("/api/create-checkout-session", async (req, res) => {
    try {
      const { planType, userId, successUrl, cancelUrl } = req.body;

      // Price IDs mapping 
      const priceIdMapping: Record<string, string> = {
        starter: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter_placeholder',
        pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_placeholder'
      };

      if (!priceIdMapping[planType as keyof typeof priceIdMapping]) {
        return res.status(400).json({ error: 'Invalid plan type' });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceIdMapping[planType as keyof typeof priceIdMapping],
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: userId,
        metadata: {
          userId,
          planType,
        },
      });

      res.json({ sessionId: session.id });
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Customer portal session
  app.post("/api/create-portal-session", async (req, res) => {
    try {
      const { returnUrl } = req.body;
      const { customerId } = req.body; // This would come from user's subscription data

      if (!customerId) {
        return res.status(400).json({ error: 'No customer ID found' });
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      res.json({ url: portalSession.url });
    } catch (error: any) {
      console.error('Error creating portal session:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe webhook handler
  app.post("/api/stripe-webhook", async (req, res) => {
    let event;

    try {
      // In production, you'd verify the webhook signature
      event = req.body;
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Checkout session completed:', session);
        
        // Update user subscription in Firestore
        try {
          const userId = session.client_reference_id;
          const planType = session.metadata?.planType || 'starter';
          
          if (userId) {
            await adminDb.collection('subscriptions').doc(userId).set({
              customerId: session.customer,
              planType,
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            console.log(`Updated subscription for user ${userId} to ${planType}`);
          }
        } catch (error) {
          console.error('Error updating subscription:', error);
        }
        break;
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        console.log('Subscription updated:', subscription);
        // Update user subscription status
        break;
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        console.log('Subscription canceled:', deletedSubscription);
        // Downgrade user to free plan
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  });

  const httpServer = createServer(app);

  return httpServer;
}
