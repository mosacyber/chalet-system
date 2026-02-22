"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Eye, Loader2, Power, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ChaletRow {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  pricePerNight: number;
  capacity: number;
  isActive: boolean;
  images: string[];
  _count: { bookings: number };
}

export default function ManageChaletsPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [chalets, setChalets] = useState<ChaletRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chalets?dashboard=true")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setChalets(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (slug: string, currentActive: boolean) => {
    const res = await fetch(`/api/chalets/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !currentActive }),
    });
    if (res.ok) {
      setChalets((prev) =>
        prev.map((c) =>
          c.slug === slug ? { ...c, isActive: !currentActive } : c
        )
      );
      toast.success(
        !currentActive
          ? isAr ? "تم تفعيل الشاليه" : "Chalet activated"
          : isAr ? "تم إيقاف الشاليه" : "Chalet deactivated"
      );
    } else {
      toast.error(isAr ? "حدث خطأ" : "Error occurred");
    }
  };

  const deleteChalet = async (slug: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من حذف هذا الشاليه؟" : "Are you sure you want to delete this chalet?")) {
      return;
    }
    const res = await fetch(`/api/chalets/${slug}`, { method: "DELETE" });
    if (res.ok) {
      setChalets((prev) => prev.filter((c) => c.slug !== slug));
      toast.success(isAr ? "تم حذف الشاليه" : "Chalet deleted");
    } else {
      toast.error(isAr ? "حدث خطأ" : "Error occurred");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("manageChalets")}</h1>
        <Link href={`/${locale}/dashboard/chalets/new`}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("addChalet")}
          </Button>
        </Link>
      </div>

      {!chalets.length ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("noData")}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="px-4 py-3 text-start font-medium">
                      {isAr ? "الشاليه" : "Chalet"}
                    </th>
                    <th className="px-4 py-3 text-start font-medium">
                      {isAr ? "السعر/ليلة" : "Price/Night"}
                    </th>
                    <th className="px-4 py-3 text-start font-medium">
                      {isAr ? "السعة" : "Capacity"}
                    </th>
                    <th className="px-4 py-3 text-start font-medium">
                      {isAr ? "الحجوزات" : "Bookings"}
                    </th>
                    <th className="px-4 py-3 text-start font-medium">
                      {isAr ? "الحالة" : "Status"}
                    </th>
                    <th className="px-4 py-3 text-start font-medium">
                      {isAr ? "الإجراءات" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chalets.map((chalet) => (
                    <tr key={chalet.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium">
                          {isAr ? chalet.nameAr : chalet.nameEn}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {Number(chalet.pricePerNight)} {tc("sar")}
                      </td>
                      <td className="px-4 py-3 text-sm">{chalet.capacity}</td>
                      <td className="px-4 py-3 text-sm">
                        {chalet._count.bookings}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={chalet.isActive ? "default" : "secondary"}
                        >
                          {chalet.isActive
                            ? isAr
                              ? "نشط"
                              : "Active"
                            : isAr
                              ? "متوقف"
                              : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/${locale}/chalets/${chalet.slug}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title={isAr ? "عرض" : "View"}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link
                            href={`/${locale}/dashboard/chalets/${chalet.slug}/edit`}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title={isAr ? "تعديل" : "Edit"}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              toggleActive(chalet.slug, chalet.isActive)
                            }
                            title={
                              chalet.isActive
                                ? isAr ? "إيقاف" : "Deactivate"
                                : isAr ? "تفعيل" : "Activate"
                            }
                          >
                            <Power
                              className={`h-4 w-4 ${
                                chalet.isActive
                                  ? "text-green-600"
                                  : "text-muted-foreground"
                              }`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => deleteChalet(chalet.slug)}
                            title={isAr ? "حذف" : "Delete"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
