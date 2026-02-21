import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import ChaletDetail from "@/components/chalets/ChaletDetail";
import JsonLd from "@/components/seo/JsonLd";

const CHALETS_DATA: Record<string, {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  images: string[];
  pricePerNight: number;
  weekendPrice: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  rating: number;
  reviewCount: number;
  amenities: string[];
  locationAr: string;
  locationEn: string;
}> = {
  "royal-chalet": {
    id: "1",
    slug: "royal-chalet",
    nameAr: "الشاليه الملكي",
    nameEn: "Royal Chalet",
    descriptionAr: "شاليه فاخر مع مسبح خاص وحديقة واسعة ومنطقة شواء مجهزة بالكامل. يتميز بتصميم عصري وديكورات فخمة مع إطلالة رائعة. مثالي للعائلات والمجموعات الكبيرة.",
    descriptionEn: "Luxury chalet with private pool, spacious garden and fully equipped BBQ area. Features modern design and luxurious decor with wonderful views. Perfect for families and large groups.",
    images: [
      "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=500&fit=crop",
    ],
    pricePerNight: 800,
    weekendPrice: 1000,
    capacity: 15,
    bedrooms: 4,
    bathrooms: 3,
    rating: 4.8,
    reviewCount: 24,
    amenities: ["pool", "wifi", "bbq", "parking", "ac", "kitchen", "tv", "garden"],
    locationAr: "الرياض - حي النرجس",
    locationEn: "Riyadh - Al Narjis District",
  },
  "garden-resort": {
    id: "2",
    slug: "garden-resort",
    nameAr: "استراحة الحديقة",
    nameEn: "Garden Resort",
    descriptionAr: "استراحة عائلية مع ألعاب أطفال ومساحات خضراء واسعة ومسبح آمن للأطفال. تحتوي على مطبخ مجهز بالكامل ومنطقة شواء وجلسات خارجية مميزة.",
    descriptionEn: "Family resort with kids playground, wide green spaces and safe children pool. Features fully equipped kitchen, BBQ area and special outdoor seating.",
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=500&fit=crop",
    ],
    pricePerNight: 600,
    weekendPrice: 800,
    capacity: 20,
    bedrooms: 3,
    bathrooms: 2,
    rating: 4.6,
    reviewCount: 18,
    amenities: ["wifi", "playground", "garden", "parking", "ac", "kitchen", "pool"],
    locationAr: "الرياض - حي العارض",
    locationEn: "Riyadh - Al Arid District",
  },
  "sea-view-chalet": {
    id: "3",
    slug: "sea-view-chalet",
    nameAr: "شاليه الإطلالة البحرية",
    nameEn: "Sea View Chalet",
    descriptionAr: "إطلالة ساحرة على البحر مع جاكوزي خارجي ومسبح لا متناهي. تصميم فاخر مع أثاث عصري وغرف واسعة.",
    descriptionEn: "Stunning sea view with outdoor jacuzzi and infinity pool. Luxury design with modern furniture and spacious rooms.",
    images: [
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&h=500&fit=crop",
    ],
    pricePerNight: 1200,
    weekendPrice: 1500,
    capacity: 10,
    bedrooms: 3,
    bathrooms: 2,
    rating: 4.9,
    reviewCount: 32,
    amenities: ["pool", "jacuzzi", "wifi", "bbq", "ac", "tv", "kitchen"],
    locationAr: "جدة - أبحر الشمالية",
    locationEn: "Jeddah - North Obhur",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const chalet = CHALETS_DATA[slug];
  if (!chalet) return { title: "Not Found" };

  const isAr = locale === "ar";
  const name = isAr ? chalet.nameAr : chalet.nameEn;
  const description = isAr ? chalet.descriptionAr : chalet.descriptionEn;

  return {
    title: name,
    description: description.slice(0, 160),
    openGraph: {
      title: name,
      description: description.slice(0, 160),
      images: [{ url: chalet.images[0] }],
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
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const chalet = CHALETS_DATA[slug];
  if (!chalet) {
    return (
      <div className="container mx-auto flex min-h-[50vh] items-center justify-center px-4">
        <p className="text-xl text-muted-foreground">
          {locale === "ar" ? "الشاليه غير موجود" : "Chalet not found"}
        </p>
      </div>
    );
  }

  const isAr = locale === "ar";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: isAr ? chalet.nameAr : chalet.nameEn,
    description: isAr ? chalet.descriptionAr : chalet.descriptionEn,
    image: chalet.images[0],
    address: {
      "@type": "PostalAddress",
      addressLocality: isAr ? chalet.locationAr : chalet.locationEn,
      addressCountry: "SA",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: chalet.rating,
      reviewCount: chalet.reviewCount,
    },
    offers: {
      "@type": "Offer",
      price: chalet.pricePerNight,
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
      <ChaletDetail chalet={chalet} />
    </>
  );
}
