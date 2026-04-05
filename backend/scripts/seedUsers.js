require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("../config/db");

async function seedUsers() {
  try {
    const users = [
      {
        email: "admin@example.com",
        password: "admin123",
        is_admin: true,
      },
      {
        email: "user1@example.com",
        password: "user123",
        is_admin: false,
      },
      {
        email: "user2@example.com",
        password: "user123",
        is_admin: false,
      },
    ];

    for (const user of users) {
      const existingUser = await db.query(
        "SELECT id FROM users WHERE email = $1",
        [user.email]
      );

      if (existingUser.rows.length > 0) {
        console.log(`Skipped existing user: ${user.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);

      await db.query(
        `
        INSERT INTO users (email, password, is_admin)
        VALUES ($1, $2, $3)
        `,
        [user.email, hashedPassword, user.is_admin]
      );

      console.log(`Inserted user: ${user.email}`);
    }

    console.log("User seed completed");
  } catch (error) {
    console.error("Seed users error:", error);
  } finally {
    await db.end();
  }
}

seedUsers();