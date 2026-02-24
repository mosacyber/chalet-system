import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const OPENCLAW_API_URL = process.env.OPENCLAW_API_URL || "http://localhost:8080";
const OPENCLAW_API_KEY = process.env.OPENCLAW_API_KEY || "";

async function openClawFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(OPENCLAW_API_KEY ? { Authorization: `Bearer ${OPENCLAW_API_KEY}` } : {}),
  };

  const res = await fetch(`${OPENCLAW_API_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`OpenClaw API error ${res.status}: ${text}`);
  }

  return res.json();
}

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

    const whatsapp = await prisma.whatsAppSession.findUnique({
      where: { userId },
    });

    if (!whatsapp) {
      return NextResponse.json({ error: "Save phone number first" }, { status: 400 });
    }

    // إنشاء instance في OpenClaw
    let instanceId = whatsapp.instanceId;

    if (!instanceId) {
      const createRes = await openClawFetch("/instance/create", {
        method: "POST",
        body: JSON.stringify({
          instanceName: `chalet-${userId}`,
          number: whatsapp.phone.replace(/[^0-9+]/g, ""),
        }),
      });
      instanceId = createRes.instance?.instanceId || createRes.instanceId || createRes.id;

      await prisma.whatsAppSession.update({
        where: { userId },
        data: { instanceId, status: "qr_pending" },
      });
    }

    // جلب QR Code
    const qrRes = await openClawFetch(`/instance/qr/${instanceId}`, {
      method: "GET",
    });

    await prisma.whatsAppSession.update({
      where: { userId },
      data: { status: "qr_pending" },
    });

    return NextResponse.json({
      qrCode: qrRes.qrcode || qrRes.qr || qrRes.base64 || qrRes.code || null,
      instanceId,
      status: "qr_pending",
    });
  } catch (error) {
    console.error("Marketing connect error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to connect to OpenClaw" },
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

    const whatsapp = await prisma.whatsAppSession.findUnique({
      where: { userId },
    });

    if (!whatsapp?.instanceId) {
      return NextResponse.json({ status: "disconnected" });
    }

    try {
      const statusRes = await openClawFetch(`/instance/status/${whatsapp.instanceId}`, {
        method: "GET",
      });

      const isConnected =
        statusRes.status === "open" ||
        statusRes.status === "connected" ||
        statusRes.connected === true;

      const newStatus = isConnected ? "connected" : whatsapp.status;

      if (newStatus !== whatsapp.status) {
        await prisma.whatsAppSession.update({
          where: { userId },
          data: {
            status: newStatus,
            ...(isConnected ? { lastConnectedAt: new Date() } : {}),
          },
        });
      }

      return NextResponse.json({
        status: newStatus,
        instanceId: whatsapp.instanceId,
      });
    } catch {
      return NextResponse.json({
        status: whatsapp.status,
        instanceId: whatsapp.instanceId,
      });
    }
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

    const whatsapp = await prisma.whatsAppSession.findUnique({
      where: { userId },
    });

    if (whatsapp?.instanceId) {
      try {
        await openClawFetch(`/instance/logout/${whatsapp.instanceId}`, {
          method: "DELETE",
        });
      } catch {
        // Ignore - instance may already be deleted
      }
    }

    await prisma.whatsAppSession.update({
      where: { userId },
      data: {
        status: "disconnected",
        instanceId: null,
      },
    });

    return NextResponse.json({ status: "disconnected" });
  } catch (error) {
    console.error("Marketing disconnect error:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }
}
