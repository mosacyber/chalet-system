"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Search, CalendarDays } from "lucide-react";

export default function HeroSection() {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const locale = useLocale();

  return (
    <section className="relative flex min-h-[600px] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />

      <div className="container relative mx-auto px-4 py-20 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm font-medium backdrop-blur-sm">
          <CalendarDays className="h-4 w-4 text-primary" />
          {tc("bookNow")}
        </div>

        {/* Title */}
        <h1 className="mx-auto mb-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
          {t("heroTitle")}
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
          {t("heroSubtitle")}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href={`/${locale}/chalets`}>
            <Button size="lg" className="gap-2 px-8 text-base">
              <Search className="h-4 w-4" />
              {tc("chalets")}
            </Button>
          </Link>
          <Link href={`/${locale}/contact`}>
            <Button variant="outline" size="lg" className="px-8 text-base">
              {tc("contact")}
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { value: "+50", label: locale === "ar" ? "شاليه" : "Chalets" },
            { value: "+1000", label: locale === "ar" ? "عميل سعيد" : "Happy Clients" },
            { value: "4.9", label: locale === "ar" ? "تقييم" : "Rating" },
            { value: "24/7", label: locale === "ar" ? "دعم فني" : "Support" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-primary md:text-4xl">
                {stat.value}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
