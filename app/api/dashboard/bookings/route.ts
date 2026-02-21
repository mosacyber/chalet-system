import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;

  if (role === "ADMIN") {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true } },
        chalet: { select: { nameAr: true, nameEn: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(bookings);
  }

  if (role === "OWNER") {
    const bookings = await prisma.booking.findMany({
      where: { chalet: { ownerId: session.user.id } },
      include: {
        user: { select: { name: true } },
        chalet: { select: { nameAr: true, nameEn: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(bookings);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
