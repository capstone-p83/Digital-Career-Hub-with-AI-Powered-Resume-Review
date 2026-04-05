require("dotenv").config();
const db = require("../config/db");

async function clearUsers() {
  try {
    await db.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
    console.log("Users table cleared successfully");
  } catch (error) {
    console.error("Clear users error:", error);
  } finally {
    await db.end();
  }
}

clearUsers();