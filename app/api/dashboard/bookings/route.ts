import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user;
  const role = (user as { role?: string }).role;

  if (role === "ADMIN") {
    const bookings = await db.bookings.findMany();
    const users = await db.users.findMany();
    const chalets = await db.chalets.findMany();

    const userMap = new Map(users.map((u) => [u.id, u]));
    const chaletMap = new Map(chalets.map((c) => [c.id, c]));

    const result = bookings
      .map((b) => {
        const user = userMap.get(b.userId);
        const chalet = chaletMap.get(b.chaletId);
        return {
          ...b,
          user: user ? { name: user.name } : null,
          chalet: chalet
            ? { nameAr: chalet.nameAr, nameEn: chalet.nameEn }
            : null,
        };
      })
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));

    return NextResponse.json(result);
  }

  if (role === "OWNER") {
    // Get chalets owned by this user
    const ownerChalets = await db.chalets.findMany(
      (c) => c.ownerId === user.id
    );
    const ownerChaletIds = new Set(ownerChalets.map((c) => c.id));

    const bookings = await db.bookings.findMany((b) =>
      ownerChaletIds.has(b.chaletId)
    );

    const users = await db.users.findMany();
    const userMap = new Map(users.map((u) => [u.id, u]));
    const chaletMap = new Map(ownerChalets.map((c) => [c.id, c]));

    const result = bookings
      .map((b) => {
        const user = userMap.get(b.userId);
        const chalet = chaletMap.get(b.chaletId);
        return {
          ...b,
          user: user ? { name: user.name } : null,
          chalet: chalet
            ? { nameAr: chalet.nameAr, nameEn: chalet.nameEn }
            : null,
        };
      })
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));

    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
