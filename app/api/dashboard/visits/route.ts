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
    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    // Counts: today, week, month, total
    const [todayCount, weekCount, monthCount, totalCount] = await Promise.all([
      prisma.visit.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.visit.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.visit.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.visit.count(),
    ]);

    // Top pages (last 30 days)
    const topPages = await prisma.visit.groupBy({
      by: ["page"],
      where: { createdAt: { gte: monthStart } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    });

    // Device breakdown (last 30 days)
    const recentVisits = await prisma.visit.findMany({
      where: { createdAt: { gte: monthStart } },
      select: { userAgent: true },
    });

    let mobile = 0;
    let desktop = 0;
    let tablet = 0;
    for (const v of recentVisits) {
      const ua = (v.userAgent || "").toLowerCase();
      if (/tablet|ipad/i.test(ua)) {
        tablet++;
      } else if (/mobile|android|iphone/i.test(ua)) {
        mobile++;
      } else {
        desktop++;
      }
    }

    // Daily visits (last 30 days)
    const thirtyDaysAgo = new Date(todayStart);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    const dailyRaw = await prisma.$queryRawUnsafe<
      { day: string; count: bigint }[]
    >(
      `SELECT DATE("createdAt") as day, COUNT(*)::bigint as count FROM "Visit" WHERE "createdAt" >= $1 GROUP BY DATE("createdAt") ORDER BY day ASC`,
      thirtyDaysAgo
    );

    const daily = dailyRaw.map((d) => ({
      day: String(d.day).split("T")[0],
      count: Number(d.count),
    }));

    return NextResponse.json({
      todayCount,
      weekCount,
      monthCount,
      totalCount,
      topPages: topPages.map((p) => ({
        page: p.page,
        count: p._count.id,
      })),
      devices: { mobile, desktop, tablet },
      daily,
    });
  } catch (error) {
    console.error("Visits API error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
