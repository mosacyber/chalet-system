import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit")) || 20;

  const reviews = await prisma.review.findMany({
    where: { isVisible: true },
    include: {
      user: { select: { name: true } },
      chalet: { select: { nameAr: true, nameEn: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json(reviews);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.chaletId || !body.rating || !body.comment) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const review = {
    id: `REV-${Date.now()}`,
    ...body,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json(
    { message: "Review created", data: review },
    { status: 201 }
  );
}
