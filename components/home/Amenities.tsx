"use client";

import { useTranslations } from "next-intl";
import {
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
} from "lucide-react";

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

export default function Amenities() {
  const t = useTranslations("home");
  const ta = useTranslations("amenityLabels");

  const amenityKeys = Object.keys(AMENITY_ICONS);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">
            {t("amenitiesTitle")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("amenitiesSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 sm:grid-cols-4 md:grid-cols-6">
          {amenityKeys.map((key) => {
            const Icon = AMENITY_ICONS[key];
            return (
              <div
                key={key}
                className="flex flex-col items-center gap-3 rounded-lg p-4 text-center transition-colors hover:bg-muted"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium">{ta(key)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
