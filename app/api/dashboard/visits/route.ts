import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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

    const todayISO = todayStart.toISOString();
    const weekISO = weekStart.toISOString();
    const monthISO = monthStart.toISOString();

    // Counts: today, week, month, total
    const [todayCount, weekCount, monthCount, totalCount] = await Promise.all([
      db.visits.count((v) => v.createdAt >= todayISO),
      db.visits.count((v) => v.createdAt >= weekISO),
      db.visits.count((v) => v.createdAt >= monthISO),
      db.visits.count(),
    ]);

    // Get all visits from last 30 days for top pages, device breakdown, and daily visits
    const recentVisits = await db.visits.findMany(
      (v) => v.createdAt >= monthISO
    );

    // Top pages (last 30 days) - manual groupBy
    const pageCountMap: Record<string, number> = {};
    for (const v of recentVisits) {
      const page = v.page || "";
      pageCountMap[page] = (pageCountMap[page] || 0) + 1;
    }
    const topPages = Object.entries(pageCountMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));

    // Device breakdown (last 30 days)
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

    // Daily visits (last 30 days) - manual grouping
    const thirtyDaysAgo = new Date(todayStart);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
    const thirtyDaysISO = thirtyDaysAgo.toISOString();

    const allVisits = await db.visits.findMany(
      (v) => v.createdAt >= thirtyDaysISO
    );
    const dailyMap: Record<string, number> = {};
    for (const v of allVisits) {
      const day = v.createdAt.split("T")[0];
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    }
    const daily = Object.entries(dailyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, count]) => ({ day, count }));

    return NextResponse.json({
      todayCount,
      weekCount,
      monthCount,
      totalCount,
      topPages,
      devices: { mobile, desktop, tablet },
      daily,
    });
  } catch (error) {
    console.error("Visits API error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
