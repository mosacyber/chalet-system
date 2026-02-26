import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit")) || 20;

  const reviews = await db.reviews.findMany((r) => r.isVisible === true);

  // Manual joins: attach user and chalet info
  const users = await db.users.findMany();
  const chalets = await db.chalets.findMany();

  const userMap = new Map(users.map((u) => [u.id, u]));
  const chaletMap = new Map(chalets.map((c) => [c.id, c]));

  const result = reviews
    .map((r) => {
      const user = userMap.get(r.userId);
      const chalet = chaletMap.get(r.chaletId);
      return {
        ...r,
        user: user ? { name: user.name } : null,
        chalet: chalet
          ? { nameAr: chalet.nameAr, nameEn: chalet.nameEn }
          : null,
      };
    })
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
    .slice(0, limit);

  return NextResponse.json(result);
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
