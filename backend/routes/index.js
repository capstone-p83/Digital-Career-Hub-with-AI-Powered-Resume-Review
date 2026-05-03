const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const adminUserRoutes = require("./adminUserRoutes");
const resumeRoutes = require("./resumeRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/admin/users", adminUserRoutes);
router.use("/resume", resumeRoutes);

module.exports = router;