const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  evaluateAnswer,
} = require("../controllers/interviewEvaluationController");

const router = express.Router();

router.post("/evaluate", authMiddleware, evaluateAnswer);

module.exports = router;
