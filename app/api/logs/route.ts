import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getLogs, clearLogs } from "@/lib/log-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const level = url.searchParams.get("level") || undefined;
  const source = url.searchParams.get("source") || undefined;
  const limit = parseInt(url.searchParams.get("limit") || "200");

  const logs = getLogs({ level, source, limit });
  return NextResponse.json({ logs, total: logs.length });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  clearLogs();
  return NextResponse.json({ message: "Logs cleared" });
}
