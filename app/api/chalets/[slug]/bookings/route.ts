import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const chalet = await db.chalets.findFirst((c) => c.slug === slug);

  if (!chalet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const bookings = await db.bookings.findMany(
    (b) =>
      b.chaletId === chalet.id &&
      ["PENDING", "CONFIRMED", "BLOCKED"].includes(b.status) &&
      b.checkOut >= todayStr
  );

  const result = bookings
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .map((b) => ({
      checkIn: b.checkIn.split("T")[0],
      checkOut: b.checkOut.split("T")[0],
    }));

  return NextResponse.json(result);
}
