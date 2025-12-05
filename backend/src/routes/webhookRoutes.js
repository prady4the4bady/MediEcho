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

        // Find user by customer ID
        const user = await User.findOne({ stripeCustomerId: session.customer });
        if (user) {
          // Update user subscription status
          user.subscriptionStatus = "active";
          await user.save();
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

          // Map Stripe price ID to plan name
          const priceId = subscription.items.data[0]?.price.id;
          if (priceId) {
            if (priceId.includes("coach")) {
              user.subscriptionPlan = "coach";
            } else if (priceId.includes("pro")) {
              user.subscriptionPlan = "pro";
            }
          }

          await user.save();
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