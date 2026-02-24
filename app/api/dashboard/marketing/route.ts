import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    return NextResponse.json(whatsapp);
  } catch (error) {
    console.error("Marketing GET error:", error);
    return NextResponse.json(null);
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { phone } = body;

    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: "Phone is required" }, { status: 400 });
    }

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
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
