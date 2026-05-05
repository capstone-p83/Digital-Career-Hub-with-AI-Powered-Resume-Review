const express = require("express");
const { searchJobs } = require("../controllers/jobController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/search", authMiddleware, searchJobs);

module.exports = router;