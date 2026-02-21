"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Star, Users, BedDouble, Bath, Search, Loader2 } from "lucide-react";
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

export default function ChaletsGrid() {
  const t = useTranslations("chalets");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [searchQuery, setSearchQuery] = useState("");

  const [chalets, setChalets] = useState<Chalet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chalets")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setChalets(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredChalets = chalets.filter((chalet) => {
    const name = isAr ? chalet.nameAr : chalet.nameEn;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">{t("title")}</h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

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

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !filteredChalets.length ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <p className="text-lg text-muted-foreground">
              {isAr ? "لا توجد شاليهات متاحة حالياً" : "No chalets available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredChalets.map((chalet) => (
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
        )}
      </div>
    </section>
  );
}
