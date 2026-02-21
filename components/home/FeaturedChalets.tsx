"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, BedDouble, Bath } from "lucide-react";

const DEMO_CHALETS = [
  {
    id: "1",
    slug: "royal-chalet",
    nameAr: "الشاليه الملكي",
    nameEn: "Royal Chalet",
    descriptionAr: "شاليه فاخر مع مسبح خاص وحديقة واسعة",
    descriptionEn: "Luxury chalet with private pool and spacious garden",
    image: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600&h=400&fit=crop",
    pricePerNight: 800,
    capacity: 15,
    bedrooms: 4,
    bathrooms: 3,
    rating: 4.8,
    amenities: ["pool", "wifi", "bbq", "parking"],
  },
  {
    id: "2",
    slug: "garden-resort",
    nameAr: "استراحة الحديقة",
    nameEn: "Garden Resort",
    descriptionAr: "استراحة عائلية مع ألعاب أطفال ومساحات خضراء",
    descriptionEn: "Family resort with kids playground and green spaces",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop",
    pricePerNight: 600,
    capacity: 20,
    bedrooms: 3,
    bathrooms: 2,
    rating: 4.6,
    amenities: ["wifi", "playground", "garden", "parking"],
  },
  {
    id: "3",
    slug: "sea-view-chalet",
    nameAr: "شاليه الإطلالة البحرية",
    nameEn: "Sea View Chalet",
    descriptionAr: "إطلالة ساحرة على البحر مع جاكوزي خارجي",
    descriptionEn: "Stunning sea view with outdoor jacuzzi",
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&h=400&fit=crop",
    pricePerNight: 1200,
    capacity: 10,
    bedrooms: 3,
    bathrooms: 2,
    rating: 4.9,
    amenities: ["pool", "jacuzzi", "wifi", "bbq"],
  },
];

export default function FeaturedChalets() {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const tch = useTranslations("chalets");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">
            {t("featuredTitle")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("featuredSubtitle")}</p>
        </div>

        {/* Chalets Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {DEMO_CHALETS.map((chalet) => (
            <Card
              key={chalet.id}
              className="group overflow-hidden transition-shadow hover:shadow-lg"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={chalet.image}
                  alt={isAr ? chalet.nameAr : chalet.nameEn}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <Badge className="absolute start-3 top-3 gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  {chalet.rating}
                </Badge>
              </div>

              <CardContent className="p-5">
                {/* Name */}
                <h3 className="mb-2 text-xl font-semibold">
                  {isAr ? chalet.nameAr : chalet.nameEn}
                </h3>

                {/* Description */}
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {isAr ? chalet.descriptionAr : chalet.descriptionEn}
                </p>

                {/* Features */}
                <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {chalet.capacity}
                  </span>
                  <span className="flex items-center gap-1">
                    <BedDouble className="h-4 w-4" />
                    {chalet.bedrooms}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-4 w-4" />
                    {chalet.bathrooms}
                  </span>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">
                      {chalet.pricePerNight}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {" "}
                      {tc("sar")} {tc("perNight")}
                    </span>
                  </div>
                  <Link href={`/${locale}/chalets/${chalet.slug}`}>
                    <Button size="sm">{tc("viewDetails")}</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All */}
        <div className="mt-10 text-center">
          <Link href={`/${locale}/chalets`}>
            <Button variant="outline" size="lg">
              {tch("title")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
