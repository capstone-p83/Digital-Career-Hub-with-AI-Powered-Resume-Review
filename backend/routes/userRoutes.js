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

//admin updates user role (to either admin or back to user)
router.patch("/:id/role", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_admin } = req.body;

    if (typeof is_admin !== "boolean") {
      return res.status(400).json({
        status: "error",
        message: "is_admin must be a boolean value",
      });
    }

    const result = await db.query(
      `UPDATE users 
       SET is_admin = $1 
       WHERE id = $2 
       RETURNING id, email, is_admin, created_at`,
      [is_admin, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.json({
      status: "ok",
      message: "User role updated successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error("Update role error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to update user role",
      error: error.message,
    });
  }
});

//user deletes their own account
router.delete("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `DELETE FROM users WHERE id = $1 RETURNING id, email`,
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
      message: "Account deleted successfully",
      user: result.rows[0],
    });

  } catch (error) {
    console.error("Delete account error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to delete account",
      error: error.message,
    });
  }
});

module.exports = router;