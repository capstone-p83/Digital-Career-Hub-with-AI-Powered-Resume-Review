const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;

const allowedRoles = ["admin", "adminstaff", "user"];

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

router.post("/register", async (req, res) => {
  const client = await db.connect();

  try {
    const {
      email,
      password,
      role = "user",
      first_name = null,
      last_name = null,
      phone = null,
      date_of_birth = null,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!emailPattern.test(trimmedEmail)) {
      return res.status(400).json({
        status: "error",
        message: "Please enter a valid email address",
      });
    }

    if (!passwordPattern.test(password)) {
      return res.status(400).json({
        status: "error",
        message:
          "Password must be at least 8 characters and include 1 lowercase letter, 1 uppercase letter, and 1 special character",
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid role",
      });
    }

    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [trimmedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "User already exists",
      });
    }

    await client.query("BEGIN");

    const hashedPassword = await bcrypt.hash(password, 10);

    const userResult = await client.query(
      `
      INSERT INTO users (email, password, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, created_at
      `,
      [trimmedEmail, hashedPassword, role]
    );

    const user = userResult.rows[0];

    const profileResult = await client.query(
      `
      INSERT INTO user_profile (user_id, first_name, last_name, phone, date_of_birth)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, user_id, first_name, last_name, phone, date_of_birth
      `,
      [user.id, first_name, last_name, phone, date_of_birth]
    );

    await client.query("COMMIT");

    const token = generateToken(user);

    return res.status(201).json({
      status: "ok",
      message: "User registered successfully",
      user: {
        ...user,
        profile: profileResult.rows[0],
      },
      token,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Register error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to register user",
      error: error.message,
    });
  } finally {
    client.release();
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    const result = await db.query(
      `
      SELECT
        u.id,
        u.email,
        u.password,
        u.role,
        u.created_at,
        up.id AS profile_id,
        up.user_id,
        up.first_name,
        up.last_name,
        up.phone,
        up.date_of_birth
      FROM users u
      LEFT JOIN user_profile up ON up.user_id = u.id
      WHERE u.email = $1
      `,
      [trimmedEmail]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      status: "ok",
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        profile: {
          id: user.profile_id,
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          date_of_birth: user.date_of_birth,
        },
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to login",
      error: error.message,
    });
  }
});

router.post("/logout", authMiddleware, (req, res) => {
  return res.json({
    status: "ok",
    message: "Logged out successfully",
  });
});

router.get("/admin/check", authMiddleware, async (req, res) => {
  try {
    return res.json({
      status: "ok",
      isAdmin: req.user.role === "admin",
      role: req.user.role,
      user: req.user,
    });
  } catch (error) {
    console.error("Admin check error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to check admin status",
      error: error.message,
    });
  }
});

module.exports = router;