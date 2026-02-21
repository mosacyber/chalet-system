import { NextResponse } from "next/server";

export async function GET() {
  // Demo data
  const bookings = [
    {
      id: "BK-001",
      chaletId: "1",
      userId: "user-1",
      checkIn: "2024-03-15",
      checkOut: "2024-03-18",
      guests: 8,
      totalPrice: 2400,
      status: "confirmed",
    },
  ];

  return NextResponse.json(bookings);
}

export async function POST(request: Request) {
  const body = await request.json();

  // Validate required fields
  if (!body.chaletId || !body.checkIn || !body.checkOut || !body.guests) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const booking = {
    id: `BK-${Date.now()}`,
    ...body,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(
    { message: "Booking created", data: booking },
    { status: 201 }
  );
}
