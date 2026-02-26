import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const status: Record<string, unknown> = {
    app: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  try {
    const dataDir = path.join(process.cwd(), "data");
    const exists = fs.existsSync(dataDir);
    status.database = exists ? "ok" : "no data dir";
    const userCount = await db.users.count();
    status.userCount = userCount;
  } catch (err) {
    status.database = "error";
    status.dbError = err instanceof Error ? err.message : String(err);
  }

  const httpStatus = status.database === "error" ? 503 : 200;
  return NextResponse.json(status, { status: httpStatus });
}
