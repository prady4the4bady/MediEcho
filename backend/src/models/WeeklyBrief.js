import mongoose from "mongoose";

const weeklyBriefSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  weekStart: {
    type: Date,
    required: true
  },
  weekEnd: {
    type: Date,
    required: true
  },
  pdfPath: {
    type: String // S3 path or local path
  },
  pdfUrl: {
    type: String // Public URL for download
  },
  encrypted: {
    type: Boolean,
    default: true
  },
  encryptionKey: {
    type: String // Encrypted key for user access
  },
  summary: {
    totalLogs: Number,
    topSymptoms: [String],
    moodTrend: String,
    fitnessScore: Number,
    recommendations: [String]
  },
  status: {
    type: String,
    enum: ["generating", "completed", "failed"],
    default: "generating"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
weeklyBriefSchema.index({ userId: 1, weekStart: -1 });

export default mongoose.model("WeeklyBrief", weeklyBriefSchema);