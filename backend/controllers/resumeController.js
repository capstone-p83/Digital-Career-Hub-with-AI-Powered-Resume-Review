const pool = require("../config/db");
const { parseResumeFile } = require("../utils/resumeParser");
const { analyzeResumeWithAI } = require("../services/ai/aiService");
const {
  sanitizePersonalInfo,
} = require("../services/privacy/sanitizePersonalInfo");

const FREE_USER_DAILY_LIMIT = 3;

function getUserId(req) {
  return req.user?.id || req.user?.userId || req.user?.user_id;
}

async function getCurrentUser(req) {
  const userId = getUserId(req);

  if (!userId) {
    return null;
  }

  const result = await pool.query(
    `
    SELECT
      u.id,
      u.role,
      u.subscription_tier,
      u.scans_remaining,
      up.first_name,
      up.last_name
    FROM users u
    LEFT JOIN user_profile up ON up.user_id = u.id
    WHERE u.id = $1
    LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] || null;
}

function getFileType(file) {
  if (file.mimetype === "application/pdf") {
    return "PDF";
  }

  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "DOCX";
  }

  return "UNKNOWN";
}

function isAdminRole(role) {
  return role === "admin" || role === "adminstaff";
}

async function checkScanLimit(user) {
  if (isAdminRole(user.role)) {
    return { allowed: true };
  }

  if (user.subscription_tier === "free" && user.scans_remaining <= 0) {
    return {
      allowed: false,
      message:
        "You have used your 2 free scans. Upgrade to Pro for unlimited access!",
    };
  }

  return { allowed: true };
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeAnalysis(
  aiResult,
  targetJobRole,
  targetJobDescription
) {
  return {
    score: Number.isFinite(Number(aiResult.score))
      ? Math.max(
          0,
          Math.min(100, Math.round(Number(aiResult.score)))
        )
      : 0,

    summary:
      typeof aiResult.summary === "string"
        ? aiResult.summary
        : "Resume analysis completed.",

    target_job_role: targetJobRole,
    target_job_description: targetJobDescription || null,

    confidence:
      typeof aiResult.confidence === "string"
        ? aiResult.confidence
        : "medium",

    evaluation_basis:
      typeof aiResult.evaluation_basis === "string"
        ? aiResult.evaluation_basis
        : "The resume was evaluated against the target position.",

    missing_resume_sections: safeArray(
      aiResult.missing_resume_sections
    ),

    missing_job_information: Boolean(
      aiResult.missing_job_information
    ),

    impact_explanation:
      typeof aiResult.impact_explanation === "string"
        ? aiResult.impact_explanation
        : "",

    strengths: safeArray(aiResult.strengths),

    areas_for_improvement: safeArray(
      aiResult.areas_for_improvement
    ),

    actionable_suggestions: safeArray(
      aiResult.actionable_suggestions
    ),

    matched_skills: safeArray(aiResult.matched_skills),
    missing_skills: safeArray(aiResult.missing_skills),
    extra_skills: safeArray(aiResult.extra_skills),

    resume_data: {
      work_experience: safeArray(
        aiResult.resume_data?.work_experience
      ),
      skills: safeArray(aiResult.resume_data?.skills),
      education: safeArray(aiResult.resume_data?.education),
      projects: safeArray(aiResult.resume_data?.projects),
      certifications: safeArray(
        aiResult.resume_data?.certifications
      ),
      missing_sections: safeArray(
        aiResult.resume_data?.missing_sections
      ),
    },
  };
}

async function reviewResume(req, res) {
  const client = await pool.connect();

  try {
    const currentUser = await getCurrentUser(req);

    console.log(
      "BACKEND LOG A: Current User Role:",
      currentUser?.role,
      "Tier:",
      currentUser?.subscription_tier
    );

    if (!currentUser) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized. Please log in first.",
      });
    }

    const isFreeTier =
      currentUser.subscription_tier === "free";

    const isAdmin = isAdminRole(currentUser.role);

    if (
      !isAdmin &&
      isFreeTier &&
      currentUser.scans_remaining <= 0
    ) {
      return res.status(403).json({
        status: "error",
        message:
          "You have reached your 2 free resume reviews. Please upgrade to Pro for unlimited access.",
      });
    }

    const file = req.file;

    const targetJobRole = String(
      req.body.target_job_role || ""
    ).trim();

    const targetJobDescription = String(
      req.body.target_job_description || ""
    ).trim();

    if (!file) {
      return res.status(400).json({
        status: "error",
        message: "Resume file is required.",
      });
    }

    if (!targetJobRole) {
      return res.status(400).json({
        status: "error",
        message: "Target job role is required.",
      });
    }

    const fileType = getFileType(file);
    const extractedText = await parseResumeFile(file);

    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({
        status: "error",
        message:
          "Could not extract enough readable text from the resume. Please upload a clearer PDF or DOCX file.",
      });
    }

    // Remove personal information before sending the resume to AI.
    // The original extracted text remains unchanged.
    const sanitizedResumeText = sanitizePersonalInfo(
      extractedText,
      currentUser
    );

    const aiResult = await analyzeResumeWithAI({
      resumeText: sanitizedResumeText,
      targetJobRole,
      targetJobDescription,
    });

    const analysis = normalizeAnalysis(
      aiResult,
      targetJobRole,
      targetJobDescription
    );

    await client.query("BEGIN");

    if (
      currentUser.role === "user" &&
      currentUser.subscription_tier === "free"
    ) {
      console.log(
        "BACKEND LOG B: Attempting to decrement scan for user ID:",
        currentUser.id
      );

      const dbUpdate = await client.query(
        `
        UPDATE users
        SET scans_remaining = scans_remaining - 1
        WHERE id = $1
        RETURNING scans_remaining
        `,
        [currentUser.id]
      );

      console.log(
        "BACKEND LOG C: Database now says scans remaining:",
        dbUpdate.rows[0]?.scans_remaining
      );
    } else {
      console.log(
        "BACKEND LOG D: Skipped decrement. Reason: Not a free user or admin role."
      );
    }

    const resumeInsert = await client.query(
      `
      INSERT INTO resumes (
        user_id,
        file_path,
        target_job_role,
        target_job_description,
        original_file_name,
        file_type,
        extracted_text,
        work_experience,
        skills,
        education,
        projects,
        certifications,
        missing_sections,
        created_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8::jsonb, $9::jsonb, $10::jsonb,
        $11::jsonb, $12::jsonb, $13::jsonb,
        NOW()
      )
      RETURNING id
      `,
      [
        currentUser.id,
        null,
        targetJobRole,
        targetJobDescription || null,
        file.originalname,
        fileType,

        // Keep the original extracted text for internal storage.
        extractedText,

        JSON.stringify(
          analysis.resume_data.work_experience
        ),
        JSON.stringify(analysis.resume_data.skills),
        JSON.stringify(analysis.resume_data.education),
        JSON.stringify(analysis.resume_data.projects),
        JSON.stringify(
          analysis.resume_data.certifications
        ),
        JSON.stringify(
          analysis.resume_data.missing_sections
        ),
      ]
    );

    const resumeId = resumeInsert.rows[0].id;

    const feedbackInsert = await client.query(
      `
      INSERT INTO resume_feedback (
        user_id,
        resume_id,
        target_job_role,
        score,
        confidence,
        evaluation_basis,
        missing_job_information,
        impact_explanation,
        resume_text_truncated,
        resume_length_warning,
        job_description_truncated,
        job_description_warning,
        created_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12, NOW()
      )
      RETURNING id, created_at
      `,
      [
        currentUser.id,
        resumeId,
        targetJobRole,
        analysis.score,
        analysis.confidence,
        analysis.evaluation_basis,
        analysis.missing_job_information,
        analysis.impact_explanation,
        analysis.resume_text_truncated,
        analysis.resume_length_warning,
        analysis.job_description_truncated,
        analysis.job_description_warning,
      ]
    );

    const feedbackId = feedbackInsert.rows[0].id;

    await client.query(
      `
      INSERT INTO feedback_details (
        feedback_id,
        strengths,
        improvements,
        suggestions,
        matched_skills,
        missing_skills,
        extra_skills
      )
      VALUES (
        $1,
        $2::jsonb,
        $3::jsonb,
        $4::jsonb,
        $5::jsonb,
        $6::jsonb,
        $7::jsonb
      )
      `,
      [
        feedbackId,
        JSON.stringify(analysis.strengths),
        JSON.stringify(
          analysis.areas_for_improvement
        ),
        JSON.stringify(
          analysis.actionable_suggestions
        ),
        JSON.stringify(analysis.matched_skills),
        JSON.stringify(analysis.missing_skills),
        JSON.stringify(analysis.extra_skills),
      ]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      status: "ok",
      analysis: {
        feedback_id: feedbackId,
        resume_id: resumeId,
        created_at: feedbackInsert.rows[0].created_at,
        ...analysis,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Resume review error:", error);

    return res.status(500).json({
      status: "error",
      message:
        error.message ||
        "Failed to analyze resume. Please try again later.",
    });
  } finally {
    client.release();
  }
}

function mapFeedbackRow(row) {
  return {
    feedback_id: row.feedback_id,
    resume_id: row.resume_id,
    created_at: row.created_at,
    score: row.score,

    summary:
      row.summary || "Resume analysis completed.",

    target_job_role: row.target_job_role,

    target_job_description:
      row.target_job_description,

    confidence: row.confidence || "medium",

    evaluation_basis:
      row.evaluation_basis || "",

    missing_resume_sections:
      row.missing_sections || [],

    missing_job_information: Boolean(
      row.missing_job_information
    ),

    resume_text_truncated: Boolean(
      row.resume_text_truncated
    ),

    resume_length_warning:
      row.resume_length_warning || "",

    job_description_truncated: Boolean(
      row.job_description_truncated
    ),

    job_description_warning:
      row.job_description_warning || "",

    impact_explanation:
      row.impact_explanation || "",

    strengths: row.strengths || [],

    areas_for_improvement:
      row.improvements || [],

    actionable_suggestions:
      row.suggestions || [],

    matched_skills: row.matched_skills || [],
    missing_skills: row.missing_skills || [],
    extra_skills: row.extra_skills || [],
  };
}

async function getLatestFeedback(req, res) {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized. Please log in first.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        rf.id AS feedback_id,
        rf.resume_id,
        rf.score,
        rf.target_job_role,
        rf.confidence,
        rf.evaluation_basis,
        rf.missing_job_information,
        rf.impact_explanation,
        rf.resume_text_truncated,
        rf.resume_length_warning,
        rf.job_description_truncated,
        rf.job_description_warning,
        rf.created_at,
        r.target_job_description,
        r.missing_sections,
        fd.strengths,
        fd.improvements,
        fd.suggestions,
        fd.matched_skills,
        fd.missing_skills,
        fd.extra_skills
      FROM resume_feedback rf
      JOIN resumes r ON r.id = rf.resume_id
      LEFT JOIN feedback_details fd
        ON fd.feedback_id = rf.id
      WHERE rf.user_id = $1
      ORDER BY rf.created_at DESC
      LIMIT 1
      `,
      [currentUser.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "No resume feedback found.",
      });
    }

    return res.json({
      status: "ok",
      analysis: mapFeedbackRow(result.rows[0]),
    });
  } catch (error) {
    console.error(
      "Get latest feedback error:",
      error
    );

    return res.status(500).json({
      status: "error",
      message: "Failed to get latest feedback.",
    });
  }
}

