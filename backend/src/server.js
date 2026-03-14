require("dotenv").config();

const express = require("express");
const cors = require("cors");

// for future database connection test, we can return the result of the query
// const db = require("../config/db");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/api/health", async (req, res) => {
  try {
    // for future database connection test, we can return the result of the query
    // const [rows] = await db.query("SELECT 1 AS status");

    res.json({
      status: "ok",
      message: "Backend working",
      // for future database connection test, we can return the result of the query
      // database: rows[0],
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});