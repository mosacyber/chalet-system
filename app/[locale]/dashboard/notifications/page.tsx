"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  CalendarDays,
  CreditCard,
  Star,
  CheckCheck,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Notification {
  id: string;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  booking: CalendarDays,
  payment: CreditCard,
  review: Star,
};

const TYPE_COLORS: Record<string, string> = {
  booking: "bg-blue-100 text-blue-700",
  payment: "bg-green-100 text-green-700",
  review: "bg-yellow-100 text-yellow-700",
};

function timeAgo(dateStr: string, isAr: boolean): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return isAr ? "الآن" : "Just now";
  if (diffMin < 60) return isAr ? `منذ ${diffMin} دقيقة` : `${diffMin}m ago`;
  if (diffHr < 24) return isAr ? `منذ ${diffHr} ساعة` : `${diffHr}h ago`;
  return isAr ? `منذ ${diffDay} يوم` : `${diffDay}d ago`;
}

export default function NotificationsPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    const res = await fetch("/api/dashboard/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    if (res.ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success(isAr ? "تم تحديد الكل كمقروء" : "All marked as read");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("notifications")}</h1>
        {notifications.some((n) => !n.isRead) && (
          <Button
            variant="outline"
            className="gap-2"
            size="sm"
            onClick={markAllRead}
          >
            <CheckCheck className="h-4 w-4" />
            {isAr ? "تحديد الكل كمقروء" : "Mark all as read"}
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !notifications.length ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <p className="text-muted-foreground">
            {isAr ? "لا توجد إشعارات" : "No notifications"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const Icon = TYPE_ICONS[notif.type] || Bell;
            return (
              <Card
                key={notif.id}
                className={`transition-colors ${
                  !notif.isRead ? "border-primary/30 bg-primary/5" : ""
                }`}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      TYPE_COLORS[notif.type] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {isAr ? notif.titleAr : notif.titleEn}
                      </span>
                      {!notif.isRead && (
                        <Badge
                          variant="default"
                          className="h-5 px-1.5 text-[10px]"
                        >
                          {isAr ? "جديد" : "New"}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isAr ? notif.messageAr : notif.messageEn}
                    </p>
                    <span className="mt-2 inline-block text-xs text-muted-foreground">
                      {timeAgo(notif.createdAt, isAr)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
