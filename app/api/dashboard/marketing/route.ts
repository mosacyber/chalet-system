import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const BUILD_VERSION = "v2-baileys";

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

    const whatsapp = await db.whatsappSessions.findFirst((w) => w.userId === userId);
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

    const whatsapp = await db.whatsappSessions.upsert(
      (w) => w.userId === userId,
      {
        userId,
        phone: phone.trim(),
        status: "disconnected",
        instanceId: null,
        lastConnectedAt: null,
      },
      { phone: phone.trim() }
    );
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
