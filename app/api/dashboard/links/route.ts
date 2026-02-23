import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "ADMIN" && role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = (session.user as { id: string }).id;

    const linkPage = await prisma.linkPage.findUnique({
      where: { userId },
      include: {
        links: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(linkPage);
  } catch (error) {
    console.error("Links GET error:", error);
    // Table may not exist yet - return null gracefully
    return NextResponse.json(null);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    if (role !== "ADMIN" && role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = (session.user as { id: string }).id;
    const body = await request.json();
    const { slug, displayName, bio, themeColor, isPublished, links } = body;

    // Validate slug format (only lowercase letters, numbers, hyphens)
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Invalid slug format" },
        { status: 400 }
      );
    }

    // Check slug uniqueness (exclude current user's page)
    const existingPage = await prisma.linkPage.findUnique({
      where: { slug },
    });
    if (existingPage && existingPage.userId !== userId) {
      return NextResponse.json(
        { error: "Slug already taken" },
        { status: 409 }
      );
    }

    // Use transaction to update page and links together
    const result = await prisma.$transaction(async (tx) => {
      // Upsert the link page
      const page = await tx.linkPage.upsert({
        where: { userId },
        create: {
          userId,
          slug,
          displayName: displayName || "",
          bio: bio || null,
          themeColor: themeColor || "#10b981",
          isPublished: isPublished ?? false,
        },
        update: {
          slug,
          displayName: displayName || "",
          bio: bio || null,
          themeColor: themeColor || "#10b981",
          isPublished: isPublished ?? false,
        },
      });

      // Delete existing links and recreate
      await tx.linkItem.deleteMany({
        where: { linkPageId: page.id },
      });

      // Create new links
      if (links && Array.isArray(links) && links.length > 0) {
        await tx.linkItem.createMany({
          data: links.map(
            (
              link: {
                title: string;
                url: string;
                iconType?: string;
                isActive?: boolean;
              },
              index: number
            ) => ({
              linkPageId: page.id,
              title: link.title,
              url: link.url,
              iconType: link.iconType || "link",
              sortOrder: index,
              isActive: link.isActive ?? true,
            })
          ),
        });
      }

      // Return page with links
      return tx.linkPage.findUnique({
        where: { id: page.id },
        include: {
          links: {
            orderBy: { sortOrder: "asc" },
          },
        },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Links POST error:", error);
    return NextResponse.json(
      { error: "Failed to save. Please make sure the database is migrated." },
      { status: 500 }
    );
  }
}
