"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, Banknote, CreditCard, Building2 } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Payment locations
  const [cashLocation, setCashLocation] = useState(isAr ? "عند العمال" : "With workers");
  const [cardLocation, setCardLocation] = useState(isAr ? "لدى صاحب الاستراحة" : "With resort owner");
  const [transferLocation, setTransferLocation] = useState(isAr ? "لدى صاحب الاستراحة" : "With resort owner");

  // Load settings
  useEffect(() => {
    fetch("/api/dashboard/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.payment_cash_location) setCashLocation(data.payment_cash_location);
        if (data.payment_card_location) setCardLocation(data.payment_card_location);
        if (data.payment_transfer_location) setTransferLocation(data.payment_transfer_location);
      })
      .catch(() => {})
      .finally(() => setLoadingSettings(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_cash_location: cashLocation,
          payment_card_location: cardLocation,
          payment_transfer_location: transferLocation,
        }),
      });
      if (res.ok) {
        toast.success(isAr ? "تم حفظ الإعدادات بنجاح" : "Settings saved successfully");
      } else {
        toast.error(isAr ? "حدث خطأ" : "An error occurred");
      }
    } catch {
      toast.error(isAr ? "حدث خطأ" : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("settings")}</h1>

      {/* Payment Locations */}
      <Card>
        <CardHeader>
          <CardTitle>{isAr ? "أماكن المبالغ" : "Payment Locations"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingSettings ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cash */}
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                  <Banknote className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-medium">{isAr ? "كاش" : "Cash"}</Label>
                  <Input
                    value={cashLocation}
                    onChange={(e) => setCashLocation(e.target.value)}
                    placeholder={isAr ? "مثال: عند العمال" : "e.g., With workers"}
                  />
                </div>
              </div>

              {/* Card / Network */}
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-medium">{isAr ? "شبكة" : "Card"}</Label>
                  <Input
                    value={cardLocation}
                    onChange={(e) => setCardLocation(e.target.value)}
                    placeholder={isAr ? "مثال: لدى صاحب الاستراحة" : "e.g., With resort owner"}
                  />
                </div>
              </div>

              {/* Transfer */}
              <div className="flex items-start gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="font-medium">{isAr ? "تحويل" : "Transfer"}</Label>
                  <Input
                    value={transferLocation}
                    onChange={(e) => setTransferLocation(e.target.value)}
                    placeholder={isAr ? "مثال: لدى صاحب الاستراحة" : "e.g., With resort owner"}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Site Info */}
      <Card>
        <CardHeader>
          <CardTitle>{isAr ? "معلومات الموقع" : "Site Information"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{isAr ? "اسم الموقع (عربي)" : "Site Name (Arabic)"}</Label>
              <Input defaultValue="شاليهات الراحة" />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "اسم الموقع (إنجليزي)" : "Site Name (English)"}</Label>
              <Input defaultValue="Al-Raha Chalets" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{isAr ? "الوصف (عربي)" : "Description (Arabic)"}</Label>
              <Textarea defaultValue="أفضل الشاليهات والاستراحات" rows={3} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "الوصف (إنجليزي)" : "Description (English)"}</Label>
              <Textarea defaultValue="Best Chalets & Resorts" rows={3} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle>{isAr ? "معلومات التواصل" : "Contact Information"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{isAr ? "البريد الإلكتروني" : "Email"}</Label>
              <Input defaultValue="info@chalets.com" type="email" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "رقم الهاتف" : "Phone"}</Label>
              <Input defaultValue="+966 50 000 0000" type="tel" dir="ltr" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{isAr ? "العنوان" : "Address"}</Label>
            <Input defaultValue={isAr ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"} />
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle>{isAr ? "وسائل التواصل" : "Social Media"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Twitter / X</Label>
              <Input placeholder="@username" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>Instagram</Label>
              <Input placeholder="@username" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>Snapchat</Label>
              <Input placeholder="@username" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input placeholder="+966 50 000 0000" dir="ltr" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="gap-2" size="lg">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {isAr ? "حفظ الإعدادات" : "Save Settings"}
      </Button>
    </div>
  );
}
