import type { MetadataRoute } from "next";

const CHALET_SLUGS = ["royal-chalet", "garden-resort", "sea-view-chalet"];

export default function sitemap(): MetadataRoute.Sitemap {
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

  // Individual chalets
  for (const locale of locales) {
    for (const slug of CHALET_SLUGS) {
      entries.push({
        url: `${siteUrl}/${locale}/chalets/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
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
