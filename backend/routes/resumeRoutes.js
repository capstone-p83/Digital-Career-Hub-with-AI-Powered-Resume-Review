const db = require("../config/db"); // This allows the file to talk to Neon
const express = require("express");
const multer = require("multer");
const {
  reviewResume,
  getLatestFeedback,
  getAllFeedback,
  getFeedbackById,
  deleteFeedbackById,
} = require("../controllers/resumeController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Add this block after the 'authMiddleware' import
const checkScanLimit = async (req, res, next) => {
  try {
    const userId = req.user.id; 
    
    // Fetch the new columns specifically
    const result = await db.query(
      'SELECT subscription_tier, scans_remaining, role FROM users WHERE id = $1', 
      [userId]
    );
    
    const dbUser = result.rows[0];
    if (!dbUser) return res.status(404).json({ error: "User not found" });

    // Allow admins to bypass limits
    if (dbUser.role === 'admin' || dbUser.role === 'adminstaff') {
      return next();
    }

    if (dbUser.subscription_tier === 'free' && dbUser.scans_remaining <= 0) {
      return res.status(403).json({
        status: "error",
        message: "You've used your 2 free scans. Upgrade to Pro!"
      });
    }
    next();
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only PDF and DOCX files are supported."));
    }

    cb(null, true);
  },
});

router.post("/review", authMiddleware, checkScanLimit, upload.single("resume"), reviewResume);
router.get("/feedback/latest", authMiddleware, getLatestFeedback);
router.get("/feedback", authMiddleware, getAllFeedback);
router.get("/feedback/:id", authMiddleware, getFeedbackById);
router.delete("/feedback/:id", authMiddleware, deleteFeedbackById);
module.exports = router;