const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

async function main() {
  const prisma = new PrismaClient();
  try {
    // Check if User table already exists
    const tables = await prisma.$queryRawUnsafe(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'User'`
    );

    if (tables.length > 0) {
      console.log("Database tables already exist, skipping migration.");
      return;
    }

    console.log("Creating database tables...");

    const sqlPath = path.join(__dirname, "migrations", "0_init", "migration.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    // Split by semicolons and execute each statement
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const stmt of statements) {
      try {
        await prisma.$executeRawUnsafe(stmt);
      } catch (err) {
        // Skip if already exists
        if (!err.message.includes("already exists")) {
          console.error("SQL Error:", err.message);
        }
      }
    }

    console.log("Database tables created successfully!");
  } catch (error) {
    console.error("Migration error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
