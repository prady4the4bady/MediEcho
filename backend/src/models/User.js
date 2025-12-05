import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  stripeCustomerId: {
    type: String,
    sparse: true
  },
  stripeSubscriptionId: {
    type: String,
    sparse: true
  },
  subscriptionStatus: {
    type: String,
    enum: ["active", "past_due", "canceled", "trialing", "none"],
    default: "none"
  },
  subscriptionPlan: {
    type: String,
    enum: ["free", "pro", "coach"],
    default: "free"
  },
  subscriptionEndDate: {
    type: Date
  },
  settings: {
    privacyLocalFirst: {
      type: Boolean,
      default: true
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  }
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ stripeCustomerId: 1 });

export default mongoose.model("User", userSchema);