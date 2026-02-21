"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, Users, BedDouble, Bath, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

const ALL_CHALETS = [
  {
    id: "1",
    slug: "royal-chalet",
    nameAr: "الشاليه الملكي",
    nameEn: "Royal Chalet",
    descriptionAr: "شاليه فاخر مع مسبح خاص وحديقة واسعة ومنطقة شواء مجهزة بالكامل",
    descriptionEn: "Luxury chalet with private pool, spacious garden and fully equipped BBQ area",
    image: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600&h=400&fit=crop",
    pricePerNight: 800,
    capacity: 15,
    bedrooms: 4,
    bathrooms: 3,
    rating: 4.8,
    amenities: ["pool", "wifi", "bbq", "parking", "ac", "kitchen"],
  },
  {
    id: "2",
    slug: "garden-resort",
    nameAr: "استراحة الحديقة",
    nameEn: "Garden Resort",
    descriptionAr: "استراحة عائلية مع ألعاب أطفال ومساحات خضراء واسعة ومسبح آمن للأطفال",
    descriptionEn: "Family resort with kids playground, wide green spaces and safe children pool",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop",
    pricePerNight: 600,
    capacity: 20,
    bedrooms: 3,
    bathrooms: 2,
    rating: 4.6,
    amenities: ["wifi", "playground", "garden", "parking", "ac", "kitchen"],
  },
  {
    id: "3",
    slug: "sea-view-chalet",
    nameAr: "شاليه الإطلالة البحرية",
    nameEn: "Sea View Chalet",
    descriptionAr: "إطلالة ساحرة على البحر مع جاكوزي خارجي ومسبح لا متناهي",
    descriptionEn: "Stunning sea view with outdoor jacuzzi and infinity pool",
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=600&h=400&fit=crop",
    pricePerNight: 1200,
    capacity: 10,
    bedrooms: 3,
    bathrooms: 2,
    rating: 4.9,
    amenities: ["pool", "jacuzzi", "wifi", "bbq", "ac", "tv"],
  },
  {
    id: "4",
    slug: "mountain-retreat",
    nameAr: "شاليه الجبل",
    nameEn: "Mountain Retreat",
    descriptionAr: "شاليه هادئ في أحضان الطبيعة مع إطلالة على الجبال",
    descriptionEn: "Peaceful chalet in nature with mountain views",
    image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=600&h=400&fit=crop",
    pricePerNight: 500,
    capacity: 8,
    bedrooms: 2,
    bathrooms: 1,
    rating: 4.7,
    amenities: ["wifi", "garden", "bbq", "parking", "ac"],
  },
  {
    id: "5",
    slug: "luxury-villa",
    nameAr: "الفيلا الفاخرة",
    nameEn: "Luxury Villa",
    descriptionAr: "فيلا فخمة مع كل وسائل الراحة والترفيه",
    descriptionEn: "Premium villa with all comfort and entertainment amenities",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop",
    pricePerNight: 1500,
    capacity: 25,
    bedrooms: 5,
    bathrooms: 4,
    rating: 5.0,
    amenities: ["pool", "jacuzzi", "wifi", "bbq", "parking", "ac", "kitchen", "tv", "garden", "football"],
  },
  {
    id: "6",
    slug: "family-chalet",
    nameAr: "شاليه العائلة",
    nameEn: "Family Chalet",
    descriptionAr: "شاليه مثالي للعائلات مع مساحات واسعة وألعاب متنوعة",
    descriptionEn: "Perfect family chalet with spacious areas and various games",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop",
    pricePerNight: 700,
    capacity: 18,
    bedrooms: 4,
    bathrooms: 3,
    rating: 4.5,
    amenities: ["pool", "wifi", "playground", "garden", "parking", "ac", "kitchen", "volleyball"],
  },
];

export default function ChaletsGrid() {
  const t = useTranslations("chalets");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChalets = ALL_CHALETS.filter((chalet) => {
    const name = isAr ? chalet.nameAr : chalet.nameEn;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">{t("title")}</h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Search */}
        <div className="mb-8 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={tc("search") + "..."}
              className="ps-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredChalets.map((chalet) => (
            <Card
              key={chalet.id}
              className="group overflow-hidden transition-shadow hover:shadow-lg"
            >
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
                <h3 className="mb-2 text-xl font-semibold">
                  {isAr ? chalet.nameAr : chalet.nameEn}
                </h3>

                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {isAr ? chalet.descriptionAr : chalet.descriptionEn}
                </p>

                <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {chalet.capacity} {t("person")}
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
      </div>
    </section>
  );
}
