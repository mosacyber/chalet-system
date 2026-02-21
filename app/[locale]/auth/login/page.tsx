"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(locale === "ar" ? "تم تسجيل الدخول بنجاح" : "Login successful");
    setLoading(false);
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t("loginTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label>{t("password")}</Label>
                <Link
                  href={`/${locale}/auth/forgot-password`}
                  className="text-xs text-primary hover:underline"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <Input type="password" required dir="ltr" />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading
                ? locale === "ar"
                  ? "جاري الدخول..."
                  : "Logging in..."
                : t("loginButton")}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link
              href={`/${locale}/auth/register`}
              className="font-medium text-primary hover:underline"
            >
              {t("registerButton")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
