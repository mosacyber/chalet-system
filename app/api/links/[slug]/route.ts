import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const linkPage = await prisma.linkPage.findUnique({
    where: { slug, isPublished: true },
    include: {
      links: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!linkPage) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(linkPage);
}
