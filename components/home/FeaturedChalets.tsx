"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, BedDouble, Bath, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Chalet {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  images: string[];
  pricePerNight: number;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  rating: number;
}

export default function FeaturedChalets() {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const tch = useTranslations("chalets");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [chalets, setChalets] = useState<Chalet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chalets")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setChalets(data.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto flex justify-center px-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!chalets.length) return null;

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">
            {t("featuredTitle")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("featuredSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {chalets.map((chalet) => (
            <Card
              key={chalet.id}
              className="group overflow-hidden transition-shadow hover:shadow-lg"
            >
              <div className="relative h-56 overflow-hidden bg-muted">
                {chalet.images?.[0] ? (
                  <Image
                    src={chalet.images[0]}
                    alt={isAr ? chalet.nameAr : chalet.nameEn}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    {isAr ? "لا توجد صورة" : "No image"}
                  </div>
                )}
                {chalet.rating > 0 && (
                  <Badge className="absolute start-3 top-3 gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    {chalet.rating}
                  </Badge>
                )}
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
