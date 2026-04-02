const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const bcrypt = require("bcryptjs");

const router = express.Router();

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT id, email, is_admin, created_at
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    return res.json({
      status: "ok",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to fetch current user",
      error: error.message,
    });
  }
});

router.put("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { email } = req.body;

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
      SET email = $1
      WHERE id = $2
      RETURNING id, email, is_admin, created_at
      `,
      [email, userId]
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
    console.error("Update current user error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to update user",
      error: error.message,
    });
  }
});

router.put("/update-password", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        status: "error",
        message: "Old password and new password are required",
      });
    }

    const result = await db.query(
      "SELECT password FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Old password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      "UPDATE users SET password = $1 WHERE id = $2",
      [hashedPassword, userId]
    );

    return res.json({
      status: "ok",
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update password error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to update password",
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