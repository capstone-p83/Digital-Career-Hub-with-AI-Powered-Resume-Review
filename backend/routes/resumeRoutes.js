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

router.post("/review", authMiddleware, upload.single("resume"), reviewResume);
router.get("/feedback/latest", authMiddleware, getLatestFeedback);
router.get("/feedback", authMiddleware, getAllFeedback);
router.get("/feedback/:id", authMiddleware, getFeedbackById);
router.delete("/feedback/:id", authMiddleware, deleteFeedbackById);
module.exports = router;