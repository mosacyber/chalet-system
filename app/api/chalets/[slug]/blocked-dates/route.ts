import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getSessionAndChalet(slug: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const user = session.user as { id: string; role?: string };
  if (user.role !== "ADMIN" && user.role !== "OWNER") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  const chalet = await prisma.chalet.findUnique({
    where: { slug },
    select: { id: true, ownerId: true },
  });

  if (!chalet) {
    return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  }

  if (user.role === "OWNER" && chalet.ownerId !== user.id) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { user, chalet };
}

// GET - fetch manually blocked dates with guest details
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const result = await getSessionAndChalet(slug);
  if ("error" in result) return result.error;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const blocked = await prisma.booking.findMany({
    where: {
      chaletId: result.chalet.id,
      status: "BLOCKED",
      checkOut: { gte: today },
    },
    select: {
      id: true,
      checkIn: true,
      checkOut: true,
      guestName: true,
      guestPhone: true,
      paymentMethod: true,
      deposit: true,
      remainingAmount: true,
      remainingPaymentMethod: true,
      remainingCollected: true,
      createdAt: true,
    },
    orderBy: { checkIn: "asc" },
  });

  const data = blocked.map((b) => ({
    id: b.id,
    date: b.checkIn.toISOString().split("T")[0],
    checkOut: b.checkOut.toISOString().split("T")[0],
    guestName: b.guestName || "",
    guestPhone: b.guestPhone || "",
    paymentMethod: b.paymentMethod || "",
    deposit: b.deposit ? Number(b.deposit) : 0,
    remainingAmount: b.remainingAmount ? Number(b.remainingAmount) : 0,
    remainingPaymentMethod: b.remainingPaymentMethod || "",
    remainingCollected: b.remainingCollected || false,
    createdAt: b.createdAt.toISOString(),
  }));

  return NextResponse.json(data);
}

// POST - block dates with guest info
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const result = await getSessionAndChalet(slug);
  if ("error" in result) return result.error;

  const body = await request.json();
  const dates: string[] = body.dates;
  const guestName: string = body.guestName || "";
  const guestPhone: string = body.guestPhone || "";
  const paymentMethod: string = body.paymentMethod || "";
  const deposit: number = body.deposit || 0;
  const remainingAmount: number = body.remainingAmount || 0;

  if (!Array.isArray(dates) || dates.length === 0) {
    return NextResponse.json({ error: "dates array required" }, { status: 400 });
  }

  // Check which dates are already booked/blocked
  const existingBookings = await prisma.booking.findMany({
    where: {
      chaletId: result.chalet.id,
      status: { in: ["PENDING", "CONFIRMED", "BLOCKED"] },
    },
    select: { checkIn: true, checkOut: true },
  });

  const occupiedDates = new Set<string>();
  for (const b of existingBookings) {
    const d = new Date(b.checkIn);
    while (d < b.checkOut) {
      occupiedDates.add(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() + 1);
    }
  }

  const newDates = dates.filter((date) => !occupiedDates.has(date));

  if (newDates.length === 0) {
    return NextResponse.json({ message: "All dates already occupied", created: 0 });
  }

  const bookings = newDates.map((date) => {
    const checkIn = new Date(date + "T00:00:00Z");
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 1);

    return {
      userId: result.user.id,
      chaletId: result.chalet.id,
      checkIn,
      checkOut,
      guests: 0,
      totalPrice: 0,
      status: "BLOCKED" as const,
      notes: "Blocked by owner",
      guestName: guestName || null,
      guestPhone: guestPhone || null,
      paymentMethod: paymentMethod || null,
      deposit: deposit || null,
      remainingAmount: remainingAmount || null,
    };
  });

  await prisma.booking.createMany({ data: bookings });

  return NextResponse.json({ message: "Dates blocked", created: newDates.length });
}

// PATCH - update remaining amount (mark as collected)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const result = await getSessionAndChalet(slug);
  if ("error" in result) return result.error;

  const body = await request.json();
  const { bookingId, remainingAmount, remainingPaymentMethod } = body;

  if (!bookingId) {
    return NextResponse.json({ error: "bookingId required" }, { status: 400 });
  }

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      chaletId: result.chalet.id,
      status: "BLOCKED",
    },
  });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      remainingAmount: remainingAmount ?? 0,
      remainingPaymentMethod: remainingPaymentMethod || null,
      remainingCollected: !!remainingPaymentMethod,
    },
  });

  return NextResponse.json({
    message: "Updated successfully",
    remainingAmount: updated.remainingAmount ? Number(updated.remainingAmount) : 0,
    remainingPaymentMethod: updated.remainingPaymentMethod || "",
    remainingCollected: updated.remainingCollected,
  });
}

// DELETE - unblock dates
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const result = await getSessionAndChalet(slug);
  if ("error" in result) return result.error;

  const body = await request.json();
  const dates: string[] = body.dates;

  if (!Array.isArray(dates) || dates.length === 0) {
    return NextResponse.json({ error: "dates array required" }, { status: 400 });
  }

  let deleted = 0;
  for (const date of dates) {
    const checkIn = new Date(date + "T00:00:00Z");
    const result2 = await prisma.booking.deleteMany({
      where: {
        chaletId: result.chalet.id,
        status: "BLOCKED",
        checkIn: checkIn,
      },
    });
    deleted += result2.count;
  }

  return NextResponse.json({ message: "Dates unblocked", deleted });
}
