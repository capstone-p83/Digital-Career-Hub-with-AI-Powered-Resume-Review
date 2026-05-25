const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const adminUserRoutes = require("./adminUserRoutes");
const commentRoutes = require("./commentRoutes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/admin/users", adminUserRoutes);
router.use("/comments", commentRoutes);

module.exports = router;