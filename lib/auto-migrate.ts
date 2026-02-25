import { PrismaClient } from "@prisma/client";

let migrated = false;

export async function autoMigrate(prisma: PrismaClient) {
  if (migrated) return;
  migrated = true;

  const run = async (sql: string) => {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch {
      // Ignore errors (already exists, duplicate, etc.)
    }
  };

  try {
    // ── V0: Enums ──
    await run(`DO $$ BEGIN CREATE TYPE "Role" AS ENUM ('ADMIN', 'CUSTOMER', 'OWNER'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
    await run(`DO $$ BEGIN CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'BLOCKED'); EXCEPTION WHEN duplicate_object THEN null; END $$`);
    await run(`DO $$ BEGIN CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED'); EXCEPTION WHEN duplicate_object THEN null; END $$`);

    // ── V0: Core tables ──
    await run(`CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "phone" TEXT,
      "password" TEXT NOT NULL,
      "role" "Role" NOT NULL DEFAULT 'OWNER',
      "image" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    )`);
    await run(`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`);

    await run(`CREATE TABLE IF NOT EXISTS "Chalet" (
      "id" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "ownerId" TEXT,
      "nameAr" TEXT NOT NULL,
      "nameEn" TEXT NOT NULL,
      "descriptionAr" TEXT NOT NULL,
      "descriptionEn" TEXT NOT NULL,
      "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
      "capacity" INTEGER NOT NULL,
      "bedrooms" INTEGER NOT NULL,
      "bathrooms" INTEGER NOT NULL,
      "pricePerNight" DECIMAL(10,2) NOT NULL,
      "weekendPrice" DECIMAL(10,2),
      "locationAr" TEXT NOT NULL,
      "locationEn" TEXT NOT NULL,
      "latitude" DOUBLE PRECISION,
      "longitude" DOUBLE PRECISION,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Chalet_pkey" PRIMARY KEY ("id")
    )`);
    await run(`CREATE UNIQUE INDEX IF NOT EXISTS "Chalet_slug_key" ON "Chalet"("slug")`);
    await run(`ALTER TABLE "Chalet" ADD CONSTRAINT "Chalet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE`);

    await run(`CREATE TABLE IF NOT EXISTS "Booking" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "chaletId" TEXT NOT NULL,
      "checkIn" TIMESTAMP(3) NOT NULL,
      "checkOut" TIMESTAMP(3) NOT NULL,
      "guests" INTEGER NOT NULL,
      "totalPrice" DECIMAL(10,2) NOT NULL,
      "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
      "notes" TEXT,
      "guestName" TEXT,
      "guestPhone" TEXT,
      "paymentMethod" TEXT,
      "deposit" DECIMAL(10,2),
      "remainingAmount" DECIMAL(10,2),
      "remainingPaymentMethod" TEXT,
      "remainingCollected" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
    )`);
    await run(`ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    await run(`ALTER TABLE "Booking" ADD CONSTRAINT "Booking_chaletId_fkey" FOREIGN KEY ("chaletId") REFERENCES "Chalet"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);

    await run(`CREATE TABLE IF NOT EXISTS "Payment" (
      "id" TEXT NOT NULL,
      "bookingId" TEXT NOT NULL,
      "amount" DECIMAL(10,2) NOT NULL,
      "currency" TEXT NOT NULL DEFAULT 'SAR',
      "method" TEXT NOT NULL,
      "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
      "stripeId" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
    )`);
    await run(`CREATE UNIQUE INDEX IF NOT EXISTS "Payment_bookingId_key" ON "Payment"("bookingId")`);
    await run(`ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);

    await run(`CREATE TABLE IF NOT EXISTS "Review" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "chaletId" TEXT NOT NULL,
      "rating" INTEGER NOT NULL,
      "comment" TEXT NOT NULL,
      "isVisible" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
    )`);
    await run(`CREATE UNIQUE INDEX IF NOT EXISTS "Review_userId_chaletId_key" ON "Review"("userId", "chaletId")`);
    await run(`ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    await run(`ALTER TABLE "Review" ADD CONSTRAINT "Review_chaletId_fkey" FOREIGN KEY ("chaletId") REFERENCES "Chalet"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);

    await run(`CREATE TABLE IF NOT EXISTS "Notification" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "titleAr" TEXT NOT NULL,
      "titleEn" TEXT NOT NULL,
      "messageAr" TEXT NOT NULL,
      "messageEn" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "isRead" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
    )`);
    await run(`ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);

    await run(`CREATE TABLE IF NOT EXISTS "ContactMessage" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "phone" TEXT,
      "message" TEXT NOT NULL,
      "isRead" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
    )`);

    await run(`CREATE TABLE IF NOT EXISTS "WaterExpense" (
      "id" TEXT NOT NULL,
      "chaletId" TEXT NOT NULL,
      "amount" DECIMAL(10,2) NOT NULL,
      "notes" TEXT,
      "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "WaterExpense_pkey" PRIMARY KEY ("id")
    )`);
    await run(`ALTER TABLE "WaterExpense" ADD CONSTRAINT "WaterExpense_chaletId_fkey" FOREIGN KEY ("chaletId") REFERENCES "Chalet"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);

    await run(`CREATE TABLE IF NOT EXISTS "SiteSetting" (
      "id" TEXT NOT NULL,
      "key" TEXT NOT NULL,
      "value" TEXT NOT NULL,
      CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id")
    )`);
    await run(`CREATE UNIQUE INDEX IF NOT EXISTS "SiteSetting_key_key" ON "SiteSetting"("key")`);

    await run(`CREATE TABLE IF NOT EXISTS "Visit" (
      "id" TEXT NOT NULL,
      "page" TEXT NOT NULL,
      "referrer" TEXT,
      "userAgent" TEXT,
      "ip" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
    )`);
    await run(`CREATE INDEX IF NOT EXISTS "Visit_createdAt_idx" ON "Visit"("createdAt")`);
    await run(`CREATE INDEX IF NOT EXISTS "Visit_page_idx" ON "Visit"("page")`);

    // ── V7: LinkPage and LinkItem tables ──
    await run(`CREATE TABLE IF NOT EXISTS "LinkPage" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "slug" TEXT NOT NULL, "displayName" TEXT NOT NULL, "bio" TEXT, "avatarUrl" TEXT, "themeColor" TEXT NOT NULL DEFAULT '#10b981', "isPublished" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "LinkPage_pkey" PRIMARY KEY ("id"))`);
    await run(`CREATE UNIQUE INDEX IF NOT EXISTS "LinkPage_userId_key" ON "LinkPage"("userId")`);
    await run(`CREATE UNIQUE INDEX IF NOT EXISTS "LinkPage_slug_key" ON "LinkPage"("slug")`);
    await run(`ALTER TABLE "LinkPage" ADD CONSTRAINT "LinkPage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);

    await run(`CREATE TABLE IF NOT EXISTS "LinkItem" ("id" TEXT NOT NULL, "linkPageId" TEXT NOT NULL, "title" TEXT NOT NULL, "url" TEXT NOT NULL, "iconType" TEXT NOT NULL DEFAULT 'link', "sortOrder" INTEGER NOT NULL DEFAULT 0, "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "LinkItem_pkey" PRIMARY KEY ("id"))`);
    await run(`CREATE INDEX IF NOT EXISTS "LinkItem_linkPageId_idx" ON "LinkItem"("linkPageId")`);
    await run(`ALTER TABLE "LinkItem" ADD CONSTRAINT "LinkItem_linkPageId_fkey" FOREIGN KEY ("linkPageId") REFERENCES "LinkPage"("id") ON DELETE CASCADE ON UPDATE CASCADE`);

    // ── V8: VIP features ──
    await run(`ALTER TABLE "LinkPage" ADD COLUMN IF NOT EXISTS "subtitle" TEXT`);
    await run(`ALTER TABLE "LinkPage" ADD COLUMN IF NOT EXISTS "backgroundStyle" TEXT NOT NULL DEFAULT 'flat'`);
    await run(`ALTER TABLE "LinkPage" ADD COLUMN IF NOT EXISTS "buttonStyle" TEXT NOT NULL DEFAULT 'rounded'`);
    await run(`ALTER TABLE "LinkPage" ADD COLUMN IF NOT EXISTS "fontFamily" TEXT NOT NULL DEFAULT 'default'`);
    await run(`ALTER TABLE "LinkItem" ADD COLUMN IF NOT EXISTS "linkType" TEXT NOT NULL DEFAULT 'link'`);
    await run(`ALTER TABLE "LinkItem" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false`);
    await run(`ALTER TABLE "LinkItem" ADD COLUMN IF NOT EXISTS "thumbnail" TEXT`);

    // ── V9: WhatsAppSession table ──
    await run(`CREATE TABLE IF NOT EXISTS "WhatsAppSession" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "phone" TEXT NOT NULL, "instanceId" TEXT, "status" TEXT NOT NULL DEFAULT 'disconnected', "lastConnectedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "WhatsAppSession_pkey" PRIMARY KEY ("id"))`);
    await run(`CREATE UNIQUE INDEX IF NOT EXISTS "WhatsAppSession_userId_key" ON "WhatsAppSession"("userId")`);
    await run(`ALTER TABLE "WhatsAppSession" ADD CONSTRAINT "WhatsAppSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);

    console.log("[auto-migrate] Migration check complete");
  } catch {
    // Silent fail - don't break the app
  }
}
