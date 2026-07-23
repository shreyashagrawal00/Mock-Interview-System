const express = require("express");
const Session = require("../models/Session");
const { getRoleById } = require("../config/roles");
const { generateQuestion, evaluateAnswer, generateSessionSummary } = require("../services/geminiService");

const router = express.Router();

const DEFAULT_TOTAL_QUESTIONS = 5;

function average(scoreObj) {
  const vals = Object.values(scoreObj);
  if (!vals.length) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

// POST /api/session/start  { roleId, totalQuestions? }
router.post("/start", async (req, res) => {
  try {
    const { roleId, totalQuestions } = req.body;
    const role = getRoleById(roleId);
    if (!role) return res.status(400).json({ error: "Unknown roleId" });

    const questionCount = Number(totalQuestions) > 0 ? Number(totalQuestions) : DEFAULT_TOTAL_QUESTIONS;

    const question = await generateQuestion({
      roleTitle: role.title,
      focus: role.focus,
      level: role.level,
      previousQuestions: [],
      questionNumber: 1,
      totalQuestions: questionCount,
    });

    const session = await Session.create({
      roleId: role.id,
      roleTitle: role.title,
      totalQuestions: questionCount,
      questions: [{ question }],
    });

    res.json({
      sessionId: session._id,
      roleTitle: role.title,
      questionNumber: 1,
      totalQuestions: questionCount,
      question,
    });
  } catch (err) {
    console.error("[session/start]", err.message);
    res.status(500).json({ error: "Failed to start session", detail: err.message });
  }
});

// POST /api/session/:id/answer  { answer }
router.post("/:id/answer", async (req, res) => {
  try {
    const { answer } = req.body;
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });
    if (session.status === "completed") return res.status(400).json({ error: "Session already completed" });

    const role = getRoleById(session.roleId);
    const currentIndex = session.questions.length - 1;
    const currentQ = session.questions[currentIndex];

    const evaluation = await evaluateAnswer({
      roleTitle: role ? role.title : session.roleTitle,
      focus: role ? role.focus : "",
      level: role ? role.level : "",
      question: currentQ.question,
      answer,
    });

    currentQ.answer = answer || "";
    currentQ.score = evaluation.score;
    currentQ.feedback = evaluation.feedback;
    currentQ.improvementTips = evaluation.improvementTips;
    currentQ.answeredAt = new Date();

    const isLast = session.questions.length >= session.totalQuestions;

    let nextQuestion = null;

    if (isLast) {
      const allScores = session.questions.map((q) => q.score);
      const count = allScores.length || 1;
      const overallScore = {
        communication: allScores.reduce((a, s) => a + (Number(s?.communication) || 0), 0) / count,
        technicalDepth: allScores.reduce((a, s) => a + (Number(s?.technicalDepth) || 0), 0) / count,
        confidence: allScores.reduce((a, s) => a + (Number(s?.confidence) || 0), 0) / count,
      };
      const overallAverage = average(overallScore);

      const summary = await generateSessionSummary({
        roleTitle: role.title,
        overallAverage,
        questions: session.questions,
      });

      session.overallScore = overallScore;
      session.overallAverage = overallAverage;
      session.summary = summary;
      session.status = "completed";
      session.completedAt = new Date();
    } else {
      nextQuestion = await generateQuestion({
        roleTitle: role.title,
        focus: role.focus,
        level: role.level,
        previousQuestions: session.questions.map((q) => q.question),
        questionNumber: session.questions.length + 1,
        totalQuestions: session.totalQuestions,
      });
      session.questions.push({ question: nextQuestion });
    }

    await session.save();

    res.json({
      evaluation: {
        score: currentQ.score,
        feedback: currentQ.feedback,
        improvementTips: currentQ.improvementTips,
      },
      isComplete: isLast,
      nextQuestion: nextQuestion
        ? {
            questionNumber: session.questions.length,
            totalQuestions: session.totalQuestions,
            question: nextQuestion,
          }
        : null,
      result: isLast
        ? {
            overallScore: session.overallScore,
            overallAverage: session.overallAverage,
            summary: session.summary,
          }
        : null,
    });
  } catch (err) {
    console.error("[session/answer]", err.message);
    res.status(500).json({ error: "Failed to evaluate answer", detail: err.message });
  }
});

// GET /api/session/:id -> full session detail (used by results page)
router.get("/:id", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch session", detail: err.message });
  }
});

// GET /api/session  -> history list (most recent first)
router.get("/", async (req, res) => {
  try {
    const sessions = await Session.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .select("roleTitle roleId status overallAverage totalQuestions createdAt completedAt");
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history", detail: err.message });
  }
});

// POST /api/session/:id/restart -> start a fresh session for the same role
router.post("/:id/restart", async (req, res) => {
  try {
    const prev = await Session.findById(req.params.id);
    if (!prev) return res.status(404).json({ error: "Session not found" });
    const role = getRoleById(prev.roleId);
    if (!role) return res.status(404).json({ error: "Role not found for session" });

    const question = await generateQuestion({
      roleTitle: role.title,
      focus: role.focus,
      previousQuestions: [],
      questionNumber: 1,
      totalQuestions: prev.totalQuestions,
    });

    const session = await Session.create({
      roleId: role.id,
      roleTitle: role.title,
      totalQuestions: prev.totalQuestions,
      questions: [{ question }],
    });

    res.json({
      sessionId: session._id,
      roleTitle: role.title,
      questionNumber: 1,
      totalQuestions: session.totalQuestions,
      question,
    });
  } catch (err) {
    console.error("[session/restart]", err.message);
    res.status(500).json({ error: "Failed to restart session", detail: err.message });
  }
});

module.exports = router;
