import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const chalet = await prisma.chalet.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!chalet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bookings = await prisma.booking.findMany({
    where: {
      chaletId: chalet.id,
      status: { in: ["PENDING", "CONFIRMED", "BLOCKED"] },
      checkOut: { gte: today },
    },
    select: {
      checkIn: true,
      checkOut: true,
    },
    orderBy: { checkIn: "asc" },
  });

  const result = bookings.map((b) => ({
    checkIn: b.checkIn.toISOString().split("T")[0],
    checkOut: b.checkOut.toISOString().split("T")[0],
  }));

  return NextResponse.json(result);
}
