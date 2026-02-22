import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const url = new URL(request.url);
  const dashboardMode = url.searchParams.get("dashboard") === "true";

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

  if (!chalet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (dashboardMode) {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (role === "ADMIN" || (role === "OWNER" && chalet.ownerId === session?.user?.id)) {
      return NextResponse.json({
        ...chalet,
        pricePerNight: Number(chalet.pricePerNight),
        weekendPrice: chalet.weekendPrice ? Number(chalet.weekendPrice) : null,
      });
    }
  }

  if (!chalet.isActive) {
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await params;
  const body = await request.json();

  const chalet = await prisma.chalet.findUnique({ where: { slug } });
  if (!chalet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (role === "OWNER" && chalet.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updateData: Record<string, unknown> = {};

  if (body.nameAr !== undefined) updateData.nameAr = body.nameAr;
  if (body.nameEn !== undefined) updateData.nameEn = body.nameEn;
  if (body.descriptionAr !== undefined) updateData.descriptionAr = body.descriptionAr;
  if (body.descriptionEn !== undefined) updateData.descriptionEn = body.descriptionEn;
  if (body.locationAr !== undefined) updateData.locationAr = body.locationAr;
  if (body.locationEn !== undefined) updateData.locationEn = body.locationEn;
  if (body.capacity !== undefined) updateData.capacity = Number(body.capacity);
  if (body.bedrooms !== undefined) updateData.bedrooms = Number(body.bedrooms);
  if (body.bathrooms !== undefined) updateData.bathrooms = Number(body.bathrooms);
  if (body.pricePerNight !== undefined) updateData.pricePerNight = Number(body.pricePerNight);
  if (body.weekendPrice !== undefined) updateData.weekendPrice = body.weekendPrice ? Number(body.weekendPrice) : null;
  if (body.images !== undefined) updateData.images = body.images;
  if (body.amenities !== undefined) updateData.amenities = body.amenities;
  if (typeof body.isActive === "boolean") updateData.isActive = body.isActive;

  const updated = await prisma.chalet.update({
    where: { slug },
    data: updateData,
  });

  return NextResponse.json({ message: "Updated", data: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await params;

  const chalet = await prisma.chalet.findUnique({ where: { slug } });
  if (!chalet) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (role === "OWNER" && chalet.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.chalet.delete({ where: { slug } });

  return NextResponse.json({ message: "Deleted" });
}
