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

// GET /api/session/analytics/overview -> Aggregate session statistics & trends
router.get("/analytics/overview", async (req, res) => {
  try {
    const sessions = await Session.find({ status: "completed" }).sort({ createdAt: -1 });

    const totalCompleted = sessions.length;
    let avgComm = 0, avgTech = 0, avgConf = 0, avgOverall = 0;

    if (totalCompleted > 0) {
      avgComm = sessions.reduce((acc, s) => acc + (s.overallScore?.communication || 0), 0) / totalCompleted;
      avgTech = sessions.reduce((acc, s) => acc + (s.overallScore?.technicalDepth || 0), 0) / totalCompleted;
      avgConf = sessions.reduce((acc, s) => acc + (s.overallScore?.confidence || 0), 0) / totalCompleted;
      avgOverall = sessions.reduce((acc, s) => acc + (s.overallAverage || 0), 0) / totalCompleted;
    }

    const recentTrends = sessions.slice(0, 10).reverse().map((s) => ({
      id: s._id,
      roleTitle: s.roleTitle,
      date: s.completedAt ? new Date(s.completedAt).toLocaleDateString() : "",
      communication: Math.round((s.overallScore?.communication || 0) * 10) / 10,
      technicalDepth: Math.round((s.overallScore?.technicalDepth || 0) * 10) / 10,
      confidence: Math.round((s.overallScore?.confidence || 0) * 10) / 10,
      overallAverage: Math.round((s.overallAverage || 0) * 10) / 10,
    }));

    res.json({
      totalCompleted,
      avgComm: Math.round(avgComm * 10) / 10,
      avgTech: Math.round(avgTech * 10) / 10,
      avgConf: Math.round(avgConf * 10) / 10,
      avgOverall: Math.round(avgOverall * 10) / 10,
      recentTrends,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics", detail: err.message });
  }
});

// POST /api/session/start  { roleId, totalQuestions?, mode?, level?, timerSeconds?, resumeText?, jobDescription? }
router.post("/start", async (req, res) => {
  try {
    const { roleId, totalQuestions, mode = "standard", level = "Fresher / Entry-Level", timerSeconds = 0, resumeText = "", jobDescription = "" } = req.body;
    const role = getRoleById(roleId);
    if (!role) return res.status(400).json({ error: "Unknown roleId" });

    const questionCount = Number(totalQuestions) > 0 ? Number(totalQuestions) : DEFAULT_TOTAL_QUESTIONS;

    const question = await generateQuestion({
      roleTitle: role.title,
      focus: role.focus,
      level,
      mode,
      resume: resumeText,
      jobDescription,
      previousQuestions: [],
      questionNumber: 1,
      totalQuestions: questionCount,
    });

    const session = await Session.create({
      roleId: role.id,
      roleTitle: role.title,
      mode,
      level,
      timerSeconds: Number(timerSeconds) || 0,
      customContext: {
        resume: resumeText,
        jobDescription,
      },
      totalQuestions: questionCount,
      questions: [{ question }],
    });

    res.json({
      sessionId: session._id,
      roleTitle: role.title,
      mode: session.mode,
      level: session.level,
      timerSeconds: session.timerSeconds,
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
      level: session.level || (role ? role.level : ""),
      mode: session.mode,
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
        roleTitle: role ? role.title : session.roleTitle,
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
        roleTitle: role ? role.title : session.roleTitle,
        focus: role ? role.focus : "",
        level: session.level || (role ? role.level : ""),
        mode: session.mode,
        resume: session.customContext?.resume || "",
        jobDescription: session.customContext?.jobDescription || "",
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

// POST /api/session/:id/question/:index/model-answer -> Generate AI benchmark model answer
router.post("/:id/question/:index/model-answer", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const qIndex = Number(req.params.index);
    if (isNaN(qIndex) || qIndex < 0 || qIndex >= session.questions.length) {
      return res.status(400).json({ error: "Invalid question index" });
    }

    const targetQ = session.questions[qIndex];
    if (targetQ.modelAnswer) {
      return res.json({ modelAnswer: targetQ.modelAnswer });
    }

    const { generateModelAnswer } = require("../services/geminiService");
    const role = getRoleById(session.roleId);

    const modelAnswer = await generateModelAnswer({
      question: targetQ.question,
      roleTitle: session.roleTitle,
      focus: role ? role.focus : "",
      level: session.level,
    });

    targetQ.modelAnswer = modelAnswer;
    await session.save();

    res.json({ modelAnswer });
  } catch (err) {
    console.error("[model-answer]", err.message);
    res.status(500).json({ error: "Failed to generate model answer", detail: err.message });
  }
});

// POST /api/session/:id/question/:index/bookmark -> Toggle bookmark status on question
router.post("/:id/question/:index/bookmark", async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: "Session not found" });

    const qIndex = Number(req.params.index);
    if (isNaN(qIndex) || qIndex < 0 || qIndex >= session.questions.length) {
      return res.status(400).json({ error: "Invalid question index" });
    }

    session.questions[qIndex].isBookmarked = !session.questions[qIndex].isBookmarked;
    await session.save();

    res.json({ isBookmarked: session.questions[qIndex].isBookmarked });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle bookmark", detail: err.message });
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
      .select("roleTitle roleId status mode level overallAverage totalQuestions createdAt completedAt");
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

    const question = await generateQuestion({
      roleTitle: prev.roleTitle,
      focus: role ? role.focus : "",
      level: prev.level,
      mode: prev.mode,
      resume: prev.customContext?.resume || "",
      jobDescription: prev.customContext?.jobDescription || "",
      previousQuestions: [],
      questionNumber: 1,
      totalQuestions: prev.totalQuestions,
    });

    const session = await Session.create({
      roleId: prev.roleId,
      roleTitle: prev.roleTitle,
      mode: prev.mode,
      level: prev.level,
      timerSeconds: prev.timerSeconds,
      customContext: prev.customContext,
      totalQuestions: prev.totalQuestions,
      questions: [{ question }],
    });

    res.json({
      sessionId: session._id,
      roleTitle: session.roleTitle,
      mode: session.mode,
      level: session.level,
      timerSeconds: session.timerSeconds,
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
