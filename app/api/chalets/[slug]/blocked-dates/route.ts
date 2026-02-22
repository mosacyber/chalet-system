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

// GET - fetch manually blocked dates
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
    select: { checkIn: true },
    orderBy: { checkIn: "asc" },
  });

  const dates = blocked.map((b) => b.checkIn.toISOString().split("T")[0]);
  return NextResponse.json(dates);
}

// POST - block dates
export async function POST(
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

  // Filter to only new dates that aren't already occupied
  const newDates = dates.filter((date) => !occupiedDates.has(date));

  if (newDates.length === 0) {
    return NextResponse.json({ message: "All dates already occupied", created: 0 });
  }

  // Create blocked bookings
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
    };
  });

  await prisma.booking.createMany({ data: bookings });

  return NextResponse.json({ message: "Dates blocked", created: newDates.length });
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

  // Delete BLOCKED bookings that match these dates
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
