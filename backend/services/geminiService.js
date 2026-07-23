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

const FALLBACK_MODELS = [
  process.env.GEMINI_MODEL || "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.5-flash",
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

async function callMistral(prompt) {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error("MISTRAL_API_KEY is not configured in backend/.env");

  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.MISTRAL_MODEL || "mistral-small-latest",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || `Mistral API error (${res.status})`);
  }

  return data.choices?.[0]?.message?.content || "";
}

async function generateWithFallback(prompt) {
  let lastErr = null;

  // 1. Try Gemini models
  if (process.env.GEMINI_API_KEY) {
    const genAI = getClient();
    for (const modelName of FALLBACK_MODELS) {
      if (!modelName) continue;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          return result.response.text();
        } catch (err) {
          lastErr = err;
          console.warn(`[gemini] Model '${modelName}' attempt ${attempt} failed: ${err.message.split("\n")[0]}`);

          const isTransient =
            err.status === 503 ||
            err.status === 429 ||
            (err.message &&
              (err.message.includes("503") ||
                err.message.includes("high demand") ||
                err.message.includes("quota") ||
                err.message.includes("Service Unavailable")));

          if (isTransient && attempt === 1) {
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
          break; // Fallback to next model in sequence
        }
      }
    }
  }

  // 2. If Gemini fails or is unavailable, fallback to Mistral API
  if (process.env.MISTRAL_API_KEY) {
    try {
      console.warn("[ai] Gemini models failed or unavailable. Falling back to Mistral API...");
      return await callMistral(prompt);
    } catch (mistralErr) {
      console.error("[mistral] Mistral API fallback failed:", mistralErr.message);
      throw mistralErr;
    }
  }

  throw lastErr || new Error("No AI API provider available");
}

// Strips markdown code fences and parses JSON safely.
function parseJson(rawText) {
  const cleaned = rawText.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const jsonSlice = start !== -1 && end !== -1 ? cleaned.slice(start, end + 1) : cleaned;
  try {
    return JSON.parse(jsonSlice);
  } catch (err) {
    try {
      const sanitized = jsonSlice.replace(/[\u0000-\u001F]+/g, " ");
      return JSON.parse(sanitized);
    } catch (e) {
      throw new Error(`Failed to parse AI response: ${err.message}`);
    }
  }
}

/**
 * Generates the next interview question for a given role, aware of
 * previously asked questions so it doesn't repeat itself.
 */
async function generateQuestion({ roleTitle, focus, level, mode, resume, jobDescription, previousQuestions = [], questionNumber, totalQuestions }) {
  const historyBlock =
    previousQuestions.length > 0
      ? `Questions already asked in this session (do not repeat these or close variants):\n${previousQuestions
          .map((q, i) => `${i + 1}. ${q}`)
          .join("\n")}`
      : "This is the first question of the session.";

  const isFresher =
    (level && level.toLowerCase().includes("fresher")) ||
    (roleTitle && roleTitle.toLowerCase().includes("fresher"));

  let modeGuidance = "";
  if (mode === "star") {
    modeGuidance = "IMPORTANT: Frame this as a Behavioral STAR Method question (Situation, Task, Action, Result).";
  } else if (mode === "coding") {
    modeGuidance = "IMPORTANT: Ask a practical programming or algorithmic coding prompt suitable for live code submission.";
  } else if (mode === "timed") {
    modeGuidance = "IMPORTANT: Make the question concise and targeted for a fast-paced timed response.";
  }

  const contextBlock = [
    jobDescription ? `Target Job Description: ${jobDescription}` : "",
    resume ? `Candidate Resume Highlights: ${resume}` : "",
  ].filter(Boolean).join("\n");

  const prompt = `You are an experienced technical interviewer conducting a mock interview for the role of "${roleTitle}".
Role focus areas: ${focus}.
Role Level: ${level || (isFresher ? "Fresher / Entry Level" : "Senior / Upgraded")}.

${modeGuidance}

${contextBlock ? `Context:\n${contextBlock}\n` : ""}

${historyBlock}

Generate question number ${questionNumber} of ${totalQuestions}.
Rules:
- Strictly tailor the question difficulty and scenario to the candidate's level ("${roleTitle}") as specified above.
- One question only, concise (1-3 sentences).
- No preamble, no "Sure, here is a question".

Respond ONLY with strict JSON, no markdown fences, in this exact shape:
{"question": "the interview question text"}`;

  const text = await generateWithFallback(prompt);
  const parsed = parseJson(text);
  if (!parsed.question) throw new Error("AI did not return a question");
  return parsed.question;
}

/**
 * Evaluates a candidate's answer and returns structured scoring + feedback.
 */
async function evaluateAnswer({ roleTitle, focus, level, mode, question, answer }) {
  const isFresher =
    (level && level.toLowerCase().includes("fresher")) ||
    (roleTitle && roleTitle.toLowerCase().includes("fresher"));

  const levelCriteria = isFresher
    ? `Grade the answer according to FRESHER / ENTRY-LEVEL expectations. Be encouraging on fundamentals.`
    : `Grade the answer according to SENIOR / UPGRADED ARCHITECT expectations. Require high technical depth and clear trade-off analysis.`;

  const modeCriteria = mode === "star"
    ? "Evaluate if the candidate clearly structured their response using Situation, Task, Action, and Result."
    : mode === "coding"
    ? "Evaluate the code logic, efficiency, syntax, edge cases, and clarity."
    : "";

  const prompt = `You are grading a candidate's answer in a mock interview for the role of "${roleTitle}" (focus: ${focus}, Seniority: ${level || (isFresher ? "Fresher" : "Senior")}).

${levelCriteria}
${modeCriteria}

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

  const text = await generateWithFallback(prompt);
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
 * Generates an exemplary model answer for a question.
 */
async function generateModelAnswer({ question, roleTitle, focus, level }) {
  const prompt = `You are an expert technical hiring manager for the role of "${roleTitle}" (focus: ${focus}, seniority: ${level || "Senior"}).

Provide an exemplary benchmark answer to this interview question:
"${question}"

Format your response clearly:
1. Direct high-scoring answer
2. Key points that interviewers look for

Respond ONLY with strict JSON in this exact shape:
{"modelAnswer": "the clear exemplary model answer text"}`;

  const text = await generateWithFallback(prompt);
  const parsed = parseJson(text);
  return parsed.modelAnswer || "A strong answer should clearly state key principles, provide concise examples, and address edge cases or trade-offs.";
}

/**
 * Generates a short closing summary once the session is complete.
 */
async function generateSessionSummary({ roleTitle, overallAverage, questions }) {
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

  const text = await generateWithFallback(prompt);
  const parsed = parseJson(text);
  return parsed.summary || "Session complete. Review your per-question feedback above.";
}

module.exports = { generateQuestion, evaluateAnswer, generateModelAnswer, generateSessionSummary, callMistral };
