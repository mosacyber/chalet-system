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

  const isOwner = role === "OWNER";

  // Get owner's chalet IDs for filtering
  let ownerChaletIds: string[] = [];
  if (isOwner) {
    const ownerChalets = await db.chalets.findMany(
      (c) => c.ownerId === session.user!.id
    );
    ownerChaletIds = ownerChalets.map((c) => c.id);
  }

  const expenses = await db.waterExpenses.findMany(
    isOwner
      ? (e) => ownerChaletIds.includes(e.chaletId)
      : undefined
  );

  // Manual join with chalets and sort by date desc
  const expensesWithChalets = await Promise.all(
    expenses.map(async (e) => {
      const chalet = await db.chalets.findUnique(e.chaletId);
      return {
        ...e,
        chalet: chalet
          ? { nameAr: chalet.nameAr, nameEn: chalet.nameEn }
          : { nameAr: "", nameEn: "" },
      };
    })
  );

  const sorted = expensesWithChalets.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return NextResponse.json(
    sorted.map((e) => ({
      id: e.id,
      chaletId: e.chaletId,
      chaletNameAr: e.chalet.nameAr,
      chaletNameEn: e.chalet.nameEn,
      amount: Number(e.amount),
      notes: e.notes,
      date: e.date.split("T")[0],
      createdAt: e.createdAt,
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
    const chalet = await db.chalets.findFirst(
      (c) => c.id === chaletId && c.ownerId === session.user!.id
    );
    if (!chalet) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const expense = await db.waterExpenses.create({
    chaletId,
    amount: Number(amount),
    notes: notes || null,
    date: date ? new Date(date + "T00:00:00Z").toISOString() : new Date().toISOString(),
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
    const expense = await db.waterExpenses.findUnique(id);
    if (!expense) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const chalet = await db.chalets.findUnique(expense.chaletId);
    if (!chalet || chalet.ownerId !== session.user!.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  await db.waterExpenses.delete(id);

  return NextResponse.json({ message: "Deleted" });
}
