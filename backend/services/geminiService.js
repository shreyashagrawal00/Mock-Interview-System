const { GoogleGenerativeAI } = require("@google/generative-ai");

let client = null;
function getClient() {
  if (!client) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set. Add it to backend/.env");
    }
    client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return client;
}

function getModel() {
  const modelName = process.env.GEMINI_MODEL || "gemini-flash-latest";
  return getClient().getGenerativeModel({ model: modelName });
}

// Strips markdown code fences and parses JSON safely.
function parseJson(rawText) {
  const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const jsonSlice = start !== -1 && end !== -1 ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(jsonSlice);
}

/**
 * Generates the next interview question for a given role, aware of
 * previously asked questions so it doesn't repeat itself.
 */
async function generateQuestion({ roleTitle, focus, previousQuestions = [], questionNumber, totalQuestions }) {
  const model = getModel();

  const historyBlock =
    previousQuestions.length > 0
      ? `Questions already asked in this session (do not repeat these or close variants):\n${previousQuestions
          .map((q, i) => `${i + 1}. ${q}`)
          .join("\n")}`
      : "This is the first question of the session.";

  const prompt = `You are an experienced technical interviewer conducting a mock interview for the role of "${roleTitle}".
Role focus areas: ${focus}.

${historyBlock}

Generate question number ${questionNumber} of ${totalQuestions}.
Rules:
- Keep it realistic, like a real interviewer would ask.
- Vary difficulty and topic across the session (mix conceptual, practical, and scenario-based questions).
- One question only, concise (1-3 sentences).
- No preamble, no "Sure, here is a question".

Respond ONLY with strict JSON, no markdown fences, in this exact shape:
{"question": "the interview question text"}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseJson(text);
  if (!parsed.question) throw new Error("Gemini did not return a question");
  return parsed.question;
}

/**
 * Evaluates a candidate's answer and returns structured scoring + feedback.
 */
async function evaluateAnswer({ roleTitle, focus, question, answer }) {
  const model = getModel();

  const prompt = `You are grading a candidate's answer in a mock interview for the role of "${roleTitle}" (focus: ${focus}).

Question asked: "${question}"
Candidate's answer: "${answer || "(no answer provided)"}"

Evaluate the answer honestly, as a fair but rigorous interviewer would. If the answer is empty, off-topic, or very weak, score it low and say so plainly.

Score each on a 0-10 scale:
- communication: clarity, structure, how easy the answer is to follow
- technicalDepth: correctness, relevant detail, depth of understanding
- confidence: decisiveness and command of the material as conveyed by the wording

Also provide:
- feedback: 2-3 sentences of direct, constructive feedback
- improvementTips: an array of 2-3 short, actionable tips

Respond ONLY with strict JSON, no markdown fences, in this exact shape:
{
  "communication": 0,
  "technicalDepth": 0,
  "confidence": 0,
  "feedback": "string",
  "improvementTips": ["string", "string"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseJson(text);

  const clamp = (n) => Math.max(0, Math.min(10, Number(n) || 0));

  return {
    score: {
      communication: clamp(parsed.communication),
      technicalDepth: clamp(parsed.technicalDepth),
      confidence: clamp(parsed.confidence),
    },
    feedback: parsed.feedback || "",
    improvementTips: Array.isArray(parsed.improvementTips) ? parsed.improvementTips.slice(0, 4) : [],
  };
}

/**
 * Generates a short closing summary once the session is complete.
 */
async function generateSessionSummary({ roleTitle, overallAverage, questions }) {
  const model = getModel();

  const transcript = questions
    .map(
      (q, i) =>
        `Q${i + 1}: ${q.question}\nAnswer: ${q.answer || "(no answer)"}\nScores - communication:${q.score.communication}, technicalDepth:${q.score.technicalDepth}, confidence:${q.score.confidence}`
    )
    .join("\n\n");

  const prompt = `You are wrapping up a mock interview for the role of "${roleTitle}". Overall average score: ${overallAverage.toFixed(
    1
  )}/10.

Session transcript:
${transcript}

Write a short closing summary (3-4 sentences) in a warm but honest coaching tone: what the candidate did well overall, and the single biggest area to focus on before a real interview.

Respond ONLY with strict JSON, no markdown fences, in this exact shape:
{"summary": "string"}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  const parsed = parseJson(text);
  return parsed.summary || "Session complete. Review your per-question feedback above.";
}

module.exports = { generateQuestion, evaluateAnswer, generateSessionSummary };
