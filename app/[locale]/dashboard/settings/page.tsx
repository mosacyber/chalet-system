"use client";

import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const isAr = locale === "ar";

  const handleSave = () => {
    toast.success(isAr ? "تم حفظ الإعدادات بنجاح" : "Settings saved successfully");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("settings")}</h1>

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

      <Button onClick={handleSave} className="gap-2" size="lg">
        <Save className="h-4 w-4" />
        {isAr ? "حفظ الإعدادات" : "Save Settings"}
      </Button>
    </div>
  );
}
