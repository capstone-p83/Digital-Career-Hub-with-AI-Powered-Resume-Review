const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const adminUserRoutes = require("./adminUserRoutes");
const learningResourceRoutes = require("./learningResourceRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/admin/users", adminUserRoutes);
router.use("/learning-resources", learningResourceRoutes);

module.exports = router;