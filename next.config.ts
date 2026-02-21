import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  headers: async () => [
    {
      // All page routes (not static assets)
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      headers: [
        {
          // Prevent CDN from caching HTML/RSC responses
          // (BunnyCDN strips Vary:RSC, causing it to serve RSC payload as HTML)
          key: "CDN-Cache-Control",
          value: "no-store",
        },
        {
          key: "Vary",
          value: "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Accept-Encoding",
        },
      ],
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
