import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check for token in cookies (for refresh tokens)
    if (!token && req.cookies?.refreshToken) {
      token = req.cookies.refreshToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to access this route"
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select("-passwordHash");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "User not found"
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: "Not authorized to access this route"
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: "Server error in auth middleware"
    });
  }
};

// Check if user has active subscription
export const requireSubscription = (requiredPlan = "pro") => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Not authenticated"
        });
      }

      // Check subscription status
      if (req.user.subscriptionStatus === "active" &&
          (req.user.subscriptionPlan === requiredPlan ||
           req.user.subscriptionPlan === "coach" ||
           (requiredPlan === "pro" && req.user.subscriptionPlan === "coach"))) {
        return next();
      }

      return res.status(402).json({
        success: false,
        error: "Subscription required",
        code: "PAYMENT_REQUIRED",
        requiredPlan
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        error: "Server error checking subscription"
      });
    }
  };
};