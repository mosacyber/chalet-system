import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const chalet = await prisma.chalet.findUnique({
    where: { slug },
    include: {
      reviews: {
        where: { isVisible: true },
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!chalet || !chalet.isActive) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const avgRating =
    chalet.reviews.length > 0
      ? chalet.reviews.reduce((sum, r) => sum + r.rating, 0) /
        chalet.reviews.length
      : 0;

  return NextResponse.json({
    ...chalet,
    pricePerNight: Number(chalet.pricePerNight),
    weekendPrice: chalet.weekendPrice ? Number(chalet.weekendPrice) : null,
    rating: Math.round(avgRating * 10) / 10,
    reviewCount: chalet._count.reviews,
  });
}
