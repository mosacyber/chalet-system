import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { page } = await request.json();
    if (!page || typeof page !== "string") {
      return NextResponse.json({ error: "Missing page" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") || null;
    const referrer = request.headers.get("referer") || null;
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;

    await db.visits.create({ page, userAgent, referrer, ip });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
