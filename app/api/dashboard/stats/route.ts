import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  const isOwner = role === "OWNER";
  const ownerFilter = isOwner ? { ownerId: session.user.id } : {};
  const bookingFilter = isOwner
    ? { chalet: { ownerId: session.user.id } }
    : {};

  if (role !== "ADMIN" && role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalChalets, totalBookings, revenueResult, recentBookings] =
    await Promise.all([
      prisma.chalet.count({ where: ownerFilter }),
      prisma.booking.count({ where: bookingFilter }),
      prisma.booking.aggregate({
        where: {
          ...bookingFilter,
          status: { in: ["CONFIRMED", "COMPLETED"] },
        },
        _sum: { totalPrice: true },
      }),
      prisma.booking.findMany({
        where: bookingFilter,
        include: {
          user: { select: { name: true } },
          chalet: { select: { nameAr: true, nameEn: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const totalRevenue = revenueResult._sum.totalPrice || 0;

  return NextResponse.json({
    totalChalets,
    totalBookings,
    totalRevenue: Number(totalRevenue),
    recentBookings: recentBookings.map((b) => ({
      id: b.id.slice(0, 8).toUpperCase(),
      customer: b.user?.name || "-",
      chaletAr: b.chalet.nameAr,
      chaletEn: b.chalet.nameEn,
      date: b.checkIn.toISOString().split("T")[0],
      status: b.status.toLowerCase(),
      amount: Number(b.totalPrice),
    })),
  });
}
