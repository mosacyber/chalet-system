"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Review {
  id: string;
  rating: number;
  comment: string;
  isVisible: boolean;
  createdAt: string;
  user: { name: string };
  chalet: { nameAr: string; nameEn: string };
}

export default function ManageReviewsPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleVisibility = async (id: string, currentVisible: boolean) => {
    const res = await fetch("/api/dashboard/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isVisible: !currentVisible }),
    });
    if (res.ok) {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isVisible: !currentVisible } : r))
      );
    } else {
      toast.error(isAr ? "حدث خطأ" : "Error occurred");
    }
  };

  const deleteReview = async (id: string) => {
    const res = await fetch(`/api/dashboard/reviews?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success(isAr ? "تم حذف التقييم" : "Review deleted");
    } else {
      toast.error(isAr ? "حدث خطأ" : "Error occurred");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("manageReviews")}</h1>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !reviews.length ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <p className="text-muted-foreground">
            {isAr ? "لا توجد تقييمات" : "No reviews yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className={!review.isVisible ? "opacity-60" : ""}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {review.user.name?.charAt(0) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {review.user.name}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {isAr ? review.chalet.nameAr : review.chalet.nameEn}
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
                        {review.comment}
                      </p>
                      <span
                        className="mt-2 inline-block text-xs text-muted-foreground"
                        dir="ltr"
                      >
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        toggleVisibility(review.id, review.isVisible)
                      }
                    >
                      {review.isVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteReview(review.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
