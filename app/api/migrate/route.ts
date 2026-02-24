import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const auth = request.headers.get("x-migrate-key");
  if (auth !== (process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if tables already exist
    const tables = await prisma.$queryRawUnsafe<{ tablename: string }[]>(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'User'`
    );

    if (tables.length > 0) {
      return NextResponse.json({ message: "Tables already exist" });
    }

    // Create enums
    await prisma.$executeRawUnsafe(`CREATE TYPE "Role" AS ENUM ('ADMIN', 'CUSTOMER')`);
    await prisma.$executeRawUnsafe(`CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')`);
    await prisma.$executeRawUnsafe(`CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED')`);

    // Create tables
    await prisma.$executeRawUnsafe(`CREATE TABLE "User" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "phone" TEXT, "password" TEXT NOT NULL, "role" "Role" NOT NULL DEFAULT 'CUSTOMER', "image" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "User_pkey" PRIMARY KEY ("id"))`);
    await prisma.$executeRawUnsafe(`CREATE TABLE "Chalet" ("id" TEXT NOT NULL, "slug" TEXT NOT NULL, "nameAr" TEXT NOT NULL, "nameEn" TEXT NOT NULL, "descriptionAr" TEXT NOT NULL, "descriptionEn" TEXT NOT NULL, "images" TEXT[], "amenities" TEXT[], "capacity" INTEGER NOT NULL, "bedrooms" INTEGER NOT NULL, "bathrooms" INTEGER NOT NULL, "pricePerNight" DECIMAL(10,2) NOT NULL, "weekendPrice" DECIMAL(10,2), "locationAr" TEXT NOT NULL, "locationEn" TEXT NOT NULL, "latitude" DOUBLE PRECISION, "longitude" DOUBLE PRECISION, "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Chalet_pkey" PRIMARY KEY ("id"))`);
    await prisma.$executeRawUnsafe(`CREATE TABLE "Booking" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "chaletId" TEXT NOT NULL, "checkIn" TIMESTAMP(3) NOT NULL, "checkOut" TIMESTAMP(3) NOT NULL, "guests" INTEGER NOT NULL, "totalPrice" DECIMAL(10,2) NOT NULL, "status" "BookingStatus" NOT NULL DEFAULT 'PENDING', "notes" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Booking_pkey" PRIMARY KEY ("id"))`);
    await prisma.$executeRawUnsafe(`CREATE TABLE "Payment" ("id" TEXT NOT NULL, "bookingId" TEXT NOT NULL, "amount" DECIMAL(10,2) NOT NULL, "currency" TEXT NOT NULL DEFAULT 'SAR', "method" TEXT NOT NULL, "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING', "stripeId" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Payment_pkey" PRIMARY KEY ("id"))`);
    await prisma.$executeRawUnsafe(`CREATE TABLE "Review" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "chaletId" TEXT NOT NULL, "rating" INTEGER NOT NULL, "comment" TEXT NOT NULL, "isVisible" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Review_pkey" PRIMARY KEY ("id"))`);
    await prisma.$executeRawUnsafe(`CREATE TABLE "Notification" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "titleAr" TEXT NOT NULL, "titleEn" TEXT NOT NULL, "messageAr" TEXT NOT NULL, "messageEn" TEXT NOT NULL, "type" TEXT NOT NULL, "isRead" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Notification_pkey" PRIMARY KEY ("id"))`);
    await prisma.$executeRawUnsafe(`CREATE TABLE "ContactMessage" ("id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT NOT NULL, "phone" TEXT, "message" TEXT NOT NULL, "isRead" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id"))`);
    await prisma.$executeRawUnsafe(`CREATE TABLE "SiteSetting" ("id" TEXT NOT NULL, "key" TEXT NOT NULL, "value" TEXT NOT NULL, CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("id"))`);

    // Create indexes
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "User_email_key" ON "User"("email")`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "Chalet_slug_key" ON "Chalet"("slug")`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "Payment_bookingId_key" ON "Payment"("bookingId")`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "Review_userId_chaletId_key" ON "Review"("userId", "chaletId")`);
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX "SiteSetting_key_key" ON "SiteSetting"("key")`);

    // Create foreign keys
    await prisma.$executeRawUnsafe(`ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Booking" ADD CONSTRAINT "Booking_chaletId_fkey" FOREIGN KEY ("chaletId") REFERENCES "Chalet"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Review" ADD CONSTRAINT "Review_chaletId_fkey" FOREIGN KEY ("chaletId") REFERENCES "Chalet"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);

    return NextResponse.json({ message: "All tables created successfully!" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT: Add OWNER role and ownerId column (v2 migration)
export async function PUT(request: Request) {
  const authHeader = request.headers.get("x-migrate-key");
  if (authHeader !== (process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  const run = async (label: string, sql: string) => {
    try {
      await prisma.$executeRawUnsafe(sql);
      results.push(`${label}: OK`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown";
      if (msg.includes("already exists") || msg.includes("duplicate")) {
        results.push(`${label}: already exists (skipped)`);
      } else {
        results.push(`${label}: ERROR - ${msg}`);
      }
    }
  };

  await run("Add OWNER enum", `ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'OWNER'`);
  await run("Add ownerId column", `ALTER TABLE "Chalet" ADD COLUMN IF NOT EXISTS "ownerId" TEXT`);
  await run("Add ownerId FK", `ALTER TABLE "Chalet" ADD CONSTRAINT "Chalet_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
  await run("Add ownerId index", `CREATE INDEX IF NOT EXISTS "Chalet_ownerId_idx" ON "Chalet"("ownerId")`);
  await run("Update default role", `ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'OWNER'`);
  await run("Upgrade CUSTOMER to OWNER", `UPDATE "User" SET "role" = 'OWNER' WHERE "role" = 'CUSTOMER'`);
  // V3: Add BLOCKED to BookingStatus
  await run("Add BLOCKED status", `ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'BLOCKED'`);

  // V4: WaterExpense table
  await run("Create WaterExpense table", `CREATE TABLE IF NOT EXISTS "WaterExpense" ("id" TEXT NOT NULL, "chaletId" TEXT NOT NULL, "amount" DECIMAL(10,2) NOT NULL, "notes" TEXT, "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "WaterExpense_pkey" PRIMARY KEY ("id"))`);
  await run("Add WaterExpense FK", `ALTER TABLE "WaterExpense" ADD CONSTRAINT "WaterExpense_chaletId_fkey" FOREIGN KEY ("chaletId") REFERENCES "Chalet"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);

  // V5: Add missing Booking columns
  await run("Add guestName", `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "guestName" TEXT`);
  await run("Add guestPhone", `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "guestPhone" TEXT`);
  await run("Add paymentMethod", `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT`);
  await run("Add deposit", `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "deposit" DECIMAL(10,2)`);
  await run("Add remainingAmount", `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "remainingAmount" DECIMAL(10,2)`);
  await run("Add remainingPaymentMethod", `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "remainingPaymentMethod" TEXT`);
  await run("Add remainingCollected", `ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "remainingCollected" BOOLEAN NOT NULL DEFAULT false`);

  // V6: Visit tracking table
  await run("Create Visit table", `CREATE TABLE IF NOT EXISTS "Visit" ("id" TEXT NOT NULL, "page" TEXT NOT NULL, "referrer" TEXT, "userAgent" TEXT, "ip" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Visit_pkey" PRIMARY KEY ("id"))`);
  await run("Add Visit createdAt index", `CREATE INDEX IF NOT EXISTS "Visit_createdAt_idx" ON "Visit"("createdAt")`);
  await run("Add Visit page index", `CREATE INDEX IF NOT EXISTS "Visit_page_idx" ON "Visit"("page")`);

  // V7: LinkPage and LinkItem tables
  await run("Create LinkPage table", `CREATE TABLE IF NOT EXISTS "LinkPage" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "slug" TEXT NOT NULL, "displayName" TEXT NOT NULL, "bio" TEXT, "avatarUrl" TEXT, "themeColor" TEXT NOT NULL DEFAULT '#10b981', "isPublished" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "LinkPage_pkey" PRIMARY KEY ("id"))`);
  await run("Add LinkPage userId unique", `CREATE UNIQUE INDEX IF NOT EXISTS "LinkPage_userId_key" ON "LinkPage"("userId")`);
  await run("Add LinkPage slug unique", `CREATE UNIQUE INDEX IF NOT EXISTS "LinkPage_slug_key" ON "LinkPage"("slug")`);
  await run("Add LinkPage userId FK", `ALTER TABLE "LinkPage" ADD CONSTRAINT "LinkPage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);

  await run("Create LinkItem table", `CREATE TABLE IF NOT EXISTS "LinkItem" ("id" TEXT NOT NULL, "linkPageId" TEXT NOT NULL, "title" TEXT NOT NULL, "url" TEXT NOT NULL, "iconType" TEXT NOT NULL DEFAULT 'link', "sortOrder" INTEGER NOT NULL DEFAULT 0, "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "LinkItem_pkey" PRIMARY KEY ("id"))`);
  await run("Add LinkItem linkPageId index", `CREATE INDEX IF NOT EXISTS "LinkItem_linkPageId_idx" ON "LinkItem"("linkPageId")`);
  await run("Add LinkItem linkPageId FK", `ALTER TABLE "LinkItem" ADD CONSTRAINT "LinkItem_linkPageId_fkey" FOREIGN KEY ("linkPageId") REFERENCES "LinkPage"("id") ON DELETE CASCADE ON UPDATE CASCADE`);

  // V8: VIP features - new columns for LinkPage and LinkItem
  await run("Add LinkPage subtitle", `ALTER TABLE "LinkPage" ADD COLUMN IF NOT EXISTS "subtitle" TEXT`);
  await run("Add LinkPage backgroundStyle", `ALTER TABLE "LinkPage" ADD COLUMN IF NOT EXISTS "backgroundStyle" TEXT NOT NULL DEFAULT 'flat'`);
  await run("Add LinkPage buttonStyle", `ALTER TABLE "LinkPage" ADD COLUMN IF NOT EXISTS "buttonStyle" TEXT NOT NULL DEFAULT 'rounded'`);
  await run("Add LinkPage fontFamily", `ALTER TABLE "LinkPage" ADD COLUMN IF NOT EXISTS "fontFamily" TEXT NOT NULL DEFAULT 'default'`);
  await run("Add LinkItem linkType", `ALTER TABLE "LinkItem" ADD COLUMN IF NOT EXISTS "linkType" TEXT NOT NULL DEFAULT 'link'`);
  await run("Add LinkItem isFeatured", `ALTER TABLE "LinkItem" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false`);
  await run("Add LinkItem thumbnail", `ALTER TABLE "LinkItem" ADD COLUMN IF NOT EXISTS "thumbnail" TEXT`);

  // V9: WhatsAppSession table
  await run("Create WhatsAppSession table", `CREATE TABLE IF NOT EXISTS "WhatsAppSession" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "phone" TEXT NOT NULL, "instanceId" TEXT, "status" TEXT NOT NULL DEFAULT 'disconnected', "lastConnectedAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "WhatsAppSession_pkey" PRIMARY KEY ("id"))`);
  await run("Create WhatsAppSession userId index", `CREATE UNIQUE INDEX IF NOT EXISTS "WhatsAppSession_userId_key" ON "WhatsAppSession"("userId")`);
  await run("Add WhatsAppSession FK", `ALTER TABLE "WhatsAppSession" ADD CONSTRAINT "WhatsAppSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);

  return NextResponse.json({ message: "V2-V9 migration complete", results });
}

// PATCH: Seed admin account (one-time use)
export async function PATCH(request: Request) {
  const auth = request.headers.get("x-migrate-key");
  if (auth !== (process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      // Upgrade existing user to ADMIN
      await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
      });
      return NextResponse.json({ message: "User upgraded to ADMIN" });
    }

    const hashedPassword = await hash(password, 12);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    return NextResponse.json({ message: "Admin account created" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
