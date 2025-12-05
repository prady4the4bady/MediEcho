import express from "express";
import { body } from "express-validator";
import { register, login, getMe, refreshToken } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Validation rules
const registerValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("name").optional().trim().isLength({ min: 1, max: 50 })
];

const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").exists()
];

// Routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/refresh", refreshToken);
router.get("/me", protect, getMe);

export default router;