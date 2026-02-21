"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Eye, EyeOff, Trash2 } from "lucide-react";

const REVIEWS = [
  { id: "1", customerAr: "محمد العتيبي", customerEn: "Mohammed", chaletAr: "الشاليه الملكي", chaletEn: "Royal Chalet", rating: 5, commentAr: "تجربة رائعة! الشاليه نظيف ومرتب والخدمة ممتازة.", commentEn: "Amazing experience! Clean and well-organized chalet with excellent service.", date: "2024-03-15", visible: true },
  { id: "2", customerAr: "سارة الأحمدي", customerEn: "Sarah", chaletAr: "استراحة الحديقة", chaletEn: "Garden Resort", rating: 4, commentAr: "استراحة جميلة ومناسبة للعائلات. الألعاب رائعة للأطفال.", commentEn: "Beautiful resort perfect for families. Great games for kids.", date: "2024-03-14", visible: true },
  { id: "3", customerAr: "خالد المالكي", customerEn: "Khalid", chaletAr: "شاليه البحر", chaletEn: "Sea View Chalet", rating: 5, commentAr: "إطلالة ساحرة والجاكوزي ممتاز. سأحجز مرة أخرى بالتأكيد.", commentEn: "Stunning view and excellent jacuzzi. Will definitely book again.", date: "2024-03-12", visible: true },
  { id: "4", customerAr: "ريم الحربي", customerEn: "Reem", chaletAr: "شاليه الجبل", chaletEn: "Mountain Retreat", rating: 3, commentAr: "مكان هادئ لكن يحتاج بعض التحسينات في النظافة.", commentEn: "Quiet place but needs some improvements in cleanliness.", date: "2024-03-10", visible: false },
];

export default function ManageReviewsPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("manageReviews")}</h1>

      <div className="space-y-4">
        {REVIEWS.map((review) => (
          <Card key={review.id} className={!review.visible ? "opacity-60" : ""}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {(isAr ? review.customerAr : review.customerEn).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {isAr ? review.customerAr : review.customerEn}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {isAr ? review.chaletAr : review.chaletEn}
                      </span>
                    </div>
                    <div className="mt-1 flex gap-0.5">
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
                    <p className="mt-2 text-sm text-muted-foreground">
                      {isAr ? review.commentAr : review.commentEn}
                    </p>
                    <span className="mt-2 inline-block text-xs text-muted-foreground" dir="ltr">
                      {review.date}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {review.visible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
