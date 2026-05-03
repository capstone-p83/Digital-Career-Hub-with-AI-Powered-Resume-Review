const { buildResumeReviewPrompt } = require("./prompt");
const { analyzeWithDeepSeek } = require("./providers/deepseekProvider");
const { analyzeWithGemini } = require("./providers/geminiProvider");
const { analyzeWithOpenAI } = require("./providers/openaiProvider");

async function analyzeResumeWithAI({
  resumeText,
  targetJobRole,
  targetJobDescription,
}) {
  const provider = (process.env.AI_PROVIDER || "deepseek").toLowerCase();

  const prompt = buildResumeReviewPrompt({
    resumeText,
    targetJobRole,
    targetJobDescription,
  });

  if (provider === "deepseek") {
    return analyzeWithDeepSeek(prompt);
  }

  if (provider === "gemini") {
    return analyzeWithGemini(prompt);
  }

  if (provider === "openai") {
    return analyzeWithOpenAI(prompt);
  }

  throw new Error(
    "Invalid AI_PROVIDER. Use deepseek, gemini, or openai."
  );
}

module.exports = {
  analyzeResumeWithAI,
};