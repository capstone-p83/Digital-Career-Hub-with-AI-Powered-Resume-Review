const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, is_admin } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required",
      });
    }

    const existingUser = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `
      INSERT INTO users (email, password, is_admin)
      VALUES ($1, $2, $3)
      RETURNING id, email, is_admin, created_at
      `,
      [email, hashedPassword, is_admin === true]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      status: "ok",
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      status: "error",
      message: "Failed to register user",
      error: error.message,
    });
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

    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
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

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      status: "ok",
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
        created_at: user.created_at,
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
      is_admin: req.user.is_admin,
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