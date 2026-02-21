"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  CalendarDays,
  BarChart3,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface MonthlyEntry {
  month: { ar: string; en: string };
  revenue: number;
  bookings: number;
}

interface ReportData {
  monthlyData: MonthlyEntry[];
  totalRevenue: number;
  totalBookings: number;
  avgBookingValue: number;
}

export default function ReportsPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/reports")
      .then((res) => res.json())
      .then((d) => {
        if (d && d.monthlyData) setData(d);
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

  if (!data || !data.monthlyData.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("reports")}</h1>
        <div className="flex min-h-[30vh] items-center justify-center">
          <p className="text-muted-foreground">
            {isAr ? "لا توجد بيانات للتقارير بعد" : "No report data yet"}
          </p>
        </div>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.monthlyData.map((m) => m.revenue));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("reports")}</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <DollarSign className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAr ? "إجمالي الإيرادات" : "Total Revenue"}
                </p>
                <p className="text-xl font-bold">
                  {data.totalRevenue.toLocaleString()} {tc("sar")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <CalendarDays className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAr ? "إجمالي الحجوزات" : "Total Bookings"}
                </p>
                <p className="text-xl font-bold">{data.totalBookings}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <BarChart3 className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAr ? "متوسط قيمة الحجز" : "Avg Booking Value"}
                </p>
                <p className="text-xl font-bold">
                  {data.avgBookingValue.toLocaleString()} {tc("sar")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t("revenue")} - {t("monthly")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.monthlyData.map((entry) => (
              <div
                key={entry.month.en}
                className="flex items-center gap-4"
              >
                <span className="w-20 text-sm text-muted-foreground">
                  {isAr ? entry.month.ar : entry.month.en}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-8 flex-1 overflow-hidden rounded-md bg-muted">
                      <div
                        className="h-full rounded-md bg-primary transition-all"
                        style={{
                          width: `${maxRevenue > 0 ? (entry.revenue / maxRevenue) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="w-28 text-end text-sm font-medium">
                      {entry.revenue.toLocaleString()} {tc("sar")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isAr ? "التفاصيل الشهرية" : "Monthly Breakdown"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="pb-3 text-start font-medium">
                    {isAr ? "الشهر" : "Month"}
                  </th>
                  <th className="pb-3 text-start font-medium">
                    {isAr ? "الإيرادات" : "Revenue"}
                  </th>
                  <th className="pb-3 text-start font-medium">
                    {isAr ? "الحجوزات" : "Bookings"}
                  </th>
                  <th className="pb-3 text-start font-medium">
                    {isAr ? "المتوسط" : "Avg"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.monthlyData.map((entry) => (
                  <tr
                    key={entry.month.en}
                    className="border-b last:border-0"
                  >
                    <td className="py-3 text-sm font-medium">
                      {isAr ? entry.month.ar : entry.month.en}
                    </td>
                    <td className="py-3 text-sm">
                      {entry.revenue.toLocaleString()} {tc("sar")}
                    </td>
                    <td className="py-3 text-sm">{entry.bookings}</td>
                    <td className="py-3 text-sm">
                      {entry.bookings > 0
                        ? Math.round(
                            entry.revenue / entry.bookings
                          ).toLocaleString()
                        : 0}{" "}
                      {tc("sar")}
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
