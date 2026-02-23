"use client";

import { useTranslations } from "next-intl";
import {
  CalendarDays,
  Banknote,
  Printer,
  Building2,
  Users,
  BarChart3,
  Languages,
  Moon,
  Smartphone,
  Bell,
  Droplets,
  CalendarCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function WhyUs() {
  const t = useTranslations("home");

  const features = [
    { icon: CalendarDays, title: t("feat_calendar"), description: t("feat_calendarDesc") },
    { icon: Banknote, title: t("feat_finance"), description: t("feat_financeDesc") },
    { icon: Printer, title: t("feat_invoice"), description: t("feat_invoiceDesc") },
    { icon: Building2, title: t("feat_multiChalet"), description: t("feat_multiChaletDesc") },
    { icon: Users, title: t("feat_customers"), description: t("feat_customersDesc") },
    { icon: BarChart3, title: t("feat_reports"), description: t("feat_reportsDesc") },
    { icon: Languages, title: t("feat_bilingual"), description: t("feat_bilingualDesc") },
    { icon: CalendarCheck, title: t("feat_hijri"), description: t("feat_hijriDesc") },
    { icon: Droplets, title: t("feat_water"), description: t("feat_waterDesc") },
    { icon: Moon, title: t("feat_dark"), description: t("feat_darkDesc") },
    { icon: Smartphone, title: t("feat_responsive"), description: t("feat_responsiveDesc") },
    { icon: Bell, title: t("feat_notifications"), description: t("feat_notificationsDesc") },
  ];

  return (
    <section className="bg-muted/50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">{t("featuresTitle")}</h2>
          <p className="text-lg text-muted-foreground">{t("featuresSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-0 bg-background text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <CardContent className="p-6">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
