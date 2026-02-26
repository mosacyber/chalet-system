import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Chalet, Booking, WaterExpense } from "@/lib/types";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    const isOwner = role === "OWNER";

    if (role !== "ADMIN" && role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get owner's chalet IDs for filtering
    let ownerChaletIds: string[] = [];
    if (isOwner) {
      const ownerChalets = await db.chalets.findMany(
        (c) => c.ownerId === session.user!.id
      );
      ownerChaletIds = ownerChalets.map((c) => c.id);
    }

    const userId = session.user!.id!;
    const chaletFilter = isOwner
      ? (c: Chalet) => c.ownerId === userId
      : undefined;

    const bookingFilter = isOwner
      ? (b: Booking) =>
          ownerChaletIds.includes(b.chaletId) && b.status === "BLOCKED"
      : (b: Booking) => b.status === "BLOCKED";

    const waterFilter = isOwner
      ? (e: WaterExpense) => ownerChaletIds.includes(e.chaletId)
      : undefined;

    const [totalChalets, blockedBookings, allBlockedBookings] =
      await Promise.all([
        db.chalets.count(chaletFilter),
        db.bookings.findMany(bookingFilter),
        db.bookings.findMany(bookingFilter),
      ]);

    const totalBookings = blockedBookings.length;

    // Get recent 5 BLOCKED bookings with user and chalet info
    const sortedBookings = allBlockedBookings.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const recent5 = sortedBookings.slice(0, 5);

    // Manual joins for recent bookings
    const recentBookings = await Promise.all(
      recent5.map(async (b) => {
        const user = b.userId ? await db.users.findUnique(b.userId) : null;
        const chalet = await db.chalets.findUnique(b.chaletId);
        return {
          ...b,
          user: user ? { name: user.name } : null,
          chalet: chalet
            ? { nameAr: chalet.nameAr, nameEn: chalet.nameEn }
            : { nameAr: "", nameEn: "" },
        };
      })
    );

    // Water expenses and settings - wrapped in try/catch for graceful fallback
    let waterTotal = 0;
    let settings: { key: string; value: string }[] = [];
    try {
      const [expenses, settingsResult] = await Promise.all([
        db.waterExpenses.findMany(waterFilter),
        db.siteSettings.findMany(
          (s) =>
            s.key === "payment_cash_location" ||
            s.key === "payment_card_location" ||
            s.key === "payment_transfer_location"
        ),
      ]);
      waterTotal = expenses.reduce(
        (sum, e) => sum + Number(e.amount),
        0
      );
      settings = settingsResult;
    } catch {
      // Table may not exist yet - graceful fallback
    }

    // Calculate revenue breakdown from BLOCKED bookings
    let totalRevenue = 0;
    const breakdown: Record<string, number> = {
      cash: 0,
      transfer: 0,
      card: 0,
    };
    for (const b of blockedBookings) {
      const amount = Number(b.deposit || 0) + Number(b.remainingAmount || 0);
      totalRevenue += amount;
      const method = b.paymentMethod || "";
      if (method in breakdown) {
        breakdown[method] += amount;
      }
    }

    // Payment locations from settings
    const paymentLocations: Record<string, string> = {};
    for (const s of settings) {
      paymentLocations[s.key] = s.value;
    }

    const netRevenue = totalRevenue - waterTotal;

    return NextResponse.json({
      totalChalets,
      totalBookings,
      totalRevenue: netRevenue,
      grossRevenue: totalRevenue,
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
        date: b.checkIn.split("T")[0],
        status: b.status.toLowerCase(),
        amount: Number(b.deposit || 0) + Number(b.remainingAmount || 0),
      })),
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
