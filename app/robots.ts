import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://chalet-system-pxz3v1.cranl.net";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/*/dashboard/", "/*/auth/", "/*/booking/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
