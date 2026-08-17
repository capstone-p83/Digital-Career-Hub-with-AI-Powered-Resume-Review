const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  createInterviewQuestions,
} = require("../controllers/interviewController");

const router = express.Router();

router.post(
  "/questions",
  authMiddleware,
  createInterviewQuestions
);

module.exports = router;
