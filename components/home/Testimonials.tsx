"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

const DEMO_REVIEWS = [
  {
    nameAr: "محمد العتيبي",
    nameEn: "Mohammed Al-Otaibi",
    rating: 5,
    commentAr: "تجربة رائعة! الشاليه نظيف ومرتب والخدمة ممتازة. بالتأكيد سأحجز مرة أخرى.",
    commentEn: "Amazing experience! The chalet is clean and well-organized with excellent service. Will definitely book again.",
  },
  {
    nameAr: "سارة الأحمدي",
    nameEn: "Sarah Al-Ahmadi",
    rating: 5,
    commentAr: "أفضل شاليه زرناه! المسبح رائع والأطفال استمتعوا كثيراً. شكراً لكم.",
    commentEn: "Best chalet we've visited! The pool was great and kids had so much fun. Thank you.",
  },
  {
    nameAr: "خالد المالكي",
    nameEn: "Khalid Al-Malki",
    rating: 4,
    commentAr: "موقع ممتاز وتجهيزات كاملة. الحجز كان سهل وسريع.",
    commentEn: "Excellent location and fully equipped. Booking was easy and fast.",
  },
];

export default function Testimonials() {
  const t = useTranslations("home");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <section className="bg-muted/50 py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">
            {t("testimonialsTitle")}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("testimonialsSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {DEMO_REVIEWS.map((review, index) => (
            <Card key={index} className="border-0 shadow-sm">
              <CardContent className="p-6">
                {/* Stars */}
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="mb-4 text-sm text-muted-foreground">
                  &ldquo;{isAr ? review.commentAr : review.commentEn}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(isAr ? review.nameAr : review.nameEn).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {isAr ? review.nameAr : review.nameEn}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
