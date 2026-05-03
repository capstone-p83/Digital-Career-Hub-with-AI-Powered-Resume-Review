const { GoogleGenAI } = require("@google/genai");

const MODEL_ID = "gemini-2.0-flash";

const MAX_RESUME_CHARS = 28000;

function normalizeAnalysis(parsed, fallbackRole) {
  const feedback = parsed.feedback || {};
  const strengths = Array.isArray(feedback.strengths)
    ? feedback.strengths.map(String)
    : [];
  const weaknesses = Array.isArray(feedback.weaknesses)
    ? feedback.weaknesses.map(String)
    : [];
  const suggestions = Array.isArray(feedback.suggestions)
    ? feedback.suggestions.map(String)
    : [];

  let score = Number(parsed.score);
  if (!Number.isFinite(score)) score = 70;
  score = Math.min(100, Math.max(0, Math.round(score)));

  let keywords = Array.isArray(parsed.keywords) ? parsed.keywords : [];
  keywords = keywords
    .filter((k) => k && typeof k.word === "string")
    .map((k) => ({
      word: k.word,
      found: Boolean(k.found),
    }));

  return {
    score,
    summary:
      typeof parsed.summary === "string"
        ? parsed.summary
        : `Feedback generated for your target role: ${fallbackRole}.`,
    feedback: {
      strengths,
      weaknesses,
      suggestions,
    },
    keywords,
  };
}

/**
 * @param {string} resumeText
 * @param {string} targetJobRole
 * @param {string} targetJobDescription
 */
async function analyzeResumeGemini(
  resumeText,
  targetJobRole,
  targetJobDescription
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err = new Error(
      "Resume analysis is not configured (missing GEMINI_API_KEY on the server)."
    );
    err.statusCode = 503;
    throw err;
  }

  const clipped = resumeText.slice(0, MAX_RESUME_CHARS);
  const jobExtra = targetJobDescription
    ? `\nJob posting / description context:\n${targetJobDescription.slice(0, 8000)}\n`
    : "";

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: MODEL_ID,
    contents: `
You are a professional career coach. Analyze the resume text for the target job role: "${targetJobRole}".
${jobExtra}
Return JSON only (no markdown) with this exact shape:
{
  "score": number (0-100),
  "summary": string (one short paragraph for the candidate),
  "feedback": {
    "strengths": string[] (3-6 items),
    "weaknesses": string[] (3-6 items),
    "suggestions": string[] (3-6 actionable items tailored to the role)
  },
  "keywords": [{ "word": string, "found": boolean }] (5-12 ATS-relevant keywords for this role; set found true if the resume text clearly includes that keyword or a close variant)
}

Resume text:
${clipped}
`,
    config: {
      responseMimeType: "application/json",
    },
  });

  const text = response.text;
  let parsed;
  try {
    parsed = JSON.parse(text || "{}");
  } catch {
    const err = new Error("AI returned invalid JSON");
    err.statusCode = 502;
    throw err;
  }

  return normalizeAnalysis(parsed, targetJobRole);
}

module.exports = { analyzeResumeGemini, normalizeAnalysis };
