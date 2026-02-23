import { PrismaClient } from "@prisma/client";

let migrated = false;

export async function autoMigrate(prisma: PrismaClient) {
  if (migrated) return;
  migrated = true;

  const run = async (sql: string) => {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch {
      // Ignore errors (already exists, duplicate, etc.)
    }
  };

  try {
    // V7: LinkPage and LinkItem tables
    await run(`CREATE TABLE IF NOT EXISTS "LinkPage" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "slug" TEXT NOT NULL, "displayName" TEXT NOT NULL, "bio" TEXT, "avatarUrl" TEXT, "themeColor" TEXT NOT NULL DEFAULT '#10b981', "isPublished" BOOLEAN NOT NULL DEFAULT false, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "LinkPage_pkey" PRIMARY KEY ("id"))`);
    await run(`CREATE UNIQUE INDEX IF NOT EXISTS "LinkPage_userId_key" ON "LinkPage"("userId")`);
    await run(`CREATE UNIQUE INDEX IF NOT EXISTS "LinkPage_slug_key" ON "LinkPage"("slug")`);
    await run(`ALTER TABLE "LinkPage" ADD CONSTRAINT "LinkPage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`);

    await run(`CREATE TABLE IF NOT EXISTS "LinkItem" ("id" TEXT NOT NULL, "linkPageId" TEXT NOT NULL, "title" TEXT NOT NULL, "url" TEXT NOT NULL, "iconType" TEXT NOT NULL DEFAULT 'link', "sortOrder" INTEGER NOT NULL DEFAULT 0, "isActive" BOOLEAN NOT NULL DEFAULT true, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "LinkItem_pkey" PRIMARY KEY ("id"))`);
    await run(`CREATE INDEX IF NOT EXISTS "LinkItem_linkPageId_idx" ON "LinkItem"("linkPageId")`);
    await run(`ALTER TABLE "LinkItem" ADD CONSTRAINT "LinkItem_linkPageId_fkey" FOREIGN KEY ("linkPageId") REFERENCES "LinkPage"("id") ON DELETE CASCADE ON UPDATE CASCADE`);

    // V8: VIP features
    await run(`ALTER TABLE "LinkPage" ADD COLUMN IF NOT EXISTS "subtitle" TEXT`);
    await run(`ALTER TABLE "LinkPage" ADD COLUMN IF NOT EXISTS "backgroundStyle" TEXT NOT NULL DEFAULT 'flat'`);
    await run(`ALTER TABLE "LinkPage" ADD COLUMN IF NOT EXISTS "buttonStyle" TEXT NOT NULL DEFAULT 'rounded'`);
    await run(`ALTER TABLE "LinkPage" ADD COLUMN IF NOT EXISTS "fontFamily" TEXT NOT NULL DEFAULT 'default'`);
    await run(`ALTER TABLE "LinkItem" ADD COLUMN IF NOT EXISTS "linkType" TEXT NOT NULL DEFAULT 'link'`);
    await run(`ALTER TABLE "LinkItem" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT false`);
    await run(`ALTER TABLE "LinkItem" ADD COLUMN IF NOT EXISTS "thumbnail" TEXT`);

    console.log("[auto-migrate] Migration check complete");
  } catch {
    // Silent fail - don't break the app
  }
}
