const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, email, is_admin, created_at
      FROM users
      ORDER BY id ASC
    `);

    return res.json({
      status: "ok",
      users: result.rows,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

module.exports = router;