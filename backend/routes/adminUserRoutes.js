const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// GET ALL USERS
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

// UPDATE USER BY ADMIN
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;
    const { email, is_admin } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }

    const existingUser = await db.query(
      "SELECT id FROM users WHERE email = $1 AND id != $2",
      [email, userId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "Email already in use",
      });
    }

    const result = await db.query(
      `
      UPDATE users
      SET email = $1, is_admin = $2
      WHERE id = $3
      RETURNING id, email, is_admin, created_at
      `,
      [email, is_admin === true, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.json({
      status: "ok",
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Admin update user error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to update user",
      error: error.message,
    });
  }
});

// DELETE USER BY ADMIN
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await db.query(
      `
      DELETE FROM users
      WHERE id = $1
      RETURNING id, email, is_admin, created_at
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.json({
      status: "ok",
      message: "User deleted successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Admin delete user error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to delete user",
      error: error.message,
    });
  }
});

module.exports = router;