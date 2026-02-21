"use client";

import { useTranslations } from "next-intl";
import { CalendarCheck, BadgeDollarSign, Headset, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function WhyUs() {
  const t = useTranslations("home");

  const features = [
    {
      icon: CalendarCheck,
      title: t("easyBooking"),
      description: t("easyBookingDesc"),
    },
    {
      icon: BadgeDollarSign,
      title: t("bestPrices"),
      description: t("bestPricesDesc"),
    },
    {
      icon: Headset,
      title: t("support247"),
      description: t("support247Desc"),
    },
    {
      icon: ShieldCheck,
      title: t("securePayment"),
      description: t("securePaymentDesc"),
    },
  ];

  return (
    <section className="bg-muted/50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">{t("whyUs")}</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                <p className="text-sm text-muted-foreground">
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
