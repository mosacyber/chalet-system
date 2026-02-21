"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Eye, Search, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface BookingRow {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  user: { name: string } | null;
  chalet: { nameAr: string; nameEn: string };
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const STATUS_MAP: Record<string, "pending" | "confirmed" | "cancelled" | "completed"> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

export default function ManageBookingsPage() {
  const t = useTranslations("dashboard");
  const tb = useTranslations("booking");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/dashboard/bookings")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBookings(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filtered =
    filter === "all"
      ? bookings
      : bookings.filter((b) => b.status === filter.toUpperCase());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("manageBookings")}</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={tc("search") + "..."} className="ps-10" />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "confirmed", "completed", "cancelled"].map(
            (status) => (
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
            )
          )}
        </div>
      </div>

      {!filtered.length ? (
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
                    <th className="px-4 py-3 text-start font-medium">#</th>
                    <th className="px-4 py-3 text-start font-medium">
                      {isAr ? "العميل" : "Customer"}
                    </th>
                    <th className="px-4 py-3 text-start font-medium">
                      {isAr ? "الشاليه" : "Chalet"}
                    </th>
                    <th className="px-4 py-3 text-start font-medium">
                      {tb("checkIn")}
                    </th>
                    <th className="px-4 py-3 text-start font-medium">
                      {tb("checkOut")}
                    </th>
                    <th className="px-4 py-3 text-start font-medium">
                      {isAr ? "الضيوف" : "Guests"}
                    </th>
                    <th className="px-4 py-3 text-start font-medium">
                      {isAr ? "المبلغ" : "Amount"}
                    </th>
                    <th className="px-4 py-3 text-start font-medium">
                      {isAr ? "الحالة" : "Status"}
                    </th>
                    <th className="px-4 py-3 text-start font-medium">
                      {isAr ? "إجراءات" : "Actions"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((booking) => (
                    <tr key={booking.id} className="border-b last:border-0">
                      <td className="px-4 py-3 text-sm font-medium">
                        {booking.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {booking.user?.name || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {isAr
                          ? booking.chalet.nameAr
                          : booking.chalet.nameEn}
                      </td>
                      <td className="px-4 py-3 text-sm" dir="ltr">
                        {new Date(booking.checkIn).toISOString().split("T")[0]}
                      </td>
                      <td className="px-4 py-3 text-sm" dir="ltr">
                        {new Date(booking.checkOut).toISOString().split("T")[0]}
                      </td>
                      <td className="px-4 py-3 text-sm">{booking.guests}</td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {Number(booking.totalPrice)} {tc("sar")}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            STATUS_COLORS[booking.status] || ""
                          }`}
                        >
                          {tb(STATUS_MAP[booking.status] || "pending")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {booking.status === "PENDING" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-green-600"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600"
                              >
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
      )}
    </div>
  );
}
