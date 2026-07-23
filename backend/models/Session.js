const mongoose = require("mongoose");

const ScoreSchema = new mongoose.Schema(
  {
    communication: { type: Number, min: 0, max: 10, default: 0 },
    technicalDepth: { type: Number, min: 0, max: 10, default: 0 },
    confidence: { type: Number, min: 0, max: 10, default: 0 },
  },
  { _id: false }
);

const QASchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, default: "" },
    score: { type: ScoreSchema, default: () => ({}) },
    feedback: { type: String, default: "" },
    improvementTips: { type: [String], default: [] },
    answeredAt: { type: Date },
  },
  { _id: false }
);

const SessionSchema = new mongoose.Schema(
  {
    roleId: { type: String, required: true },
    roleTitle: { type: String, required: true },
    status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
    questions: { type: [QASchema], default: [] },
    totalQuestions: { type: Number, default: 5 },
    overallScore: { type: ScoreSchema, default: () => ({}) },
    overallAverage: { type: Number, default: 0 },
    summary: { type: String, default: "" },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", SessionSchema);
