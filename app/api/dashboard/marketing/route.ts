import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const BUILD_VERSION = "v2-baileys";

// Ensure WhatsAppSession table exists (runs once)
let tableEnsured = false;
async function ensureTable() {
  if (tableEnsured) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "WhatsAppSession" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "instanceId" TEXT,
        "status" TEXT NOT NULL DEFAULT 'disconnected',
        "lastConnectedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "WhatsAppSession_pkey" PRIMARY KEY ("id")
      )
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "WhatsAppSession_userId_key" ON "WhatsAppSession"("userId")
    `);
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "WhatsAppSession" ADD CONSTRAINT "WhatsAppSession_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      `);
    } catch {
      // FK already exists
    }
    tableEnsured = true;
  } catch (err) {
    console.error("[marketing] ensureTable error:", err);
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "ADMIN" && role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = (session.user as { id: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "No user ID" }, { status: 400 });
    }

    // Create table if needed BEFORE querying
    await ensureTable();

    const whatsapp = await prisma.whatsAppSession.findUnique({
      where: { userId },
    });
    return NextResponse.json(whatsapp);
  } catch (error) {
    console.error("Marketing GET error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "ADMIN" && role !== "OWNER") {
      return NextResponse.json(
        { error: `Forbidden: role=${role}` },
        { status: 403 }
      );
    }

    const userId = (session.user as { id: string }).id;
    if (!userId) {
      return NextResponse.json({ error: "No user ID in session" }, { status: 400 });
    }

    const body = await request.json();
    const { phone } = body;

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { error: "Phone is required" },
        { status: 400 }
      );
    }

    // Create table if needed BEFORE writing
    await ensureTable();

    const whatsapp = await prisma.whatsAppSession.upsert({
      where: { userId },
      update: { phone: phone.trim() },
      create: {
        userId,
        phone: phone.trim(),
        status: "disconnected",
      },
    });
    return NextResponse.json(whatsapp);
  } catch (error) {
    console.error("Marketing POST error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to save: ${msg}` },
      { status: 500 }
    );
  }
}
