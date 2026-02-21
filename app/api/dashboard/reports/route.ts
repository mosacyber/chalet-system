import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userId = (session.user as { id?: string }).id;

  const statusFilter = { in: ["CONFIRMED", "COMPLETED"] as ("CONFIRMED" | "COMPLETED")[] };

  const bookingFilter =
    role === "ADMIN"
      ? { status: statusFilter }
      : { status: statusFilter, chalet: { ownerId: userId } };

  const bookings = await prisma.booking.findMany({
    where: bookingFilter,
    select: {
      totalPrice: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const monthNames = {
    ar: [
      "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
      "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
    ],
    en: [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ],
  };

  const monthlyMap = new Map<string, { revenue: number; bookings: number; monthIndex: number; year: number }>();

  for (const b of bookings) {
    const d = new Date(b.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const existing = monthlyMap.get(key);
    if (existing) {
      existing.revenue += Number(b.totalPrice);
      existing.bookings += 1;
    } else {
      monthlyMap.set(key, {
        revenue: Number(b.totalPrice),
        bookings: 1,
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
      });
    }
  }

  const monthlyData = Array.from(monthlyMap.values())
    .sort((a, b) => a.year - b.year || a.monthIndex - b.monthIndex)
    .map((m) => ({
      month: {
        ar: `${monthNames.ar[m.monthIndex]} ${m.year}`,
        en: `${monthNames.en[m.monthIndex]} ${m.year}`,
      },
      revenue: m.revenue,
      bookings: m.bookings,
    }));

  const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0);
  const totalBookings = monthlyData.reduce((s, m) => s + m.bookings, 0);

  return NextResponse.json({
    monthlyData,
    totalRevenue,
    totalBookings,
    avgBookingValue: totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0,
  });
}
