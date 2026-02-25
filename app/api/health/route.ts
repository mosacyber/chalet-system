import { NextResponse } from "next/server";
import { prisma, reconnectPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const fix = url.searchParams.get("fix") === "1";

  const status: Record<string, unknown> = {
    app: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };

  // Check database
  try {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    status.database = "ok";
    status.dbResult = result;

    // Check user count
    const userCount = await prisma.user.count();
    status.userCount = userCount;
  } catch (err) {
    status.database = "error";
    status.dbError = err instanceof Error ? err.message : String(err);

    // If fix=1, try to reconnect
    if (fix) {
      try {
        await reconnectPrisma();
        status.database = "recovered";
        status.fix = "reconnect succeeded";
      } catch (fixErr) {
        status.fix = "reconnect failed";
        status.fixError =
          fixErr instanceof Error ? fixErr.message : String(fixErr);
      }
    }
  }

  const httpStatus = status.database === "error" ? 503 : 200;
  return NextResponse.json(status, { status: httpStatus });
}
