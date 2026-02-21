import { setRequestLocale, getTranslations } from "next-intl/server";
import { Building, Target, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import JsonLd from "@/components/seo/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return {
    title: t("title"),
    description: locale === "ar" ? t("subtitle") : t("subtitle"),
    alternates: {
      languages: { ar: "/ar/about", en: "/en/about" },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "about" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: tc("siteName"),
    description: t("subtitle"),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <div className="py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Building className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-4 text-3xl font-bold md:text-4xl">{t("title")}</h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <Card className="border-0 shadow-md">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <h2 className="mb-3 text-2xl font-bold">{t("mission")}</h2>
                <p className="leading-relaxed text-muted-foreground">
                  {t("missionText")}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardContent className="p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <h2 className="mb-3 text-2xl font-bold">{t("vision")}</h2>
                <p className="leading-relaxed text-muted-foreground">
                  {t("visionText")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "+50", label: locale === "ar" ? "شاليه واستراحة" : "Chalets & Resorts" },
              { value: "+1000", label: locale === "ar" ? "حجز مكتمل" : "Completed Bookings" },
              { value: "+5", label: locale === "ar" ? "سنوات خبرة" : "Years Experience" },
              { value: "4.9", label: locale === "ar" ? "تقييم العملاء" : "Customer Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
