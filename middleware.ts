import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  // Prevent BunnyCDN from caching RSC payload as HTML.
  // BunnyCDN ignores Vary:RSC and caches text/x-component responses,
  // then serves them to browsers expecting text/html.
  response.headers.set(
    "Cache-Control",
    "public, max-age=0, must-revalidate"
  );
  response.headers.set(
    "Vary",
    "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Accept-Encoding"
  );

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
