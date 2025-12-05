import express from "express";
import { body } from "express-validator";
import {
  createCheckoutSession,
  createCustomerPortal,
  getSubscription,
  verifyCheckoutSession,
  getPlans
} from "../controllers/subscriptionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/plans", getPlans);
router.get("/verify-session", verifyCheckoutSession);

// Protected routes
router.use(protect);

const checkoutValidation = [
  body("priceId").isString().notEmpty(),
  body("successUrl").optional().isURL(),
  body("cancelUrl").optional().isURL()
];

router.post("/checkout", checkoutValidation, createCheckoutSession);
router.post("/portal", createCustomerPortal);
router.get("/", getSubscription);

export default router;