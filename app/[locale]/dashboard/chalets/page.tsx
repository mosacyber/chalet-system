"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const CHALETS = [
  { id: "1", nameAr: "الشاليه الملكي", nameEn: "Royal Chalet", price: 800, capacity: 15, isActive: true, bookings: 24, image: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=100&h=100&fit=crop" },
  { id: "2", nameAr: "استراحة الحديقة", nameEn: "Garden Resort", price: 600, capacity: 20, isActive: true, bookings: 18, image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=100&h=100&fit=crop" },
  { id: "3", nameAr: "شاليه الإطلالة البحرية", nameEn: "Sea View Chalet", price: 1200, capacity: 10, isActive: true, bookings: 32, image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=100&h=100&fit=crop" },
  { id: "4", nameAr: "شاليه الجبل", nameEn: "Mountain Retreat", price: 500, capacity: 8, isActive: false, bookings: 5, image: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=100&h=100&fit=crop" },
  { id: "5", nameAr: "الفيلا الفاخرة", nameEn: "Luxury Villa", price: 1500, capacity: 25, isActive: true, bookings: 45, image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=100&h=100&fit=crop" },
];

export default function ManageChaletsPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

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

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="px-4 py-3 text-start font-medium">{isAr ? "الشاليه" : "Chalet"}</th>
                  <th className="px-4 py-3 text-start font-medium">{isAr ? "السعر/ليلة" : "Price/Night"}</th>
                  <th className="px-4 py-3 text-start font-medium">{isAr ? "السعة" : "Capacity"}</th>
                  <th className="px-4 py-3 text-start font-medium">{isAr ? "الحجوزات" : "Bookings"}</th>
                  <th className="px-4 py-3 text-start font-medium">{isAr ? "الحالة" : "Status"}</th>
                  <th className="px-4 py-3 text-start font-medium">{isAr ? "الإجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {CHALETS.map((chalet) => (
                  <tr key={chalet.id} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-md">
                          <Image src={chalet.image} alt="" fill className="object-cover" />
                        </div>
                        <span className="text-sm font-medium">
                          {isAr ? chalet.nameAr : chalet.nameEn}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {chalet.price} {tc("sar")}
                    </td>
                    <td className="px-4 py-3 text-sm">{chalet.capacity}</td>
                    <td className="px-4 py-3 text-sm">{chalet.bookings}</td>
                    <td className="px-4 py-3">
                      <Badge variant={chalet.isActive ? "default" : "secondary"}>
                        {chalet.isActive
                          ? isAr ? "نشط" : "Active"
                          : isAr ? "متوقف" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
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
    </div>
  );
}
