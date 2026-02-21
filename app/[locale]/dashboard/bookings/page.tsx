"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, X, Eye, Search } from "lucide-react";
import { useState } from "react";

const BOOKINGS = [
  { id: "BK-001", customerAr: "محمد العتيبي", customerEn: "Mohammed Al-Otaibi", chaletAr: "الشاليه الملكي", chaletEn: "Royal Chalet", checkIn: "2024-03-15", checkOut: "2024-03-18", guests: 8, amount: 2400, status: "confirmed" },
  { id: "BK-002", customerAr: "سارة الأحمدي", customerEn: "Sarah Al-Ahmadi", chaletAr: "استراحة الحديقة", chaletEn: "Garden Resort", checkIn: "2024-03-20", checkOut: "2024-03-22", guests: 12, amount: 1200, status: "pending" },
  { id: "BK-003", customerAr: "خالد المالكي", customerEn: "Khalid Al-Malki", chaletAr: "شاليه البحر", chaletEn: "Sea View Chalet", checkIn: "2024-03-10", checkOut: "2024-03-13", guests: 6, amount: 3600, status: "completed" },
  { id: "BK-004", customerAr: "نورة القحطاني", customerEn: "Noura Al-Qahtani", chaletAr: "الشاليه الملكي", chaletEn: "Royal Chalet", checkIn: "2024-03-25", checkOut: "2024-03-27", guests: 10, amount: 1600, status: "pending" },
  { id: "BK-005", customerAr: "فهد الشمري", customerEn: "Fahad Al-Shammari", chaletAr: "الفيلا الفاخرة", chaletEn: "Luxury Villa", checkIn: "2024-03-28", checkOut: "2024-04-01", guests: 20, amount: 6000, status: "confirmed" },
  { id: "BK-006", customerAr: "ريم الحربي", customerEn: "Reem Al-Harbi", chaletAr: "شاليه الجبل", chaletEn: "Mountain Retreat", checkIn: "2024-03-05", checkOut: "2024-03-07", guests: 5, amount: 1000, status: "cancelled" },
];

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function ManageBookingsPage() {
  const t = useTranslations("dashboard");
  const tb = useTranslations("booking");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? BOOKINGS : BOOKINGS.filter((b) => b.status === filter);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("manageBookings")}</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={tc("search") + "..."} className="ps-10" />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status === "all"
                ? tc("all")
                : tb(status as "pending" | "confirmed" | "cancelled" | "completed")}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="px-4 py-3 text-start font-medium">#</th>
                  <th className="px-4 py-3 text-start font-medium">{isAr ? "العميل" : "Customer"}</th>
                  <th className="px-4 py-3 text-start font-medium">{isAr ? "الشاليه" : "Chalet"}</th>
                  <th className="px-4 py-3 text-start font-medium">{tb("checkIn")}</th>
                  <th className="px-4 py-3 text-start font-medium">{tb("checkOut")}</th>
                  <th className="px-4 py-3 text-start font-medium">{isAr ? "الضيوف" : "Guests"}</th>
                  <th className="px-4 py-3 text-start font-medium">{isAr ? "المبلغ" : "Amount"}</th>
                  <th className="px-4 py-3 text-start font-medium">{isAr ? "الحالة" : "Status"}</th>
                  <th className="px-4 py-3 text-start font-medium">{isAr ? "إجراءات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => (
                  <tr key={booking.id} className="border-b last:border-0">
                    <td className="px-4 py-3 text-sm font-medium">{booking.id}</td>
                    <td className="px-4 py-3 text-sm">
                      {isAr ? booking.customerAr : booking.customerEn}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {isAr ? booking.chaletAr : booking.chaletEn}
                    </td>
                    <td className="px-4 py-3 text-sm" dir="ltr">{booking.checkIn}</td>
                    <td className="px-4 py-3 text-sm" dir="ltr">{booking.checkOut}</td>
                    <td className="px-4 py-3 text-sm">{booking.guests}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {booking.amount} {tc("sar")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[booking.status]}`}>
                        {tb(booking.status as "pending" | "confirmed" | "cancelled" | "completed")}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {booking.status === "pending" && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
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
