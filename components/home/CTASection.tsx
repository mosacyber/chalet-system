"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function CTASection() {
  const t = useTranslations("home");
  const locale = useLocale();
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary/80 px-6 py-16 text-center text-primary-foreground sm:px-12">
          <h2 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl">
            {t("ctaTitle")}
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-base opacity-90 sm:text-lg">
            {t("ctaSubtitle")}
          </p>
          <Link href={`/${locale}/auth/register`}>
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 px-8 text-base font-semibold"
            >
              <Arrow className="h-4 w-4" />
              {t("ctaButton")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
