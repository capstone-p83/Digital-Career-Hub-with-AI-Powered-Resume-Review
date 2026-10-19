require("dotenv").config();
const db = require("../config/db");

async function addAiConsent() {
  try {
    await db.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS ai_consent BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS ai_consent_at TIMESTAMPTZ;
    `);

    console.log("AI consent fields added successfully");
  } catch (error) {
    console.error("Error adding AI consent fields:", error);
  } finally {
    await db.end();
  }
}

addAiConsent();
