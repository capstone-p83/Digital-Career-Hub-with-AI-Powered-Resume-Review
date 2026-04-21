require("dotenv").config();
const bcrypt = require("bcryptjs");
const db = require("../config/db");

async function seedUsers() {
  const client = await db.connect();

  try {
    const users = [
      {
        email: "admin@example.com",
        password: "Admin@123",
        role: "admin",
        first_name: "System",
        last_name: "Admin",
        phone: "0400000001",
        date_of_birth: "2000-01-01",
      },
      {
        email: "staff@example.com",
        password: "Staff@123",
        role: "adminstaff",
        first_name: "Admin",
        last_name: "Staff",
        phone: "0400000002",
        date_of_birth: "2001-01-01",
      },
      {
        email: "user1@example.com",
        password: "User@123",
        role: "user",
        first_name: "Normal",
        last_name: "User",
        phone: "0400000003",
        date_of_birth: "2002-01-01",
      },
    ];

    for (const user of users) {
      const existingUser = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [user.email]
      );

      if (existingUser.rows.length > 0) {
        console.log(`Skipped existing user: ${user.email}`);
        continue;
      }

      await client.query("BEGIN");

      const hashedPassword = await bcrypt.hash(user.password, 10);

      const userResult = await client.query(
        `
        INSERT INTO users (email, password, role)
        VALUES ($1, $2, $3)
        RETURNING id
        `,
        [user.email, hashedPassword, user.role]
      );

      const userId = userResult.rows[0].id;

      await client.query(
        `
        INSERT INTO user_profile (user_id, first_name, last_name, phone, date_of_birth)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          userId,
          user.first_name,
          user.last_name,
          user.phone,
          user.date_of_birth,
        ]
      );

      await client.query("COMMIT");
      console.log(`Inserted user: ${user.email}`);
    }

    console.log("User seed completed");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seed users error:", error);
  } finally {
    client.release();
    await db.end();
  }
}

seedUsers();