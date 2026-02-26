import { setRequestLocale } from "next-intl/server";
import ChaletDetail from "@/components/chalets/ChaletDetail";
import JsonLd from "@/components/seo/JsonLd";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const chalet = await db.chalets.findFirst((c) => c.slug === slug);

  if (!chalet) return { title: "Not Found" };

  if (!chalet.isActive) {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (role !== "ADMIN" && role !== "OWNER") return { title: "Not Found" };
  }

  const isAr = locale === "ar";
  const name = isAr ? chalet.nameAr : chalet.nameEn;
  const description = isAr ? chalet.descriptionAr : chalet.descriptionEn;

  return {
    title: name,
    description: description.slice(0, 160),
    openGraph: {
      title: name,
      description: description.slice(0, 160),
      images: chalet.images[0] ? [{ url: chalet.images[0] }] : [],
    },
    alternates: {
      languages: {
        ar: `/ar/chalets/${slug}`,
        en: `/en/chalets/${slug}`,
      },
    },
  };
}

export default async function ChaletPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  setRequestLocale(locale);

  const chalet = await db.chalets.findFirst((c) => c.slug === slug);

  if (!chalet) {
    notFound();
  }

  if (!chalet.isActive) {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (role !== "ADMIN" && role !== "OWNER") {
      notFound();
    }
  }

  const reviews = await db.reviews.findMany(
    (r) => r.chaletId === chalet.id && r.isVisible
  );

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const chaletData = {
    id: chalet.id,
    slug: chalet.slug,
    nameAr: chalet.nameAr,
    nameEn: chalet.nameEn,
    descriptionAr: chalet.descriptionAr,
    descriptionEn: chalet.descriptionEn,
    images: chalet.images,
    pricePerNight: Number(chalet.pricePerNight),
    weekendPrice: chalet.weekendPrice ? Number(chalet.weekendPrice) : 0,
    capacity: chalet.capacity,
    bedrooms: chalet.bedrooms,
    bathrooms: chalet.bathrooms,
    rating: Math.round(avgRating * 10) / 10,
    reviewCount: reviews.length,
    amenities: chalet.amenities,
    locationAr: chalet.locationAr,
    locationEn: chalet.locationEn,
  };

  const isAr = locale === "ar";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: isAr ? chalet.nameAr : chalet.nameEn,
    description: isAr ? chalet.descriptionAr : chalet.descriptionEn,
    image: chalet.images[0] || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: isAr ? chalet.locationAr : chalet.locationEn,
      addressCountry: "SA",
    },
    ...(chaletData.rating > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: chaletData.rating,
        reviewCount: chaletData.reviewCount,
      },
    }),
    offers: {
      "@type": "Offer",
      price: chaletData.pricePerNight,
      priceCurrency: "SAR",
    },
    amenityFeature: chalet.amenities.map((a) => ({
      "@type": "LocationFeatureSpecification",
      name: a,
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <ChaletDetail chalet={chaletData} />
    </>
  );
}
