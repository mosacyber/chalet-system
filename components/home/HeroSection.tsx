"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Users,
  Receipt,
} from "lucide-react";

export default function HeroSection() {
  const t = useTranslations("home");
  const locale = useLocale();
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <section className="relative flex min-h-[580px] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-background to-primary/5 sm:min-h-[650px]">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />

      <div className="container relative mx-auto px-4 py-16 text-center sm:py-20">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-2 text-sm font-medium backdrop-blur-sm">
          <CalendarDays className="h-4 w-4 text-primary" />
          {t("heroBadge")}
        </div>

        {/* Title */}
        <h1 className="mx-auto mb-6 max-w-4xl text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-5xl lg:text-6xl">
          {t("heroTitle")}
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-10 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
          {t("heroSubtitle")}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href={`/${locale}/auth/register`}>
            <Button size="lg" className="gap-2 px-8 text-base">
              <Arrow className="h-4 w-4" />
              {t("heroButton")}
            </Button>
          </Link>
          <Link href={`/${locale}/chalets`}>
            <Button variant="outline" size="lg" className="px-8 text-base">
              {isAr ? "تصفح الشاليهات" : "Browse Chalets"}
            </Button>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:mt-16 sm:gap-6 md:grid-cols-4">
          {[
            {
              icon: CalendarDays,
              value: isAr ? "تقويم ذكي" : "Smart Calendar",
              label: isAr ? "هجري + ميلادي" : "Hijri + Gregorian",
            },
            {
              icon: Receipt,
              value: isAr ? "تتبع مالي" : "Finance Tracking",
              label: isAr ? "عربون + باقي + فواتير" : "Deposits + Invoices",
            },
            {
              icon: Users,
              value: isAr ? "إدارة العملاء" : "Customer Mgmt",
              label: isAr ? "بيانات + سجل حجوزات" : "Data + Booking History",
            },
            {
              icon: BarChart3,
              value: isAr ? "تقارير شاملة" : "Full Reports",
              label: isAr ? "إيرادات + إشغال" : "Revenue + Occupancy",
            },
          ].map((item) => (
            <div
              key={item.value}
              className="rounded-xl border bg-background/60 p-4 text-center backdrop-blur-sm transition-shadow hover:shadow-md"
            >
              <item.icon className="mx-auto mb-2 h-6 w-6 text-primary sm:h-7 sm:w-7" />
              <div className="text-sm font-bold sm:text-base">{item.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
