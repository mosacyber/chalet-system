"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  DollarSign,
  Building,
  Loader2,
  Banknote,
  CreditCard,
  Building2,
  Droplets,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalChalets: number;
  totalBookings: number;
  totalRevenue: number;
  revenueBreakdown: {
    cash: number;
    transfer: number;
    card: number;
    water: number;
  };
  paymentLocations: Record<string, string>;
  recentBookings: {
    id: string;
    customer: string;
    chaletAr: string;
    chaletEn: string;
    date: string;
    status: string;
    amount: number;
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  blocked: "bg-red-100 text-red-700",
};

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tb = useTranslations("booking");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((res) => res.json())
      .then(setData)
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

  const stats = [
    {
      label: t("totalChalets"),
      value: data?.totalChalets ?? 0,
      icon: Building,
    },
    {
      label: t("totalBookings"),
      value: data?.totalBookings ?? 0,
      icon: CalendarDays,
    },
    {
      label: t("totalRevenue"),
      value: `${(data?.totalRevenue ?? 0).toLocaleString()} ${tc("sar")}`,
      icon: DollarSign,
    },
  ];

  const breakdown = data?.revenueBreakdown;
  const locations = data?.paymentLocations || {};

  const cashLocation = locations.payment_cash_location || (isAr ? "عند العمال" : "With workers");
  const cardLocation = locations.payment_card_location || (isAr ? "لدى صاحب الاستراحة" : "With resort owner");
  const transferLocation = locations.payment_transfer_location || (isAr ? "لدى صاحب الاستراحة" : "With resort owner");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("overview")}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Breakdown */}
      {breakdown && (data?.totalRevenue ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{isAr ? "تفصيل الإيرادات" : "Revenue Breakdown"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Total */}
              <div className="flex items-center justify-between rounded-lg bg-primary/5 p-3">
                <span className="font-semibold">{isAr ? "الإجمالي" : "Total"}</span>
                <span className="text-lg font-bold text-primary">
                  {(data?.totalRevenue ?? 0).toLocaleString()} {tc("sar")}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Cash */}
                {breakdown.cash > 0 && (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                      <Banknote className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{isAr ? "كاش" : "Cash"}</span>
                        <span className="font-bold">{breakdown.cash.toLocaleString()} {tc("sar")}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{cashLocation}</p>
                    </div>
                  </div>
                )}

                {/* Card / Network */}
                {breakdown.card > 0 && (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{isAr ? "شبكة" : "Card"}</span>
                        <span className="font-bold">{breakdown.card.toLocaleString()} {tc("sar")}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{cardLocation}</p>
                    </div>
                  </div>
                )}

                {/* Transfer */}
                {breakdown.transfer > 0 && (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950">
                      <Building2 className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{isAr ? "تحويل" : "Transfer"}</span>
                        <span className="font-bold">{breakdown.transfer.toLocaleString()} {tc("sar")}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{transferLocation}</p>
                    </div>
                  </div>
                )}

                {/* Water */}
                {breakdown.water > 0 && (
                  <div className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-950">
                      <Droplets className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{isAr ? "تعبئة موية" : "Water"}</span>
                        <span className="font-bold">{breakdown.water.toLocaleString()} {tc("sar")}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>{t("recentBookings")}</CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.recentBookings?.length ? (
            <p className="py-8 text-center text-muted-foreground">
              {t("noData")}
            </p>
          ) : (
            <>
              {/* Mobile: Card layout */}
              <div className="space-y-3 md:hidden">
                {data.recentBookings.map((booking) => (
                  <div key={booking.id} className="rounded-lg border p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{booking.customer}</span>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[booking.status] || ""}`}>
                        {booking.status === "blocked"
                          ? (isAr ? "محجوز" : "Booked")
                          : tb(booking.status as "pending" | "confirmed" | "cancelled" | "completed")}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">{isAr ? booking.chaletAr : booking.chaletEn}</div>
                    <div className="flex items-center justify-between text-sm">
                      <span dir="ltr" className="text-muted-foreground">{booking.date}</span>
                      <span className="font-semibold">{booking.amount.toLocaleString()} {tc("sar")}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-sm text-muted-foreground">
                      <th className="pb-3 text-start font-medium">#</th>
                      <th className="pb-3 text-start font-medium">{isAr ? "العميل" : "Customer"}</th>
                      <th className="pb-3 text-start font-medium">{isAr ? "الشاليه" : "Chalet"}</th>
                      <th className="pb-3 text-start font-medium">{isAr ? "التاريخ" : "Date"}</th>
                      <th className="pb-3 text-start font-medium">{isAr ? "المبلغ" : "Amount"}</th>
                      <th className="pb-3 text-start font-medium">{isAr ? "الحالة" : "Status"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-b last:border-0">
                        <td className="py-3 text-sm font-medium">{booking.id}</td>
                        <td className="py-3 text-sm">{booking.customer}</td>
                        <td className="py-3 text-sm">{isAr ? booking.chaletAr : booking.chaletEn}</td>
                        <td className="py-3 text-sm" dir="ltr">{booking.date}</td>
                        <td className="py-3 text-sm font-medium">{booking.amount.toLocaleString()} {tc("sar")}</td>
                        <td className="py-3">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[booking.status] || ""}`}>
                            {booking.status === "blocked"
                              ? (isAr ? "محجوز" : "Booked")
                              : tb(booking.status as "pending" | "confirmed" | "cancelled" | "completed")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
