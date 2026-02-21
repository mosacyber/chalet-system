import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import ChaletsGrid from "@/components/chalets/ChaletsGrid";
import JsonLd from "@/components/seo/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "chalets" });
  const tc = await getTranslations({ locale, namespace: "common" });

  return {
    title: t("title"),
    description:
      locale === "ar"
        ? "تصفح جميع الشاليهات والاستراحات المتاحة - اختر الشاليه المناسب واحجز الآن"
        : "Browse all available chalets and resorts - Choose the right chalet and book now",
    alternates: {
      languages: {
        ar: "/ar/chalets",
        en: "/en/chalets",
      },
    },
  };
}

export default async function ChaletsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: locale === "ar" ? "جميع الشاليهات" : "All Chalets",
    description:
      locale === "ar"
        ? "قائمة الشاليهات والاستراحات المتاحة للحجز"
        : "List of available chalets and resorts for booking",
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ChaletsGrid />
    </>
  );
}
