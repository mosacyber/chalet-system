"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarDays,
  DollarSign,
  Building,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DashboardStats {
  totalChalets: number;
  totalBookings: number;
  totalRevenue: number;
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="pb-3 text-start font-medium">#</th>
                    <th className="pb-3 text-start font-medium">
                      {isAr ? "العميل" : "Customer"}
                    </th>
                    <th className="pb-3 text-start font-medium">
                      {isAr ? "الشاليه" : "Chalet"}
                    </th>
                    <th className="pb-3 text-start font-medium">
                      {isAr ? "التاريخ" : "Date"}
                    </th>
                    <th className="pb-3 text-start font-medium">
                      {isAr ? "المبلغ" : "Amount"}
                    </th>
                    <th className="pb-3 text-start font-medium">
                      {isAr ? "الحالة" : "Status"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b last:border-0">
                      <td className="py-3 text-sm font-medium">{booking.id}</td>
                      <td className="py-3 text-sm">{booking.customer}</td>
                      <td className="py-3 text-sm">
                        {isAr ? booking.chaletAr : booking.chaletEn}
                      </td>
                      <td className="py-3 text-sm" dir="ltr">
                        {booking.date}
                      </td>
                      <td className="py-3 text-sm font-medium">
                        {booking.amount} {tc("sar")}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            STATUS_COLORS[booking.status] || ""
                          }`}
                        >
                          {tb(
                            booking.status as
                              | "pending"
                              | "confirmed"
                              | "cancelled"
                              | "completed"
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
