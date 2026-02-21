"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Mail, Phone } from "lucide-react";

const CUSTOMERS = [
  { id: "1", nameAr: "محمد العتيبي", nameEn: "Mohammed Al-Otaibi", email: "mohammed@email.com", phone: "+966501234567", bookings: 5, totalSpent: 12000, joined: "2024-01-15" },
  { id: "2", nameAr: "سارة الأحمدي", nameEn: "Sarah Al-Ahmadi", email: "sarah@email.com", phone: "+966509876543", bookings: 3, totalSpent: 5400, joined: "2024-02-01" },
  { id: "3", nameAr: "خالد المالكي", nameEn: "Khalid Al-Malki", email: "khalid@email.com", phone: "+966555555555", bookings: 8, totalSpent: 28800, joined: "2023-11-20" },
  { id: "4", nameAr: "نورة القحطاني", nameEn: "Noura Al-Qahtani", email: "noura@email.com", phone: "+966512345678", bookings: 2, totalSpent: 3200, joined: "2024-02-20" },
  { id: "5", nameAr: "فهد الشمري", nameEn: "Fahad Al-Shammari", email: "fahad@email.com", phone: "+966543216789", bookings: 6, totalSpent: 27000, joined: "2023-12-01" },
];

export default function ManageCustomersPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("manageCustomers")}</h1>

      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={tc("search") + "..."} className="ps-10" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CUSTOMERS.map((customer) => (
          <Card key={customer.id}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {(isAr ? customer.nameAr : customer.nameEn).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">
                    {isAr ? customer.nameAr : customer.nameEn}
                  </h3>
                  <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      <span dir="ltr">{customer.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span dir="ltr">{customer.phone}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">
                        {isAr ? "الحجوزات: " : "Bookings: "}
                      </span>
                      <span className="font-medium">{customer.bookings}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {isAr ? "المصروف: " : "Spent: "}
                      </span>
                      <span className="font-medium">
                        {customer.totalSpent} {tc("sar")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
