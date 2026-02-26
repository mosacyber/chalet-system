import fs from "fs";
import path from "path";
import { hash } from "bcryptjs";

const DATA_DIR = path.join(process.cwd(), "data");

const FILES = [
  "users.json",
  "chalets.json",
  "bookings.json",
  "payments.json",
  "reviews.json",
  "notifications.json",
  "contact-messages.json",
  "water-expenses.json",
  "link-pages.json",
  "link-items.json",
  "whatsapp-sessions.json",
  "site-settings.json",
  "visits.json",
];

let initialized = false;

export async function initDb() {
  if (initialized) return;
  initialized = true;

  // Create data directory
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Create empty JSON files if they don't exist
  for (const file of FILES) {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, "[]", "utf-8");
    }
  }

  // Seed default admin account
  const usersPath = path.join(DATA_DIR, "users.json");
  try {
    const users = JSON.parse(fs.readFileSync(usersPath, "utf-8") || "[]");
    const adminExists = users.some(
      (u: { email: string }) => u.email === "admin@chalets.com"
    );
    if (!adminExists) {
      const hashedPassword = await hash("Admin@123", 12);
      const now = new Date().toISOString();
      users.push({
        id: "admin-default-001",
        name: "مدير النظام",
        email: "admin@chalets.com",
        phone: null,
        password: hashedPassword,
        role: "ADMIN",
        image: null,
        createdAt: now,
        updatedAt: now,
      });
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), "utf-8");
      console.log("[db-init] Default admin account created");
    }
  } catch (err) {
    console.error("[db-init] Error seeding admin:", err);
  }

  console.log("[db-init] Database initialized");
}
