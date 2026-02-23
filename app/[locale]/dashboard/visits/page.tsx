"use client";

import { useLocale } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  Monitor,
  Smartphone,
  Tablet,
  Loader2,
  Globe,
  TrendingUp,
  CalendarDays,
  BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";

interface VisitStats {
  todayCount: number;
  weekCount: number;
  monthCount: number;
  totalCount: number;
  topPages: { page: string; count: number }[];
  devices: { mobile: number; desktop: number; tablet: number };
  daily: { day: string; count: number }[];
}

const PAGE_LABELS_AR: Record<string, string> = {
  "/": "الرئيسية",
  "/chalets": "الشاليهات",
  "/about": "عن الموقع",
  "/contact": "تواصل معنا",
};

const PAGE_LABELS_EN: Record<string, string> = {
  "/": "Home",
  "/chalets": "Chalets",
  "/about": "About",
  "/contact": "Contact",
};

function getPageLabel(page: string, isAr: boolean) {
  const labels = isAr ? PAGE_LABELS_AR : PAGE_LABELS_EN;
  if (labels[page]) return labels[page];
  // Handle chalet detail pages like /chalets/slug
  if (page.startsWith("/chalets/")) {
    const slug = page.replace("/chalets/", "");
    return isAr ? `شاليه: ${slug}` : `Chalet: ${slug}`;
  }
  if (page.startsWith("/booking/")) {
    return isAr ? "صفحة الحجز" : "Booking Page";
  }
  return page;
}

export default function VisitsPage() {
  const locale = useLocale();
  const isAr = locale === "ar";

  const [data, setData] = useState<VisitStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/visits")
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

  if (!data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-muted-foreground">
          {isAr ? "حدث خطأ في تحميل البيانات" : "Failed to load data"}
        </p>
      </div>
    );
  }

  const deviceTotal = data.devices.mobile + data.devices.desktop + data.devices.tablet;
  const maxDaily = Math.max(...data.daily.map((d) => d.count), 1);

  const stats = [
    {
      label: isAr ? "زيارات اليوم" : "Today",
      value: data.todayCount,
      icon: Eye,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-950",
    },
    {
      label: isAr ? "آخر 7 أيام" : "Last 7 Days",
      value: data.weekCount,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-950",
    },
    {
      label: isAr ? "آخر 30 يوم" : "Last 30 Days",
      value: data.monthCount,
      icon: CalendarDays,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-950",
    },
    {
      label: isAr ? "الإجمالي" : "Total",
      value: data.totalCount,
      icon: Globe,
      color: "text-orange-600",
      bg: "bg-orange-100 dark:bg-orange-950",
    },
  ];

  const deviceItems = [
    {
      label: isAr ? "جوال" : "Mobile",
      value: data.devices.mobile,
      icon: Smartphone,
      color: "bg-blue-500",
    },
    {
      label: isAr ? "كمبيوتر" : "Desktop",
      value: data.devices.desktop,
      icon: Monitor,
      color: "bg-green-500",
    },
    {
      label: isAr ? "تابلت" : "Tablet",
      value: data.devices.tablet,
      icon: Tablet,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {isAr ? "الزيارات" : "Site Visits"}
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${stat.bg}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-xl font-bold">{stat.value.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {isAr ? "أكثر الصفحات زيارة" : "Top Pages"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.topPages.length === 0 ? (
              <p className="py-6 text-center text-muted-foreground">
                {isAr ? "لا توجد بيانات" : "No data"}
              </p>
            ) : (
              <div className="space-y-3">
                {data.topPages.map((p, i) => {
                  const pct =
                    data.monthCount > 0
                      ? Math.round((p.count / data.monthCount) * 100)
                      : 0;
                  return (
                    <div key={p.page} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                            {i + 1}
                          </span>
                          {getPageLabel(p.page, isAr)}
                        </span>
                        <span className="font-medium">
                          {p.count.toLocaleString()}{" "}
                          <span className="text-xs text-muted-foreground">
                            ({pct}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              {isAr ? "الأجهزة المستخدمة" : "Devices"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {deviceTotal === 0 ? (
              <p className="py-6 text-center text-muted-foreground">
                {isAr ? "لا توجد بيانات" : "No data"}
              </p>
            ) : (
              <div className="space-y-4">
                {deviceItems.map((d) => {
                  const pct =
                    deviceTotal > 0
                      ? Math.round((d.value / deviceTotal) * 100)
                      : 0;
                  return (
                    <div key={d.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <d.icon className="h-4 w-4 text-muted-foreground" />
                          {d.label}
                        </span>
                        <span className="text-sm">
                          {d.value.toLocaleString()}{" "}
                          <span className="text-muted-foreground">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${d.color} transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {isAr ? "الزيارات اليومية (آخر 30 يوم)" : "Daily Visits (Last 30 Days)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.daily.length === 0 ? (
            <p className="py-6 text-center text-muted-foreground">
              {isAr ? "لا توجد بيانات" : "No data"}
            </p>
          ) : (
            <div className="flex items-end gap-1 overflow-x-auto pb-2" style={{ minHeight: 160 }}>
              {data.daily.map((d) => {
                const height = Math.max((d.count / maxDaily) * 140, 4);
                const dayLabel = new Date(d.day + "T00:00:00").toLocaleDateString(
                  isAr ? "ar-SA" : "en-US",
                  { day: "numeric", month: "numeric" }
                );
                return (
                  <div
                    key={d.day}
                    className="group flex flex-1 flex-col items-center gap-1"
                    style={{ minWidth: 20 }}
                  >
                    <span className="hidden text-[10px] text-muted-foreground group-hover:block">
                      {d.count}
                    </span>
                    <div
                      className="w-full max-w-[20px] rounded-t bg-primary transition-all hover:bg-primary/80"
                      style={{ height }}
                    />
                    <span className="text-[9px] text-muted-foreground" dir="ltr">
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
