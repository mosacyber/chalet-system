import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id!;
  const bookings = await db.bookings.findMany(
    (b) => b.userId === userId
  );

  // Manual join: attach chalet info
  const chalets = await db.chalets.findMany();
  const chaletMap = new Map(chalets.map((c) => [c.id, c]));

  const result = bookings
    .map((b) => {
      const chalet = chaletMap.get(b.chaletId);
      return {
        ...b,
        chalet: chalet
          ? { nameAr: chalet.nameAr, nameEn: chalet.nameEn, slug: chalet.slug }
          : null,
      };
    })
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));

  return NextResponse.json(result);
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

  const chalet = await db.chalets.findUnique(body.chaletId);

  if (!chalet) {
    return NextResponse.json({ error: "Chalet not found" }, { status: 404 });
  }

  const checkIn = body.checkIn as string;
  const checkOut = body.checkOut as string;

  // Check for overlapping bookings
  const overlap = await db.bookings.findFirst(
    (b) =>
      b.chaletId === body.chaletId &&
      (b.status === "PENDING" || b.status === "CONFIRMED") &&
      b.checkIn < checkOut &&
      b.checkOut > checkIn
  );

  if (overlap) {
    return NextResponse.json(
      { error: "Dates already booked" },
      { status: 409 }
    );
  }

  // Calculate total price (weekend = Fri/Sat)
  let total = 0;
  const d = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  while (d < checkOutDate) {
    const day = d.getDay();
    const isWeekend = day === 5 || day === 6;
    const price =
      isWeekend && chalet.weekendPrice
        ? Number(chalet.weekendPrice)
        : Number(chalet.pricePerNight);
    total += price;
    d.setDate(d.getDate() + 1);
  }

  const booking = await db.bookings.create({
    userId: session.user.id!,
    chaletId: body.chaletId,
    checkIn,
    checkOut,
    guests: Number(body.guests),
    totalPrice: total,
    status: "PENDING",
    notes: body.notes || null,
    guestName: null,
    guestPhone: null,
    paymentMethod: null,
    deposit: null,
    remainingAmount: null,
    remainingPaymentMethod: null,
    remainingCollected: false,
  });

  return NextResponse.json(
    { message: "Booking created", data: booking },
    { status: 201 }
  );
}
