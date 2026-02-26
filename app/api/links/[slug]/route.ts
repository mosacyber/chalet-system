import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const linkPage = await db.linkPages.findFirst(
      (p) => p.slug === slug && p.isPublished
    );

    if (!linkPage) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const links = await db.linkItems.findMany(
      (l) => l.linkPageId === linkPage.id && l.isActive
    );

    // Sort by sortOrder ascending
    links.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    return NextResponse.json({ ...linkPage, links });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
