const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const adminUserRoutes = require("./adminUserRoutes");
const commentRoutes = require("./commentRoutes");
const learningResourceRoutes = require("./learningResourceRoutes");
const resumeRoutes = require("./resumeRoutes");
const jobRoutes = require("./jobRoutes");
const chatRoutes = require("./chatRoutes");
const interviewRoutes = require("./interviewRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/learning-resources", learningResourceRoutes);
router.use("/resumes", resumeRoutes);
router.use("/jobs", jobRoutes);
router.use("/users", userRoutes);
router.use("/admin/users", adminUserRoutes);
router.use("/comments", commentRoutes);
router.use("/chat", chatRoutes);
router.use("/interview", interviewRoutes);

module.exports = router;