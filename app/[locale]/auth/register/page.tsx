"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(
      locale === "ar" ? "تم إنشاء الحساب بنجاح" : "Account created successfully"
    );
    setLoading(false);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t("registerTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("name")}</Label>
              <Input required placeholder={t("name")} />
            </div>
            <div className="space-y-2">
              <Label>{t("email")}</Label>
              <Input
                type="email"
                required
                placeholder="email@example.com"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>{t("phone")}</Label>
              <Input type="tel" placeholder="+966 5X XXX XXXX" dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>{t("password")}</Label>
              <Input type="password" required minLength={6} dir="ltr" />
            </div>
            <div className="space-y-2">
              <Label>{t("confirmPassword")}</Label>
              <Input type="password" required minLength={6} dir="ltr" />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading
                ? locale === "ar"
                  ? "جاري الإنشاء..."
                  : "Creating..."
                : t("registerButton")}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {t("hasAccount")}{" "}
            <Link
              href={`/${locale}/auth/login`}
              className="font-medium text-primary hover:underline"
            >
              {t("loginButton")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
