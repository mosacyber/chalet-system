import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
      const chalets = await prisma.chalet.findMany({
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { bookings: true } } },
      });
      return NextResponse.json(chalets);
    }

    if (role === "OWNER") {
      const chalets = await prisma.chalet.findMany({
        where: { ownerId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { bookings: true } } },
      });
      return NextResponse.json(chalets);
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Public: only active chalets
  const chalets = await prisma.chalet.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(chalets);
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

  const chalet = await prisma.chalet.create({
    data: {
      nameAr: body.nameAr,
      nameEn: body.nameEn || body.nameAr,
      slug,
      ownerId: role === "OWNER" ? session.user.id : body.ownerId || null,
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
      isActive: false,
    },
  });

  return NextResponse.json(
    { message: "Chalet created", data: chalet },
    { status: 201 }
  );
}
