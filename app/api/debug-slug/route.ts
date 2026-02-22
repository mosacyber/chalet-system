import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawSlug = url.searchParams.get("slug") || "";
  const decoded = decodeURIComponent(rawSlug);

  const chaletByDecoded = await prisma.chalet.findUnique({
    where: { slug: decoded },
    select: { id: true, slug: true },
  });

  const chaletByRaw = await prisma.chalet.findUnique({
    where: { slug: rawSlug },
    select: { id: true, slug: true },
  });

  const allChalets = await prisma.chalet.findMany({
    select: { slug: true },
  });

  return NextResponse.json({
    rawSlug,
    decoded,
    rawSlugBytes: [...Buffer.from(rawSlug, "utf-8")],
    decodedBytes: [...Buffer.from(decoded, "utf-8")],
    chaletByDecoded,
    chaletByRaw,
    allSlugs: allChalets.map((c) => ({
      slug: c.slug,
      bytes: [...Buffer.from(c.slug, "utf-8")],
    })),
  });
}
