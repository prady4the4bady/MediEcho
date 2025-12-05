import Stripe from "stripe";
import User from "../models/User.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create Stripe checkout session
// @route   POST /api/subscription/checkout
// @access  Private
export const createCheckoutSession = async (req, res) => {
  try {
    const { priceId, successUrl, cancelUrl } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Ensure stripe customer exists
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });
      user.stripeCustomerId = customer.id;
      await user.save();
      customerId = customer.id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      metadata: {
        userId: user._id.toString()
      },
      success_url: successUrl || `${process.env.APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.APP_URL}/subscription/failure`,
      allow_promotion_codes: true
    });

    res.json({
      success: true,
      data: {
        url: session.url,
        sessionId: session.id
      }
    });
  } catch (err) {
    console.error("Create checkout session error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create checkout session"
    });
  }
};

// @desc    Create customer portal session
// @route   POST /api/subscription/portal
// @access  Private
export const createCustomerPortal = async (req, res) => {
  try {
    const { returnUrl } = req.body;
    const user = await User.findById(req.user._id);

    if (!user || !user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        error: "No active subscription found"
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl || `${process.env.APP_URL}/dashboard`
    });

    res.json({
      success: true,
      data: {
        url: session.url
      }
    });
  } catch (err) {
    console.error("Create customer portal error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create customer portal session"
    });
  }
};

// @desc    Get subscription status
// @route   GET /api/subscription
// @access  Private
export const getSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.json({
      success: true,
      data: {
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan,
        stripeCustomerId: user.stripeCustomerId,
        subscriptionEndDate: user.subscriptionEndDate
      }
    });
  } catch (err) {
    console.error("Get subscription error:", err);
    res.status(500).json({
      success: false,
      error: "Server error fetching subscription"
    });
  }
};

// @desc    Verify checkout session
// @route   GET /api/subscription/verify-session
// @access  Public (but should be called after successful payment)
export const verifyCheckoutSession = async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: "Session ID required"
      });
    }

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["payment_intent", "subscription"]
    });

    res.json({
      success: true,
      data: {
        session: {
          id: session.id,
          payment_status: session.payment_status,
          subscription: session.subscription
        }
      }
    });
  } catch (err) {
    console.error("Verify checkout session error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to verify checkout session"
    });
  }
};

// @desc    Get pricing plans
// @route   GET /api/plans
// @access  Public
export const getPlans = async (req, res) => {
  try {
    // In production, you might want to fetch these from Stripe
    const plans = {
      pro: {
        monthly: {
          priceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
          price: 999, // $9.99
          currency: "usd"
        },
        yearly: {
          priceId: process.env.STRIPE_PRICE_PRO_YEARLY,
          price: 9999, // $99.99
          currency: "usd"
        }
      },
      coach: {
        monthly: {
          priceId: process.env.STRIPE_PRICE_COACH_MONTHLY,
          price: 1499, // $14.99
          currency: "usd"
        },
        yearly: {
          priceId: process.env.STRIPE_PRICE_COACH_YEARLY,
          price: 14999, // $149.99
          currency: "usd"
        }
      }
    };

    res.json({
      success: true,
      data: plans
    });
  } catch (err) {
    console.error("Get plans error:", err);
    res.status(500).json({
      success: false,
      error: "Server error fetching plans"
    });
  }
};