async function getAllFeedback(req, res) {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized. Please log in first.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        rf.id AS feedback_id,
        rf.resume_id,
        rf.score,
        rf.target_job_role,
        rf.confidence,
        rf.created_at,
        r.target_job_description
      FROM resume_feedback rf
      JOIN resumes r ON r.id = rf.resume_id
      WHERE rf.user_id = $1
      ORDER BY rf.created_at DESC
      `,
      [currentUser.id]
    );

    return res.json({
      status: "ok",
      feedbacks: result.rows,
    });
  } catch (error) {
    console.error(
      "Get all feedback error:",
      error
    );

    return res.status(500).json({
      status: "error",
      message: "Failed to get feedback history.",
    });
  }
}

async function getFeedbackById(req, res) {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized. Please log in first.",
      });
    }

    const feedbackId = Number(req.params.id);

    if (!Number.isInteger(feedbackId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid feedback ID.",
      });
    }

    const result = await pool.query(
      `
      SELECT
        rf.id AS feedback_id,
        rf.resume_id,
        rf.score,
        rf.target_job_role,
        rf.confidence,
        rf.evaluation_basis,
        rf.missing_job_information,
        rf.impact_explanation,
        rf.resume_text_truncated,
        rf.resume_length_warning,
        rf.job_description_truncated,
        rf.job_description_warning,
        rf.created_at,
        r.target_job_description,
        r.missing_sections,
        fd.strengths,
        fd.improvements,
        fd.suggestions,
        fd.matched_skills,
        fd.missing_skills,
        fd.extra_skills
      FROM resume_feedback rf
      JOIN resumes r ON r.id = rf.resume_id
      LEFT JOIN feedback_details fd
        ON fd.feedback_id = rf.id
      WHERE rf.id = $1
      AND rf.user_id = $2
      LIMIT 1
      `,
      [feedbackId, currentUser.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Feedback not found.",
      });
    }

    return res.json({
      status: "ok",
      analysis: mapFeedbackRow(result.rows[0]),
    });
  } catch (error) {
    console.error(
      "Get feedback by ID error:",
      error
    );

    return res.status(500).json({
      status: "error",
      message: "Failed to get feedback details.",
    });
  }
}

async function deleteFeedbackById(req, res) {
  try {
    const currentUser = await getCurrentUser(req);

    if (!currentUser) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized. Please log in first.",
      });
    }

    const feedbackId = Number(req.params.id);

    if (!Number.isInteger(feedbackId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid feedback ID.",
      });
    }

    const result = await pool.query(
      `
      DELETE FROM resume_feedback
      WHERE id = $1
      AND user_id = $2
      RETURNING id
      `,
      [feedbackId, currentUser.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message:
          "Feedback not found or you do not have permission to delete it.",
      });
    }

    return res.json({
      status: "ok",
      message: "Feedback deleted successfully.",
      deleted_id: feedbackId,
    });
  } catch (error) {
    console.error(
      "Delete feedback error:",
      error
    );

    return res.status(500).json({
      status: "error",
      message: "Failed to delete feedback.",
    });
  }
}

module.exports = {
  reviewResume,
  getLatestFeedback,
  getAllFeedback,
  getFeedbackById,
  deleteFeedbackById,
};