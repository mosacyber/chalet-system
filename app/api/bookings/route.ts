import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: {
      chalet: { select: { nameAr: true, nameEn: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (!body.chaletId || !body.checkIn || !body.checkOut || !body.guests) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const chalet = await prisma.chalet.findUnique({
    where: { id: body.chaletId },
    select: { pricePerNight: true, weekendPrice: true },
  });

  if (!chalet) {
    return NextResponse.json({ error: "Chalet not found" }, { status: 404 });
  }

  const checkIn = new Date(body.checkIn);
  const checkOut = new Date(body.checkOut);

  // Check for overlapping bookings
  const overlap = await prisma.booking.findFirst({
    where: {
      chaletId: body.chaletId,
      status: { in: ["PENDING", "CONFIRMED"] },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
  });

  if (overlap) {
    return NextResponse.json(
      { error: "Dates already booked" },
      { status: 409 }
    );
  }

  // Calculate total price (weekend = Fri/Sat)
  let total = 0;
  const d = new Date(checkIn);
  while (d < checkOut) {
    const day = d.getDay();
    const isWeekend = day === 5 || day === 6;
    const price =
      isWeekend && chalet.weekendPrice
        ? Number(chalet.weekendPrice)
        : Number(chalet.pricePerNight);
    total += price;
    d.setDate(d.getDate() + 1);
  }

  const booking = await prisma.booking.create({
    data: {
      userId: session.user.id!,
      chaletId: body.chaletId,
      checkIn,
      checkOut,
      guests: Number(body.guests),
      totalPrice: total,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(
    { message: "Booking created", data: booking },
    { status: 201 }
  );
}
