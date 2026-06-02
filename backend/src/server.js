require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("../config/db");
const routes = require("../routes");

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
    const result = await db.query("SELECT NOW() AS current_time");

    res.json({
      status: "ok",
      message: "Backend and database are working",
      databaseTime: result.rows[0].current_time,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: error.message || "Unknown database error",
    });
  }
});

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});