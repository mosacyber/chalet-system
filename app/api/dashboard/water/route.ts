import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN" && role !== "OWNER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const isOwner = role === "OWNER";
  const where = isOwner ? { chalet: { ownerId: session.user.id } } : {};

  const expenses = await prisma.waterExpense.findMany({
    where,
    include: {
      chalet: { select: { nameAr: true, nameEn: true } },
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(
    expenses.map((e) => ({
      id: e.id,
      chaletId: e.chaletId,
      chaletNameAr: e.chalet.nameAr,
      chaletNameEn: e.chalet.nameEn,
      amount: Number(e.amount),
      notes: e.notes,
      date: e.date.toISOString().split("T")[0],
      createdAt: e.createdAt.toISOString(),
    }))
  );
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
  const { chaletId, amount, notes, date } = body;

  if (!chaletId || !amount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify ownership for OWNER
  if (role === "OWNER") {
    const chalet = await prisma.chalet.findFirst({
      where: { id: chaletId, ownerId: session.user.id },
    });
    if (!chalet) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const expense = await prisma.waterExpense.create({
    data: {
      chaletId,
      amount: Number(amount),
      notes: notes || null,
      date: date ? new Date(date + "T00:00:00Z") : new Date(),
    },
  });

  return NextResponse.json({ id: expense.id, message: "Created" });
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

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Verify ownership for OWNER
  if (role === "OWNER") {
    const expense = await prisma.waterExpense.findFirst({
      where: { id },
      include: { chalet: { select: { ownerId: true } } },
    });
    if (!expense || expense.chalet.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  await prisma.waterExpense.delete({ where: { id } });

  return NextResponse.json({ message: "Deleted" });
}
