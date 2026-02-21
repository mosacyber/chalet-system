"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, TrendingUp, TrendingDown, DollarSign, CalendarDays, BarChart3 } from "lucide-react";

const MONTHLY_DATA = [
  { month: { ar: "يناير", en: "Jan" }, revenue: 45000, bookings: 22 },
  { month: { ar: "فبراير", en: "Feb" }, revenue: 52000, bookings: 28 },
  { month: { ar: "مارس", en: "Mar" }, revenue: 68000, bookings: 35 },
  { month: { ar: "أبريل", en: "Apr" }, revenue: 41000, bookings: 19 },
  { month: { ar: "مايو", en: "May" }, revenue: 73000, bookings: 38 },
  { month: { ar: "يونيو", en: "Jun" }, revenue: 85000, bookings: 42 },
];

export default function ReportsPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const totalRevenue = MONTHLY_DATA.reduce((sum, m) => sum + m.revenue, 0);
  const totalBookings = MONTHLY_DATA.reduce((sum, m) => sum + m.bookings, 0);
  const avgBookingValue = Math.round(totalRevenue / totalBookings);
  const maxRevenue = Math.max(...MONTHLY_DATA.map((m) => m.revenue));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("reports")}</h1>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          {t("export")}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <DollarSign className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isAr ? "إجمالي الإيرادات" : "Total Revenue"}</p>
                <p className="text-xl font-bold">{totalRevenue.toLocaleString()} {tc("sar")}</p>
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
                <p className="text-sm text-muted-foreground">{isAr ? "إجمالي الحجوزات" : "Total Bookings"}</p>
                <p className="text-xl font-bold">{totalBookings}</p>
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
                <p className="text-sm text-muted-foreground">{isAr ? "متوسط قيمة الحجز" : "Avg Booking Value"}</p>
                <p className="text-xl font-bold">{avgBookingValue.toLocaleString()} {tc("sar")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart (simplified bar chart with CSS) */}
      <Card>
        <CardHeader>
          <CardTitle>{t("revenue")} - {t("monthly")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MONTHLY_DATA.map((data) => (
              <div key={data.month.en} className="flex items-center gap-4">
                <span className="w-16 text-sm text-muted-foreground">
                  {isAr ? data.month.ar : data.month.en}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-8 flex-1 overflow-hidden rounded-md bg-muted">
                      <div
                        className="h-full rounded-md bg-primary transition-all"
                        style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="w-24 text-end text-sm font-medium">
                      {data.revenue.toLocaleString()} {tc("sar")}
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
          <CardTitle>{isAr ? "التفاصيل الشهرية" : "Monthly Breakdown"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-sm text-muted-foreground">
                  <th className="pb-3 text-start font-medium">{isAr ? "الشهر" : "Month"}</th>
                  <th className="pb-3 text-start font-medium">{isAr ? "الإيرادات" : "Revenue"}</th>
                  <th className="pb-3 text-start font-medium">{isAr ? "الحجوزات" : "Bookings"}</th>
                  <th className="pb-3 text-start font-medium">{isAr ? "المتوسط" : "Avg"}</th>
                </tr>
              </thead>
              <tbody>
                {MONTHLY_DATA.map((data) => (
                  <tr key={data.month.en} className="border-b last:border-0">
                    <td className="py-3 text-sm font-medium">
                      {isAr ? data.month.ar : data.month.en}
                    </td>
                    <td className="py-3 text-sm">
                      {data.revenue.toLocaleString()} {tc("sar")}
                    </td>
                    <td className="py-3 text-sm">{data.bookings}</td>
                    <td className="py-3 text-sm">
                      {Math.round(data.revenue / data.bookings).toLocaleString()} {tc("sar")}
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
