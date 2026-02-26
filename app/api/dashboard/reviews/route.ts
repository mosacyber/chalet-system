import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userId = (session.user as { id?: string }).id;

  let reviews;

  if (role === "ADMIN") {
    reviews = await db.reviews.findMany();
  } else {
    // OWNER: only reviews for chalets they own
    const ownerChalets = await db.chalets.findMany(
      (c) => c.ownerId === userId
    );
    const ownerChaletIds = new Set(ownerChalets.map((c) => c.id));
    reviews = await db.reviews.findMany((r) => ownerChaletIds.has(r.chaletId));
  }

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
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));

  return NextResponse.json(result);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { id, isVisible } = body;

  if (!id || typeof isVisible !== "boolean") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  await db.reviews.update(id, { isVisible });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await db.reviews.delete(id);

  return NextResponse.json({ success: true });
}
