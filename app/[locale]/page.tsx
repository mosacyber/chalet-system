import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import HeroSection from "@/components/home/HeroSection";
import FeaturedChalets from "@/components/home/FeaturedChalets";
import WhyUs from "@/components/home/WhyUs";
import Amenities from "@/components/home/Amenities";
import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";
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
      ? "نظام إدارة الشاليهات والاستراحات - منصة متكاملة"
      : "Chalet & Resort Management System - Complete Platform",
    description: isAr
      ? "نظام إدارة شاليهات واستراحات متكامل - إدارة الحجوزات والتقويم الهجري والمالية والعملاء والتقارير. ابدأ مجاناً الآن."
      : "Complete chalet and resort management system - manage bookings, Hijri calendar, finances, customers, and reports. Start free now.",
    openGraph: {
      title: isAr
        ? "نظام إدارة الشاليهات والاستراحات"
        : "Chalet & Resort Management System",
      description: isAr
        ? "منصة متكاملة لإدارة الحجوزات والتقويم والمالية وبيانات العملاء"
        : "A complete platform for managing bookings, calendar, finances, and customer data",
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

  const isAr = locale === "ar";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: isAr ? "نظام إدارة الشاليهات والاستراحات" : "Chalet & Resort Management System",
    description: isAr
      ? "منصة متكاملة لإدارة الشاليهات والاستراحات - حجوزات، تقويم هجري، مالية، عملاء، تقارير"
      : "Complete chalet & resort management platform - bookings, Hijri calendar, finances, customers, reports",
    url: process.env.NEXT_PUBLIC_APP_URL,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "SAR",
    },
    featureList: isAr
      ? "إدارة الحجوزات, تقويم هجري, تتبع مالي, طباعة فواتير, إدارة عملاء, تقارير, ثنائي اللغة"
      : "Booking management, Hijri calendar, Financial tracking, Invoice printing, Customer management, Reports, Bilingual",
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <HeroSection />
      <WhyUs />
      <FeaturedChalets />
      <Amenities />
      <Testimonials />
      <CTASection />
    </>
  );
}
