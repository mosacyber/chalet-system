import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import HeroSection from "@/components/home/HeroSection";
import FeaturedChalets from "@/components/home/FeaturedChalets";
import WhyUs from "@/components/home/WhyUs";
import Amenities from "@/components/home/Amenities";
import Testimonials from "@/components/home/Testimonials";
import JsonLd from "@/components/seo/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  return {
    title: isAr
      ? "شاليهات الراحة - أفضل الشاليهات والاستراحات"
      : "Al-Raha Chalets - Best Chalets & Resorts",
    description: isAr
      ? "اكتشف أفضل الشاليهات والاستراحات - احجز الآن واستمتع بأجمل الأوقات مع العائلة والأصدقاء. حجز سهل وسريع بأفضل الأسعار."
      : "Discover the best chalets and resorts - Book now and enjoy the best times with family and friends. Easy and fast booking at the best prices.",
    openGraph: {
      title: isAr
        ? "شاليهات الراحة - أفضل الشاليهات والاستراحات"
        : "Al-Raha Chalets - Best Chalets & Resorts",
      description: isAr
        ? "احجز الآن واستمتع بأجمل الأوقات مع العائلة والأصدقاء"
        : "Book now and enjoy the best times with family and friends",
    },
    alternates: {
      languages: {
        ar: "/ar",
        en: "/en",
      },
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: locale === "ar" ? "شاليهات الراحة" : "Al-Raha Chalets",
    description:
      locale === "ar"
        ? "أفضل الشاليهات والاستراحات - احجز الآن واستمتع بأجمل الأوقات"
        : "Best Chalets & Resorts - Book now and enjoy the best times",
    url: process.env.NEXT_PUBLIC_APP_URL,
    currenciesAccepted: "SAR",
    paymentAccepted: "Cash, Credit Card, Mada",
    priceRange: "$$",
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <HeroSection />
      <FeaturedChalets />
      <WhyUs />
      <Amenities />
      <Testimonials />
    </>
  );
}
