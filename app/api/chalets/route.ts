import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const dashboardMode = url.searchParams.get("dashboard") === "true";

  if (dashboardMode) {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;

    if (role === "ADMIN") {
      const chalets = await db.chalets.findMany();
      const result = await Promise.all(
        chalets
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map(async (c) => {
            const bookingCount = await db.bookings.count((b) => b.chaletId === c.id);
            return { ...c, _count: { bookings: bookingCount } };
          })
      );
      return NextResponse.json(result);
    }

    if (role === "OWNER") {
      const chalets = await db.chalets.findMany((c) => c.ownerId === session.user!.id);
      const result = await Promise.all(
        chalets
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map(async (c) => {
            const bookingCount = await db.bookings.count((b) => b.chaletId === c.id);
            return { ...c, _count: { bookings: bookingCount } };
          })
      );
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Public: only active chalets with review stats
  const chalets = await db.chalets.findMany((c) => c.isActive);
  const allReviews = await db.reviews.findMany((r) => r.isVisible);

  const result = chalets
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((c) => {
      const chaletReviews = allReviews.filter((r) => r.chaletId === c.id);
      const avgRating =
        chaletReviews.length > 0
          ? chaletReviews.reduce((sum, r) => sum + r.rating, 0) / chaletReviews.length
          : 0;
      return {
        ...c,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: chaletReviews.length,
      };
    });

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const slug =
    (body.nameAr || "chalet").trim().replace(/\s+/g, "-") +
    "-" +
    Date.now().toString(36);

  const chalet = await db.chalets.create({
    nameAr: body.nameAr,
    nameEn: body.nameEn || body.nameAr,
    slug,
    ownerId: role === "OWNER" ? session.user!.id : body.ownerId || null,
    descriptionAr: body.descriptionAr || "",
    descriptionEn: body.descriptionEn || "",
    images: body.images || [],
    amenities: body.amenities || [],
    capacity: body.capacity || 0,
    bedrooms: body.bedrooms || 0,
    bathrooms: body.bathrooms || 0,
    pricePerNight: body.pricePerNight || 0,
    weekendPrice: body.weekendPrice || null,
    locationAr: body.locationAr || "",
    locationEn: body.locationEn || "",
    latitude: null,
    longitude: null,
    isActive: false,
  });

  return NextResponse.json(
    { message: "Chalet created", data: chalet },
    { status: 201 }
  );
}
