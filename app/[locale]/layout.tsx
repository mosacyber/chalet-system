import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Cairo, Inter } from "next/font/google";
import { routing } from "@/i18n/routing";
import { Toaster } from "@/components/ui/sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import "../globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isAr = locale === "ar";

  return {
    title: {
      default: isAr
        ? "شاليهات الراحة - أفضل الشاليهات والاستراحات"
        : "Al-Raha Chalets - Best Chalets & Resorts",
      template: isAr ? "%s | شاليهات الراحة" : "%s | Al-Raha Chalets",
    },
    description: isAr
      ? "اكتشف أفضل الشاليهات والاستراحات - احجز الآن واستمتع بأجمل الأوقات مع العائلة والأصدقاء. حجز سهل وسريع بأفضل الأسعار."
      : "Discover the best chalets and resorts - Book now and enjoy the best times with family and friends. Easy and fast booking at the best prices.",
    keywords: isAr
      ? [
          "شاليهات",
          "استراحات",
          "حجز شاليه",
          "شاليهات للإيجار",
          "استراحات للإيجار",
          "حجز استراحة",
          "شاليهات عائلية",
          "استراحات عائلية",
        ]
      : [
          "chalets",
          "resorts",
          "book chalet",
          "chalets for rent",
          "resorts for rent",
          "family chalets",
          "vacation rental",
        ],
    openGraph: {
      type: "website",
      locale: isAr ? "ar_SA" : "en_US",
      siteName: isAr ? "شاليهات الراحة" : "Al-Raha Chalets",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      languages: {
        ar: "/ar",
        en: "/en",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "ar" | "en")) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const fontClass = isAr ? cairo.variable : inter.variable;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${fontClass} font-sans antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster position={isAr ? "bottom-left" : "bottom-right"} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
