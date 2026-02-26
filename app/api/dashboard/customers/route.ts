import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await db.users.findMany((u) => u.role !== "ADMIN");

  // Get all bookings to count per user
  const allBookings = await db.bookings.findMany();

  // Build booking count map
  const bookingCountMap: Record<string, number> = {};
  for (const b of allBookings) {
    if (b.userId) {
      bookingCountMap[b.userId] = (bookingCountMap[b.userId] || 0) + 1;
    }
  }

  // Sort by createdAt desc
  const sorted = users.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const customers = sorted.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    createdAt: u.createdAt,
    _count: { bookings: bookingCountMap[u.id] || 0 },
  }));

  return NextResponse.json(customers);
}
