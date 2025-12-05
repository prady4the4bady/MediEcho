import express from "express";
import Stripe from "stripe";
import User from "../models/User.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe requires raw body for webhook signature verification
router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("Checkout session completed:", session.id);

        // Find user by customer ID or metadata
        let user = await User.findOne({ stripeCustomerId: session.customer });
        
        if (!user && session.metadata?.userId) {
          user = await User.findById(session.metadata.userId);
          if (user) {
            user.stripeCustomerId = session.customer;
          }
        }
        
        if (user) {
          user.subscriptionStatus = "active";
          user.stripeSubscriptionId = session.subscription;
          
          // Fetch subscription to get price details
          if (session.subscription) {
            try {
              const subscription = await stripe.subscriptions.retrieve(session.subscription);
              const priceId = subscription.items.data[0]?.price.id;
              user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);
              
              // Map price ID to plan
              const coachPriceIds = [
                process.env.STRIPE_PRICE_COACH_MONTHLY,
                process.env.STRIPE_PRICE_COACH_YEARLY,
                'price_1SaWrqPq3dHffIt63pt2sBEY',
                'price_1SaWrqPq3dHffIt6tt3zLBbH'
              ];
              
              if (coachPriceIds.includes(priceId)) {
                user.subscriptionPlan = "coach";
              } else {
                user.subscriptionPlan = "pro";
              }
            } catch (e) {
              console.error("Error fetching subscription details:", e);
              user.subscriptionPlan = "pro"; // Default to pro
            }
          }
          
          await user.save();
          console.log(`Checkout completed for ${user.email}, plan: ${user.subscriptionPlan}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        console.log("Payment succeeded for invoice:", invoice.id);

        const user = await User.findOne({ stripeCustomerId: invoice.customer });
        if (user) {
          user.subscriptionStatus = "active";
          user.stripeSubscriptionId = invoice.subscription;
          await user.save();
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        console.log("Payment failed for invoice:", invoice.id);

        const user = await User.findOne({ stripeCustomerId: invoice.customer });
        if (user) {
          user.subscriptionStatus = "past_due";
          await user.save();
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        console.log("Subscription updated:", subscription.id);

        const user = await User.findOne({ stripeCustomerId: subscription.customer });
        if (user) {
          user.subscriptionStatus = subscription.status;
          user.stripeSubscriptionId = subscription.id;
          user.subscriptionEndDate = new Date(subscription.current_period_end * 1000);

          // Map Stripe price ID to plan name
          const priceId = subscription.items.data[0]?.price.id;
          if (priceId) {
            // Check against your actual price IDs
            const proPriceIds = [
              process.env.STRIPE_PRICE_PRO_MONTHLY,
              process.env.STRIPE_PRICE_PRO_YEARLY,
              'price_1SaWq0Pq3dHffIt6lCqFbLDN', // Pro Monthly
              'price_1SaWq0Pq3dHffIt6amyRgVJG'  // Pro Yearly
            ];
            const coachPriceIds = [
              process.env.STRIPE_PRICE_COACH_MONTHLY,
              process.env.STRIPE_PRICE_COACH_YEARLY,
              'price_1SaWrqPq3dHffIt63pt2sBEY', // Coach Monthly
              'price_1SaWrqPq3dHffIt6tt3zLBbH'  // Coach Yearly
            ];

            if (coachPriceIds.includes(priceId)) {
              user.subscriptionPlan = "coach";
            } else if (proPriceIds.includes(priceId)) {
              user.subscriptionPlan = "pro";
            }
          }

          await user.save();
          console.log(`Updated user ${user.email} to plan: ${user.subscriptionPlan}, status: ${user.subscriptionStatus}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        console.log("Subscription canceled:", subscription.id);

        const user = await User.findOne({ stripeCustomerId: subscription.customer });
        if (user) {
          user.subscriptionStatus = "canceled";
          user.subscriptionPlan = "free";
          user.stripeSubscriptionId = null;
          await user.save();
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;