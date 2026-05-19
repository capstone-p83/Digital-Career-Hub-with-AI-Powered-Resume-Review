const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

const allowedRoles = ["admin", "adminstaff", "user"];

router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
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
        up.id AS profile_id,
        up.user_id,
        up.first_name,
        up.last_name,
        up.phone,
        up.date_of_birth
      FROM users u
      LEFT JOIN user_profile up ON up.user_id = u.id
      ORDER BY u.id ASC
      `
    );

    const users = result.rows.map((row) => ({
      id: row.id,
      email: row.email,
      role: row.role,
      is_active: row.is_active,
      deleted_at: row.deleted_at,
      created_at: row.created_at,
      profile: {
        id: row.profile_id,
        user_id: row.user_id,
        first_name: row.first_name,
        last_name: row.last_name,
        phone: row.phone,
        date_of_birth: row.date_of_birth,
      },
    }));

    return res.json({
      status: "ok",
      users,
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

router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const client = await db.connect();

  try {
    const userId = Number(req.params.id);
    const {
      email,
      role,
      first_name = null,
      last_name = null,
      phone = null,
      date_of_birth = null,
      is_active,
    } = req.body;

    if (!email || !role) {
      return res.status(400).json({
        status: "error",
        message: "Email and role are required",
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid role",
      });
    }

    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1 AND id != $2",
      [email.trim().toLowerCase(), userId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "Email already in use",
      });
    }

    await client.query("BEGIN");

    const shouldSetActive =
      typeof is_active === "boolean" ? is_active : undefined;

    let userResult;

    if (typeof shouldSetActive === "boolean") {
      userResult = await client.query(
        `
        UPDATE users
        SET email = $1,
            role = $2,
            is_active = $3,
            deleted_at = CASE
              WHEN $3 = false THEN COALESCE(deleted_at, NOW())
              ELSE NULL
            END
        WHERE id = $4
        RETURNING id, email, role, is_active, deleted_at, created_at
        `,
        [email.trim().toLowerCase(), role, shouldSetActive, userId]
      );
    } else {
      userResult = await client.query(
        `
        UPDATE users
        SET email = $1,
            role = $2
        WHERE id = $3
        RETURNING id, email, role, is_active, deleted_at, created_at
        `,
        [email.trim().toLowerCase(), role, userId]
      );
    }

    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

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

    return res.json({
      status: "ok",
      message: "User updated successfully",
      user: {
        ...userResult.rows[0],
        profile: profileResult.rows[0],
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Admin update user error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to update user",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await db.query(
      `
      UPDATE users
      SET is_active = false,
          deleted_at = NOW()
      WHERE id = $1 AND is_active = true
      RETURNING id, email, role, is_active, deleted_at, created_at
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
      message: "User deactivated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Admin deactivate user error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to deactivate user",
      error: error.message,
    });
  }
});

router.patch("/:id/restore", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.id;

    const result = await db.query(
      `
      UPDATE users
      SET is_active = true,
          deleted_at = NULL
      WHERE id = $1 AND is_active = false
      RETURNING id, email, role, is_active, deleted_at, created_at
      `,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Inactive user not found",
      });
    }

    return res.json({
      status: "ok",
      message: "User restored successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Restore user error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to restore user",
      error: error.message,
    });
  }
});

module.exports = router;