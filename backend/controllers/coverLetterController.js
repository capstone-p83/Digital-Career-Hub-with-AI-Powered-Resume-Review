const db = require("../config/db");
const {
  generateCoverLetterWithAI,
} = require("../services/ai/coverLetterService");

function getUserId(req) {
  return req.user?.id || req.user?.userId || req.user?.user_id;
}

async function getCurrentUser(userId) {
  const result = await db.query(
    `
    SELECT
      id,
      email,
      role,
      cover_letters_remaining
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  return result.rows[0] || null;
}

function countWords(text) {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function validateInput(body) {
  const missing = [];

  if (!String(body.fullName || "").trim()) {
    missing.push("full name");
  }

  if (!String(body.email || "").trim()) {
    missing.push("email");
  }

  if (!String(body.jobTitle || "").trim()) {
    missing.push("job title");
  }

  if (!String(body.company || "").trim()) {
    missing.push("company name");
  }

  const skillsWords = countWords(body.skills);
  const experienceWords = countWords(body.experience);

  if (skillsWords < 2) {
    missing.push("relevant skills");
  }

  if (experienceWords < 15) {
    missing.push("more details about relevant experience or projects");
  }

  if (
    !String(body.whyRole || "").trim() &&
    !String(body.whyCompany || "").trim()
  ) {
    missing.push("why you want the role or company");
  }

  return missing;
}

function calculateInputSize(body) {
  return countWords(
    [
      body.skills,
      body.experience,
      body.whyRole,
      body.whyCompany,
      body.jobDescription,
    ].join(" ")
  );
}

async function getCoverLetterStatus(req, res) {
  try {
    const userId = getUserId(req);

    const user = await getCurrentUser(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found.",
      });
    }

    return res.json({
      status: "ok",
      unlimited: user.role === "admin",
      remaining:
        user.role === "admin"
          ? null
          : user.cover_letters_remaining,
    });
  } catch (error) {
    console.error("Cover letter status error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to get cover letter usage status.",
    });
  }
}

async function generateCoverLetter(req, res) {
  try {
    const userId = getUserId(req);

    const user = await getCurrentUser(userId);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found.",
      });
    }

    const isAdmin = user.role === "admin";

    if (!isAdmin && user.cover_letters_remaining <= 0) {
      return res.status(403).json({
        status: "limit_reached",
        message:
          "You have used your 2 free Cover Letter generations.",
        remaining: 0,
      });
    }

    const missing = validateInput(req.body);

    if (missing.length > 0) {
      return res.status(400).json({
        status: "insufficient_information",
        message:
          "More information is needed to generate a strong cover letter.",
        missing,
      });
    }

    const inputWordCount = calculateInputSize(req.body);

    const inputWarning =
      inputWordCount > 800
        ? "You provided a large amount of information. The AI will prioritise the most relevant details and shorten the content to keep the cover letter within one page."
        : "";

    const result = await generateCoverLetterWithAI(req.body);

    if (
      !result ||
      result.status === "insufficient_information"
    ) {
      return res.status(400).json({
        status: "insufficient_information",
        message:
          result?.warning ||
          "More information is required to generate the cover letter.",
      });
    }

    if (
      !Array.isArray(result.paragraphs) ||
      result.paragraphs.length === 0
    ) {
      throw new Error("AI returned an invalid cover letter.");
    }

    let remaining = user.cover_letters_remaining;

    // Only deduct after successful AI generation
    if (!isAdmin) {
      const updateResult = await db.query(
        `
        UPDATE users
        SET cover_letters_remaining =
          GREATEST(cover_letters_remaining - 1, 0)
        WHERE id = $1
        RETURNING cover_letters_remaining
        `,
        [user.id]
      );

      remaining =
        updateResult.rows[0].cover_letters_remaining;
    }

    return res.status(200).json({
      status: "ok",

      cover_letter: {
        salutation:
          result.salutation ||
          `Dear ${
            req.body.hiringManager || "Hiring Manager"
          },`,

        paragraphs: result.paragraphs,

        closing:
          result.closing ||
          "Kind regards",
      },

      word_count:
        Number(result.word_count) || 0,

      was_shortened:
        Boolean(result.was_shortened),

      warning:
        inputWarning ||
        result.warning ||
        "",

      unlimited: isAdmin,

      remaining:
        isAdmin ? null : remaining,
    });
  } catch (error) {
    console.error("Generate cover letter error:", error);

    return res.status(500).json({
      status: "error",
      message:
        error.message ||
        "Failed to generate cover letter.",
    });
  }
}

module.exports = {
  getCoverLetterStatus,
  generateCoverLetter,
};