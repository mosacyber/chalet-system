"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  Users,
  BedDouble,
  Bath,
  MapPin,
  Wifi,
  Waves,
  Flame,
  Car,
  Snowflake,
  CookingPot,
  Tv,
  TreePine,
  Baby,
  Goal,
  CircleDot,
  Droplets,
  CalendarDays,
} from "lucide-react";
import { useState } from "react";
import BookingCalendar from "./BookingCalendar";

const AMENITY_ICONS: Record<string, React.ElementType> = {
  wifi: Wifi,
  pool: Waves,
  bbq: Flame,
  parking: Car,
  ac: Snowflake,
  kitchen: CookingPot,
  tv: Tv,
  garden: TreePine,
  playground: Baby,
  football: Goal,
  volleyball: CircleDot,
  jacuzzi: Droplets,
};

interface ChaletDetailProps {
  chalet: {
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
  };
}

export default function ChaletDetail({ chalet }: ChaletDetailProps) {
  const t = useTranslations("chalets");
  const tc = useTranslations("common");
  const ta = useTranslations("amenityLabels");
  const tb = useTranslations("booking");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href={`/${locale}`} className="hover:text-primary">
            {tc("home")}
          </Link>
          {" / "}
          <Link href={`/${locale}/chalets`} className="hover:text-primary">
            {tc("chalets")}
          </Link>
          {" / "}
          <span className="text-foreground">
            {isAr ? chalet.nameAr : chalet.nameEn}
          </span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Gallery */}
            <div className="mb-6 overflow-hidden rounded-xl">
              <div className="relative h-[400px] w-full bg-muted">
                {chalet.images.length > 0 ? (
                  <Image
                    src={chalet.images[selectedImage]}
                    alt={isAr ? chalet.nameAr : chalet.nameEn}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    {isAr ? "لا توجد صور" : "No images"}
                  </div>
                )}
              </div>
              {chalet.images.length > 1 && (
                <div className="mt-3 flex gap-3">
                  {chalet.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative h-20 w-28 overflow-hidden rounded-md ${
                        selectedImage === index
                          ? "ring-2 ring-primary"
                          : "opacity-70"
                      }`}
                    >
                      <Image
                        src={img}
                        alt=""
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Location */}
            <div className="mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="mb-2 text-3xl font-bold">
                    {isAr ? chalet.nameAr : chalet.nameEn}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{isAr ? chalet.locationAr : chalet.locationEn}</span>
                  </div>
                </div>
                <Badge className="gap-1 text-base" variant="secondary">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {chalet.rating} ({chalet.reviewCount})
                </Badge>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Details */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center rounded-lg border p-4 text-center">
                <Users className="mb-2 h-6 w-6 text-primary" />
                <span className="text-sm text-muted-foreground">{t("capacity")}</span>
                <span className="text-lg font-semibold">
                  {chalet.capacity} {t("person")}
                </span>
              </div>
              <div className="flex flex-col items-center rounded-lg border p-4 text-center">
                <BedDouble className="mb-2 h-6 w-6 text-primary" />
                <span className="text-sm text-muted-foreground">{t("bedrooms")}</span>
                <span className="text-lg font-semibold">
                  {chalet.bedrooms} {t("bedroom")}
                </span>
              </div>
              <div className="flex flex-col items-center rounded-lg border p-4 text-center">
                <Bath className="mb-2 h-6 w-6 text-primary" />
                <span className="text-sm text-muted-foreground">{t("bathrooms")}</span>
                <span className="text-lg font-semibold">
                  {chalet.bathrooms} {t("bathroom")}
                </span>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Description */}
            <div className="mb-6">
              <h2 className="mb-3 text-xl font-semibold">{t("description")}</h2>
              <p className="leading-relaxed text-muted-foreground">
                {isAr ? chalet.descriptionAr : chalet.descriptionEn}
              </p>
            </div>

            <Separator className="my-6" />

            {/* Amenities */}
            <div className="mb-6">
              <h2 className="mb-4 text-xl font-semibold">{t("amenities")}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {chalet.amenities.map((amenity) => {
                  const Icon = AMENITY_ICONS[amenity] || Wifi;
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="text-sm">{ta(amenity)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-sm font-normal text-muted-foreground">
                    {t("pricePerNight")}
                  </span>
                  <div>
                    <span className="text-2xl font-bold text-primary">
                      {chalet.pricePerNight}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {" "}
                      {tc("sar")}
                    </span>
                  </div>
                </CardTitle>
                {chalet.weekendPrice && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("weekendPrice")}
                    </span>
                    <span className="font-semibold">
                      {chalet.weekendPrice} {tc("sar")}
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <BookingCalendar
                  chaletId={chalet.id}
                  slug={chalet.slug}
                  pricePerNight={chalet.pricePerNight}
                  weekendPrice={chalet.weekendPrice}
                />

                <div className="rounded-lg bg-muted p-4 text-center text-sm text-muted-foreground">
                  {isAr
                    ? "لن يتم خصم أي مبلغ حتى تأكيد الحجز"
                    : "You won't be charged until booking confirmation"}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
