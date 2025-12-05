import express from "express";
import { body } from "express-validator";
import {
  createLog,
  getLogs,
  getLog,
  updateLog,
  deleteLog,
  getLogStats
} from "../controllers/logController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation rules
const logValidation = [
  body("type").isIn(["symptom", "fitness", "food", "mood", "voice"]),
  body("text").isLength({ min: 1, max: 10000 }),
  body("tone").optional().isIn(["positive", "negative", "neutral", "anxious", "calm"]),
  body("meta").optional().isObject()
];

// Routes
router.route("/")
  .post(logValidation, createLog)
  .get(getLogs);

router.route("/:id")
  .get(getLog)
  .put(logValidation, updateLog)
  .delete(deleteLog);

router.get("/stats/summary", getLogStats);

export default router;