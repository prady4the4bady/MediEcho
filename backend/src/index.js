import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import logRoutes from "./routes/logRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import briefRoutes from "./routes/briefRoutes.js";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.APP_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use("/api/", limiter);

// More strict rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 auth requests per windowMs
  message: "Too many authentication attempts, please try again later."
});
app.use("/api/auth", authLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/briefs", briefRoutes);

// Webhook routes (must come before express.json() middleware)
app.use("/api/webhooks/stripe", webhookRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      details: errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: "Duplicate field value entered"
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Invalid token"
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Server error" : err.message
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
};

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

export default app;