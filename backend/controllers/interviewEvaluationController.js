const {
  evaluateInterviewAnswer,
} = require("../services/ai/interviewEvaluationService");

const MIN_ANSWER_WORDS = 12;

function countWords(value) {
  return String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

async function evaluateAnswer(req, res) {
  try {
    const jobTitle = String(req.body.jobTitle || "").trim();
    const question = String(req.body.question || "").trim();
    const answer = String(req.body.answer || "").trim();

    if (!jobTitle || !question) {
      return res.status(400).json({
        status: "error",
        code: "MISSING_INTERVIEW_CONTEXT",
        message: "Job title and interview question are required.",
      });
    }

    const wordCount = countWords(answer);

    if (wordCount < MIN_ANSWER_WORDS) {
      return res.status(422).json({
        status: "too_short",
        code: "ANSWER_TOO_SHORT",
        message: `Your answer is too short to evaluate reliably. Please provide at least ${MIN_ANSWER_WORDS} words.`,
        wordCount,
        minimumWords: MIN_ANSWER_WORDS,
      });
    }

    const feedback = await evaluateInterviewAnswer({
      jobTitle,
      question,
      answer,
    });

    return res.json({
      status: "ok",
      feedback,
    });
  } catch (error) {
    console.error("Interview evaluation error:", error);
    return res.status(500).json({
      status: "error",
      message: "Unable to evaluate the answer right now. Please try again.",
    });
  }
}

module.exports = {
  evaluateAnswer,
};
