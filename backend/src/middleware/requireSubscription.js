import User from '../models/User.js';

// Middleware to check if user has required subscription
export const requireSubscription = (allowedPlans) => {
  return async (req, res, next) => {
    try {
      // User should be attached by authMiddleware
      if (!req.user || !req.user._id) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Get user with subscription info
      const user = await User.findById(req.user._id).select('subscriptionPlan subscriptionStatus');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if subscription is active
      if (user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'trialing') {
        return res.status(403).json({
          success: false,
          error: 'Active subscription required'
        });
      }

      // Check if user's plan is in allowed plans
      if (!allowedPlans.includes(user.subscriptionPlan)) {
        return res.status(403).json({
          success: false,
          error: `This feature requires a ${allowedPlans.join(' or ')} subscription`
        });
      }

      next();
    } catch (error) {
      console.error('Subscription check error:', error);
      res.status(500).json({
        success: false,
        error: 'Server error during subscription check'
      });
    }
  };
};