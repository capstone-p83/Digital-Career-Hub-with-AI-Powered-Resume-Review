const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const { extractResumeText } = require("../services/extractResumeText");
const { analyzeResumeGemini } = require("../services/analyzeResumeGemini");

const router = express.Router();

const ALLOWED_MIMES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.has(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(new Error("Please upload a PDF or DOCX file."));
  },
});

function handleMulter(req, res, next) {
  upload.single("resume")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          status: "error",
          message: "File size should not exceed 5MB.",
        });
      }
      return res.status(400).json({
        status: "error",
        message: err.message || "Upload failed",
      });
    }
    if (err) {
      return res.status(400).json({
        status: "error",
        message: err.message || "Upload failed",
      });
    }
    next();
  });
}

router.post("/review", authMiddleware, handleMulter, async (req, res) => {
  try {
    const target_job_role = String(req.body.target_job_role || "").trim();
    const target_job_description = String(
      req.body.target_job_description || ""
    ).trim();

    if (!target_job_role) {
      return res.status(400).json({
        status: "error",
        message: "target_job_role is required",
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        status: "error",
        message: "resume file is required",
      });
    }

    let resumeText;
    try {
      resumeText = await extractResumeText(req.file.buffer, req.file.mimetype);
    } catch (extractErr) {
      const code = extractErr.statusCode || 400;
      return res.status(code).json({
        status: "error",
        message: extractErr.message || "Could not read resume file",
      });
    }

    if (!resumeText || resumeText.length < 40) {
      return res.status(400).json({
        status: "error",
        message:
          "Could not extract enough text from this file. Try another PDF or DOCX export.",
      });
    }

    const analysis = await analyzeResumeGemini(
      resumeText,
      target_job_role,
      target_job_description
    );

    return res.status(200).json({
      status: "ok",
      analysis,
    });
  } catch (err) {
    console.error("Resume review error:", err);
    const code = err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
    return res.status(code).json({
      status: "error",
      message: err.message || "Resume review failed",
    });
  }
});

module.exports = router;
