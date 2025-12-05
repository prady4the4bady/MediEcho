import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import { generateToken, generateRefreshToken } from "../utils/generateToken.js";

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: errors.array()
      });
    }

    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      email,
      passwordHash,
      name
    });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionPlan: user.subscriptionPlan
        },
        token,
        refreshToken
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({
      success: false,
      error: "Server error during registration"
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials"
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionPlan: user.subscriptionPlan
        },
        token,
        refreshToken
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      error: "Server error during login"
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionPlan: user.subscriptionPlan,
          settings: user.settings,
          createdAt: user.createdAt
        }
      }
    });
  } catch (err) {
    console.error("Get me error:", err);
    res.status(500).json({
      success: false,
      error: "Server error getting user data"
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Refresh token required"
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    // Generate new access token
    const newToken = generateToken(decoded.id);

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      error: "Invalid refresh token"
    });
  }
};