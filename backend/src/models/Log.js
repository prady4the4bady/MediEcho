import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["symptom", "fitness", "food", "mood", "voice"],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  tone: {
    type: String,
    enum: ["positive", "negative", "neutral", "anxious", "calm"]
  },
  meta: {
    duration: Number, // for voice recordings in seconds
    transcriptionConfidence: Number,
    aiSummary: String,
    tags: [String]
  },
  isEncrypted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
logSchema.index({ userId: 1, createdAt: -1 });
logSchema.index({ userId: 1, type: 1 });

export default mongoose.model("Log", logSchema);