import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const auth = request.headers.get("x-migrate-key");
  if (auth !== process.env.NEXTAUTH_SECRET) {
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
