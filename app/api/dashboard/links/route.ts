import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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

    const linkPage = await db.linkPages.findFirst((p) => p.userId === userId);
    if (linkPage) {
      const links = await db.linkItems.findMany((l) => l.linkPageId === linkPage.id);
      links.sort((a, b) => a.sortOrder - b.sortOrder);
      return NextResponse.json({ ...linkPage, links });
    }

    return NextResponse.json(null);
  } catch (error) {
    console.error("Links GET error:", error);
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
    const {
      slug,
      displayName,
      subtitle,
      bio,
      themeColor,
      backgroundStyle,
      buttonStyle,
      fontFamily,
      isPublished,
      links,
    } = body;

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "Invalid slug format" },
        { status: 400 }
      );
    }

    const existingPage = await db.linkPages.findFirst((p) => p.slug === slug);
    if (existingPage && existingPage.userId !== userId) {
      return NextResponse.json(
        { error: "Slug already taken" },
        { status: 409 }
      );
    }

    const pageData = {
      slug,
      displayName: displayName || "",
      subtitle: subtitle || null,
      bio: bio || null,
      themeColor: themeColor || "#10b981",
      backgroundStyle: backgroundStyle || "flat",
      buttonStyle: buttonStyle || "rounded",
      fontFamily: fontFamily || "default",
      isPublished: isPublished ?? false,
    };

    const page = await db.linkPages.upsert(
      (p) => p.userId === userId,
      { userId, avatarUrl: null, ...pageData },
      pageData
    );

    await db.linkItems.deleteMany((l) => l.linkPageId === page.id);

    if (links && Array.isArray(links) && links.length > 0) {
      await db.linkItems.createMany(
        links.map(
          (
            link: {
              title: string;
              url: string;
              iconType?: string;
              linkType?: string;
              isActive?: boolean;
              isFeatured?: boolean;
              thumbnail?: string;
            },
            index: number
          ) => ({
            linkPageId: page.id,
            title: link.title,
            url: link.url || "",
            iconType: link.iconType || "link",
            linkType: link.linkType || "link",
            sortOrder: index,
            isActive: link.isActive ?? true,
            isFeatured: link.isFeatured ?? false,
            thumbnail: link.thumbnail || null,
          })
        )
      );
    }

    const updatedLinks = await db.linkItems.findMany((l) => l.linkPageId === page.id);
    updatedLinks.sort((a, b) => a.sortOrder - b.sortOrder);

    return NextResponse.json({ ...page, links: updatedLinks });
  } catch (error) {
    console.error("Links POST error:", error);
    return NextResponse.json(
      { error: "Failed to save. Please make sure the database is migrated." },
      { status: 500 }
    );
  }
}
