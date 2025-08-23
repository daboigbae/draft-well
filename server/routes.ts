import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
// Removed Firebase Admin - using client-side Firestore updates instead

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Firebase Admin removed - client handles Firestore updates

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
        success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
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

  // Verify and update subscription after successful checkout
  app.post("/api/verify-subscription", async (req, res) => {
    try {
      const { sessionId, userId } = req.body;
      
      if (!sessionId || !userId) {
        return res.status(400).json({ error: 'Missing sessionId or userId' });
      }
      
      // Get the checkout session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid' && session.client_reference_id === userId) {
        const planType = session.metadata?.planType || 'starter';
        
        console.log(`Verified successful payment for user ${userId} to ${planType}`);
        
        // Return subscription data for client to update Firestore
        res.json({ 
          success: true, 
          planType,
          customerId: session.customer,
          subscriptionData: {
            customerId: session.customer,
            planType,
            status: 'active',
            stripeSessionId: sessionId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        });
      } else {
        res.status(400).json({ error: 'Payment not completed or user mismatch' });
      }
    } catch (error: any) {
      console.error('Error verifying subscription:', error);
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

  // Stripe webhook handler (optional - using client-side verification instead)
  app.post("/api/stripe-webhook", async (req, res) => {
    console.log('Webhook received (but not processed - using client-side verification)');
    res.json({ received: true });
  });

  const httpServer = createServer(app);

  return httpServer;
}
