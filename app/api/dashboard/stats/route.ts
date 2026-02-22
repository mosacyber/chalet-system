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
  const waterFilter = isOwner
    ? { chalet: { ownerId: session.user.id } }
    : {};

  if (role !== "ADMIN" && role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [totalChalets, totalBookings, blockedBookings, recentBookings] =
    await Promise.all([
      prisma.chalet.count({ where: ownerFilter }),
      prisma.booking.count({ where: { ...bookingFilter, status: "BLOCKED" } }),
      prisma.booking.findMany({
        where: { ...bookingFilter, status: "BLOCKED" },
        select: { deposit: true, remainingAmount: true, paymentMethod: true },
      }),
      prisma.booking.findMany({
        where: { ...bookingFilter, status: "BLOCKED" },
        include: {
          user: { select: { name: true } },
          chalet: { select: { nameAr: true, nameEn: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  // Water expenses and settings - wrapped in try/catch for graceful fallback
  let waterResult: { _sum: { amount: unknown } } = { _sum: { amount: 0 } };
  let settings: { key: string; value: string }[] = [];
  try {
    [waterResult, settings] = await Promise.all([
      prisma.waterExpense.aggregate({
        where: waterFilter,
        _sum: { amount: true },
      }),
      prisma.siteSetting.findMany({
        where: {
          key: {
            in: [
              "payment_cash_location",
              "payment_card_location",
              "payment_transfer_location",
            ],
          },
        },
      }),
    ]);
  } catch {
    // Table may not exist yet - graceful fallback
  }

  // Calculate revenue breakdown from BLOCKED bookings
  let totalRevenue = 0;
  const breakdown: Record<string, number> = { cash: 0, transfer: 0, card: 0 };
  for (const b of blockedBookings) {
    const amount = Number(b.deposit || 0) + Number(b.remainingAmount || 0);
    totalRevenue += amount;
    const method = b.paymentMethod || "";
    if (method in breakdown) {
      breakdown[method] += amount;
    }
  }

  const waterTotal = Number(waterResult._sum.amount || 0);

  // Payment locations from settings
  const paymentLocations: Record<string, string> = {};
  for (const s of settings) {
    paymentLocations[s.key] = s.value;
  }

  return NextResponse.json({
    totalChalets,
    totalBookings,
    totalRevenue,
    revenueBreakdown: {
      cash: breakdown.cash,
      transfer: breakdown.transfer,
      card: breakdown.card,
      water: waterTotal,
    },
    paymentLocations,
    recentBookings: recentBookings.map((b) => ({
      id: b.id.slice(0, 8).toUpperCase(),
      customer: b.guestName || b.user?.name || "-",
      chaletAr: b.chalet.nameAr,
      chaletEn: b.chalet.nameEn,
      date: b.checkIn.toISOString().split("T")[0],
      status: b.status.toLowerCase(),
      amount: Number(b.deposit || 0) + Number(b.remainingAmount || 0),
    })),
  });
}
