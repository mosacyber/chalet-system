import { JsonDB } from "./json-db";
import "./log-store";
import type {
  User,
  Chalet,
  Booking,
  Payment,
  Review,
  Notification,
  ContactMessage,
  WaterExpense,
  LinkPage,
  LinkItem,
  WhatsAppSession,
  SiteSetting,
  Visit,
} from "./types";
import { initDb } from "./db-init";

export const db = {
  users: new JsonDB<User>("data/users.json"),
  chalets: new JsonDB<Chalet>("data/chalets.json"),
  bookings: new JsonDB<Booking>("data/bookings.json"),
  payments: new JsonDB<Payment>("data/payments.json"),
  reviews: new JsonDB<Review>("data/reviews.json"),
  notifications: new JsonDB<Notification>("data/notifications.json"),
  contactMessages: new JsonDB<ContactMessage>("data/contact-messages.json"),
  waterExpenses: new JsonDB<WaterExpense>("data/water-expenses.json"),
  linkPages: new JsonDB<LinkPage>("data/link-pages.json"),
  linkItems: new JsonDB<LinkItem>("data/link-items.json"),
  whatsappSessions: new JsonDB<WhatsAppSession>("data/whatsapp-sessions.json"),
  siteSettings: new JsonDB<SiteSetting>("data/site-settings.json"),
  visits: new JsonDB<Visit>("data/visits.json"),
};

// Initialize database on first import
initDb()
  .then(() => {
    // Clear cache after init since db-init writes directly to files
    db.users.invalidateCache();
  })
  .catch((e) => console.error("[db] init error:", e));
