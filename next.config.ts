import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "@whiskeysockets/baileys",
    "pino",
    "libsignal",
    "qrcode",
  ],
  headers: async () => [
    {
      // All page routes (not static assets)
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      headers: [
        {
          // Override Next.js s-maxage=31536000 to prevent BunnyCDN
          // from caching RSC payload (text/x-component) as HTML
          key: "Cache-Control",
          value: "public, max-age=0, must-revalidate",
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
