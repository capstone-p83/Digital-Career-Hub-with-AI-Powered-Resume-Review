const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const allowedRoles = ["admin", "adminstaff", "user"];
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// =========================================================================
// GET CURRENT USER PORTAL (Syncs with page.tsx LOG 1 & LOG 2 fallbacks)
// =========================================================================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT
        u.id,
        u.email,
        u.role,
        u.is_active,
        u.deleted_at,
        u.created_at,
        u.subscription_tier,
        u.scans_remaining,
        up.id AS profile_id,
        up.user_id,
        up.first_name,
        up.last_name,
        up.phone,
        up.date_of_birth
      FROM users u
      LEFT JOIN user_profile up ON up.user_id = u.id
      WHERE u.id = $1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const row = result.rows[0];

    return res.json({
      status: "ok",
      user: {
        id: row.id,
        email: row.email,
        role: row.role,
        is_active: row.is_active,
        deleted_at: row.deleted_at,
        created_at: row.created_at,
        subscription_tier: row.subscription_tier,
        scans_remaining: row.scans_remaining,
        profile: {
          id: row.profile_id,
          user_id: row.user_id,
          first_name: row.first_name,
          last_name: row.last_name,
          phone: row.phone,
          date_of_birth: row.date_of_birth,
        },
      },
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

// =========================================================================
// UPDATE USER PROFILE DATA TRANSACTION
// =========================================================================
router.put("/me", authMiddleware, async (req, res) => {
  const client = await db.connect();

  try {
    const userId = req.user.id;
    const {
      email,
      first_name = null,
      last_name = null,
      phone = null,
      date_of_birth = null,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        status: "error",
        message: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const userCheck = await client.query(
      "SELECT id, is_active FROM users WHERE id = $1",
      [userId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (!userCheck.rows[0].is_active) {
      return res.status(403).json({
        status: "error",
        message: "This account has been deactivated",
      });
    }

    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1 AND id != $2",
      [normalizedEmail, userId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "Email already in use",
      });
    }

    await client.query("BEGIN");

    const userResult = await client.query(
      `
      UPDATE users
      SET email = $1
      WHERE id = $2
      RETURNING id, email, role, is_active, deleted_at, created_at
      `,
      [normalizedEmail, userId]
    );

    const profileCheck = await client.query(
      "SELECT id FROM user_profile WHERE user_id = $1",
      [userId]
    );

    let profileResult;

    if (profileCheck.rows.length === 0) {
      profileResult = await client.query(
        `
        INSERT INTO user_profile (user_id, first_name, last_name, phone, date_of_birth)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, first_name, last_name, phone, date_of_birth
        `,
        [userId, first_name, last_name, phone, date_of_birth]
      );
    } else {
      profileResult = await client.query(
        `
        UPDATE user_profile
        SET first_name = $1,
            last_name = $2,
            phone = $3,
            date_of_birth = $4
        WHERE user_id = $5
        RETURNING id, user_id, first_name, last_name, phone, date_of_birth
        `,
        [first_name, last_name, phone, date_of_birth, userId]
      );
    }

    await client.query("COMMIT");

    const updatedUser = userResult.rows[0];
    const token = generateToken(updatedUser);

    return res.json({
      status: "ok",
      message: "User updated successfully",
      user: {
        ...updatedUser,
        profile: profileResult.rows[0],
      },
      token,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Update current user error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to update user",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

// =========================================================================
// UPDATE USER CREDENTIAL PASSWORD ROUTE
// =========================================================================
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

    if (!passwordPattern.test(newPassword)) {
      return res.status(400).json({
        status: "error",
        message:
          "New password must be at least 8 characters and include 1 lowercase letter, 1 uppercase letter, and 1 special character",
      });
    }

    const result = await db.query(
      "SELECT password, is_active FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (!result.rows[0].is_active) {
      return res.status(403).json({
        status: "error",
        message: "This account has been deactivated",
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

    await db.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      userId,
    ]);

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

// =========================================================================
// ADMINISTRATIVE ROLES RE-ASSIGNMENT (Admin / Staff Only)
// =========================================================================
router.patch("/:id/role", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid role",
      });
    }

    const result = await db.query(
      `
      UPDATE users
      SET role = $1
      WHERE id = $2
      RETURNING id, email, role, is_active, deleted_at, created_at
      `,
      [role, id]
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

// =========================================================================
// SELF DEACTIVATION TERMINATION ROUTE
// =========================================================================
router.delete("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `
      UPDATE users
      SET is_active = false,
          deleted_at = NOW()
      WHERE id = $1 AND is_active = true
      RETURNING id, email, role, is_active, deleted_at
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Active user not found",
      });
    }

    return res.json({
      status: "ok",
      message: "Account deactivated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Deactivate account error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to deactivate account",
      error: error.message,
    });
  }
});

module.exports = router;