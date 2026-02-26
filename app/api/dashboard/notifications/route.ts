import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id;

  const notifications = await db.notifications.findMany(
    (n) => n.userId === userId
  );

  // Sort by createdAt descending and limit to 50
  notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const limited = notifications.slice(0, 50);

  return NextResponse.json(limited);
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (body.markAllRead) {
    const userId = (session.user as { id?: string }).id;
    await db.notifications.updateMany(
      (n) => n.userId === userId && !n.isRead,
      { isRead: true }
    );
    return NextResponse.json({ success: true });
  }

  const { id, isRead } = body;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await db.notifications.update(id, { isRead: isRead ?? true });

  return NextResponse.json({ success: true });
}
