import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  startWhatsAppSession,
  getSessionInfo,
  disconnectWhatsApp,
} from "@/lib/whatsapp-manager";

// POST: بدء الاتصال وجلب QR Code
export async function POST() {
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

    const whatsapp = await db.whatsappSessions.findFirst((w) => w.userId === userId);

    if (!whatsapp) {
      return NextResponse.json(
        { error: "Save phone number first" },
        { status: 400 }
      );
    }

    // Start Baileys session and get QR code
    const qrCode = await startWhatsAppSession(userId);

    if (!qrCode) {
      // Check if already connected (no QR needed)
      const info = getSessionInfo(userId);
      if (info.status === "connected") {
        await db.whatsappSessions.update(whatsapp.id, {
          status: "connected",
          lastConnectedAt: new Date().toISOString(),
        });
        return NextResponse.json({ status: "connected", qrCode: null });
      }
      return NextResponse.json(
        { error: "Failed to generate QR code. Try again." },
        { status: 500 }
      );
    }

    await db.whatsappSessions.update(whatsapp.id, { status: "qr_pending" });

    return NextResponse.json({
      qrCode,
      status: "qr_pending",
    });
  } catch (error) {
    console.error("Marketing connect error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to start WhatsApp",
      },
      { status: 500 }
    );
  }
}

// GET: تحقق من حالة الاتصال
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

    // Get real-time status from Baileys session
    const info = getSessionInfo(userId);

    // Update DB if status changed
    const whatsapp = await db.whatsappSessions.findFirst((w) => w.userId === userId);

    if (whatsapp && whatsapp.status !== info.status) {
      await db.whatsappSessions.update(whatsapp.id, {
        status: info.status,
        ...(info.status === "connected"
          ? { lastConnectedAt: new Date().toISOString() }
          : {}),
      });
    }

    return NextResponse.json({
      status: info.status,
      qrCode: info.qrCode,
    });
  } catch (error) {
    console.error("Marketing status error:", error);
    return NextResponse.json({ status: "disconnected" });
  }
}

// DELETE: فصل الاتصال
export async function DELETE() {
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

    // Disconnect Baileys session
    await disconnectWhatsApp(userId);

    // Update DB
    const whatsapp = await db.whatsappSessions.findFirst((w) => w.userId === userId);
    if (whatsapp) {
      await db.whatsappSessions.update(whatsapp.id, {
        status: "disconnected",
        instanceId: null,
      });
    }

    return NextResponse.json({ status: "disconnected" });
  } catch (error) {
    console.error("Marketing disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect" },
      { status: 500 }
    );
  }
}
