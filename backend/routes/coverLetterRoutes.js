const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");

const {
  getCoverLetterStatus,
  generateCoverLetter,
} = require("../controllers/coverLetterController");

const router = express.Router();

router.get(
  "/status",
  authMiddleware,
  getCoverLetterStatus
);

router.post(
  "/generate",
  authMiddleware,
  generateCoverLetter
);

module.exports = router;