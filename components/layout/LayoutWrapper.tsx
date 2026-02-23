"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname.includes("/dashboard");
  const isLinksPage = /^\/(ar|en)\/links\//.test(pathname);
  const lastTracked = useRef("");

  // Track public page visits
  useEffect(() => {
    if (isDashboard || isLinksPage || !pathname || pathname === lastTracked.current) return;
    lastTracked.current = pathname;

    // Strip locale prefix for cleaner page names
    const page = pathname.replace(/^\/(ar|en)/, "") || "/";
    fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page }),
    }).catch(() => {});
  }, [pathname, isDashboard, isLinksPage]);

  if (isDashboard || isLinksPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
