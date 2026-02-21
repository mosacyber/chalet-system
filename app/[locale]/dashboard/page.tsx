"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  DollarSign,
  Percent,
  Users,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

const STATS = [
  {
    key: "totalBookings",
    value: "156",
    change: "+12%",
    icon: CalendarDays,
  },
  {
    key: "totalRevenue",
    value: "124,500",
    change: "+8%",
    icon: DollarSign,
    suffix: "sar",
  },
  {
    key: "occupancyRate",
    value: "78%",
    change: "+5%",
    icon: Percent,
  },
  {
    key: "totalCustomers",
    value: "89",
    change: "+15%",
    icon: Users,
  },
];

const RECENT_BOOKINGS = [
  { id: "BK-001", customer: { ar: "محمد العتيبي", en: "Mohammed" }, chalet: { ar: "الشاليه الملكي", en: "Royal Chalet" }, date: "2024-03-15", status: "confirmed", amount: 2400 },
  { id: "BK-002", customer: { ar: "سارة الأحمدي", en: "Sarah" }, chalet: { ar: "استراحة الحديقة", en: "Garden Resort" }, date: "2024-03-14", status: "pending", amount: 1800 },
  { id: "BK-003", customer: { ar: "خالد المالكي", en: "Khalid" }, chalet: { ar: "شاليه البحر", en: "Sea View Chalet" }, date: "2024-03-13", status: "completed", amount: 3600 },
  { id: "BK-004", customer: { ar: "نورة القحطاني", en: "Noura" }, chalet: { ar: "الشاليه الملكي", en: "Royal Chalet" }, date: "2024-03-12", status: "cancelled", amount: 1600 },
  { id: "BK-005", customer: { ar: "فهد الشمري", en: "Fahad" }, chalet: { ar: "الفيلا الفاخرة", en: "Luxury Villa" }, date: "2024-03-11", status: "confirmed", amount: 4500 },
];

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("overview")}</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <Card key={stat.key}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t(stat.key)}</p>
                  <p className="mt-1 text-2xl font-bold">
                    {stat.value}
                    {stat.suffix && (
                      <span className="text-sm font-normal text-muted-foreground">
                        {" "}
                        {tc(stat.suffix)}
                      </span>
                    )}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-green-600">
                    <ArrowUpRight className="h-3 w-3" />
                    {stat.change}
                  </p>
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
                {RECENT_BOOKINGS.map((booking) => (
                  <tr key={booking.id} className="border-b last:border-0">
                    <td className="py-3 text-sm font-medium">{booking.id}</td>
                    <td className="py-3 text-sm">
                      {isAr ? booking.customer.ar : booking.customer.en}
                    </td>
                    <td className="py-3 text-sm">
                      {isAr ? booking.chalet.ar : booking.chalet.en}
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
                          STATUS_COLORS[booking.status]
                        }`}
                      >
                        {tb(booking.status as "pending" | "confirmed" | "cancelled" | "completed")}
                      </span>
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
