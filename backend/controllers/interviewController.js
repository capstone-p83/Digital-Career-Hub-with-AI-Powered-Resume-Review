const {
  generateInterviewQuestions,
} = require("../services/ai/interviewService");

async function createInterviewQuestions(req, res) {
  try {
    const jobTitle = String(
      req.body.jobTitle || ""
    ).trim();

    const jobDescription = String(
      req.body.jobDescription || ""
    ).trim();

    const language =
      req.body.language === "bn" ? "bn" : "en";

    if (!jobTitle) {
      return res.status(400).json({
        status: "error",
        message: "Job title is required.",
      });
    }

    const questions =
      await generateInterviewQuestions({
        jobTitle,
        jobDescription,
        language,
      });

    return res.status(200).json({
      status: "ok",
      jobTitle,
      questions,
    });
  } catch (error) {
    console.error(
      "Interview question generation error:",
      error
    );

    return res.status(500).json({
      status: "error",
      message:
        error.message ||
        "Failed to generate interview questions.",
    });
  }
}

module.exports = {
  createInterviewQuestions,
};
