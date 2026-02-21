import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import ContactForm from "@/components/contact/ContactForm";
import JsonLd from "@/components/seo/JsonLd";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  return {
    title: isAr ? "تواصل معنا" : "Contact Us",
    description: isAr
      ? "تواصل مع فريق شاليهات الراحة - نسعد بخدمتكم والإجابة على استفساراتكم"
      : "Contact Al-Raha Chalets team - We are happy to serve you and answer your inquiries",
    alternates: {
      languages: {
        ar: "/ar/contact",
        en: "/en/contact",
      },
    },
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: locale === "ar" ? "تواصل معنا" : "Contact Us",
    url: `${process.env.NEXT_PUBLIC_APP_URL || "https://chalet-system-pxz3v1.cranl.net"}/${locale}/contact`,
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ContactForm />
    </>
  );
}
