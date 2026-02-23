import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://chalet-system-pxz3v1.cranl.net";

  const locales = ["ar", "en"];

  const entries: MetadataRoute.Sitemap = [];

  // Home pages
  for (const locale of locales) {
    entries.push({
      url: `${siteUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    });
  }

  // Chalets list
  for (const locale of locales) {
    entries.push({
      url: `${siteUrl}/${locale}/chalets`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    });
  }

  // Dynamic chalets from database
  try {
    const chalets = await prisma.chalet.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    for (const locale of locales) {
      for (const chalet of chalets) {
        entries.push({
          url: `${siteUrl}/${locale}/chalets/${chalet.slug}`,
          lastModified: chalet.updatedAt,
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch {
    // If DB is not available, skip dynamic chalets
  }

  // About
  for (const locale of locales) {
    entries.push({
      url: `${siteUrl}/${locale}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  // Contact
  for (const locale of locales) {
    entries.push({
      url: `${siteUrl}/${locale}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
