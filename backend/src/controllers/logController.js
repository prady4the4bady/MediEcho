import Log from "../models/Log.js";
import { validationResult } from "express-validator";

// @desc    Create a new log entry
// @route   POST /api/logs
// @access  Private
export const createLog = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array()
      });
    }

    const { type, text, tone, meta } = req.body;

    const log = await Log.create({
      userId: req.user._id,
      type,
      text,
      tone,
      meta
    });

    res.status(201).json({
      success: true,
      data: log
    });
  } catch (err) {
    console.error("Create log error:", err);
    res.status(500).json({
      success: false,
      error: "Server error creating log"
    });
  }
};

// @desc    Get user logs with filtering
// @route   GET /api/logs
// @access  Private
export const getLogs = async (req, res) => {
  try {
    const { start, end, type, limit = 50, page = 1 } = req.query;

    // Build query
    const query = { userId: req.user._id };

    if (type) query.type = type;
    if (start || end) {
      query.createdAt = {};
      if (start) query.createdAt.$gte = new Date(start);
      if (end) query.createdAt.$lte = new Date(end);
    }

    // Execute query with pagination
    const logs = await Log.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v");

    const total = await Log.countDocuments(query);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (err) {
    console.error("Get logs error:", err);
    res.status(500).json({
      success: false,
      error: "Server error fetching logs"
    });
  }
};

// @desc    Get single log
// @route   GET /api/logs/:id
// @access  Private
export const getLog = async (req, res) => {
  try {
    const log = await Log.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        error: "Log not found"
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (err) {
    console.error("Get log error:", err);
    res.status(500).json({
      success: false,
      error: "Server error fetching log"
    });
  }
};

// @desc    Update log
// @route   PUT /api/logs/:id
// @access  Private
export const updateLog = async (req, res) => {
  try {
    const { type, text, tone, meta } = req.body;

    const log = await Log.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { type, text, tone, meta },
      { new: true, runValidators: true }
    );

    if (!log) {
      return res.status(404).json({
        success: false,
        error: "Log not found"
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (err) {
    console.error("Update log error:", err);
    res.status(500).json({
      success: false,
      error: "Server error updating log"
    });
  }
};

// @desc    Delete log
// @route   DELETE /api/logs/:id
// @access  Private
export const deleteLog = async (req, res) => {
  try {
    const log = await Log.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        error: "Log not found"
      });
    }

    res.json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error("Delete log error:", err);
    res.status(500).json({
      success: false,
      error: "Server error deleting log"
    });
  }
};

// @desc    Get log statistics
// @route   GET /api/logs/stats
// @access  Private
export const getLogStats = async (req, res) => {
  try {
    const { start, end } = req.query;

    const matchStage = { userId: req.user._id };
    if (start || end) {
      matchStage.createdAt = {};
      if (start) matchStage.createdAt.$gte = new Date(start);
      if (end) matchStage.createdAt.$lte = new Date(end);
    }

    const stats = await Log.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          latest: { $max: "$createdAt" }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.error("Get log stats error:", err);
    res.status(500).json({
      success: false,
      error: "Server error fetching log statistics"
    });
  }
};