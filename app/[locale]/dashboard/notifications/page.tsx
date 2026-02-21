"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CalendarDays, CreditCard, Star, CheckCheck } from "lucide-react";

const NOTIFICATIONS = [
  { id: "1", type: "booking", titleAr: "حجز جديد", titleEn: "New Booking", messageAr: "محمد العتيبي قام بحجز الشاليه الملكي من 15 مارس إلى 18 مارس", messageEn: "Mohammed Al-Otaibi booked Royal Chalet from March 15 to March 18", time: "5 min", isRead: false },
  { id: "2", type: "payment", titleAr: "دفع ناجح", titleEn: "Payment Successful", messageAr: "تم استلام دفعة بقيمة 2,400 ريال من سارة الأحمدي", messageEn: "Payment of 2,400 SAR received from Sarah Al-Ahmadi", time: "1 hr", isRead: false },
  { id: "3", type: "review", titleAr: "تقييم جديد", titleEn: "New Review", messageAr: "خالد المالكي أضاف تقييم 5 نجوم لشاليه البحر", messageEn: "Khalid Al-Malki added a 5-star review for Sea View Chalet", time: "3 hrs", isRead: false },
  { id: "4", type: "booking", titleAr: "حجز ملغي", titleEn: "Booking Cancelled", messageAr: "نورة القحطاني ألغت حجزها في الشاليه الملكي", messageEn: "Noura Al-Qahtani cancelled her booking at Royal Chalet", time: "5 hrs", isRead: true },
  { id: "5", type: "payment", titleAr: "دفع ناجح", titleEn: "Payment Successful", messageAr: "تم استلام دفعة بقيمة 6,000 ريال من فهد الشمري", messageEn: "Payment of 6,000 SAR received from Fahad Al-Shammari", time: "1 day", isRead: true },
];

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

export default function NotificationsPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("notifications")}</h1>
        <Button variant="outline" className="gap-2" size="sm">
          <CheckCheck className="h-4 w-4" />
          {isAr ? "تحديد الكل كمقروء" : "Mark all as read"}
        </Button>
      </div>

      <div className="space-y-3">
        {NOTIFICATIONS.map((notif) => {
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
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${TYPE_COLORS[notif.type]}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {isAr ? notif.titleAr : notif.titleEn}
                    </span>
                    {!notif.isRead && (
                      <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                        {isAr ? "جديد" : "New"}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isAr ? notif.messageAr : notif.messageEn}
                  </p>
                  <span className="mt-2 inline-block text-xs text-muted-foreground">
                    {isAr ? `منذ ${notif.time}` : `${notif.time} ago`}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
