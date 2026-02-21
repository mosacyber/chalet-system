"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(
      isAr
        ? "تم إرسال رابط إعادة تعيين كلمة المرور لبريدك الإلكتروني"
        : "Password reset link sent to your email"
    );
    setLoading(false);
  };

  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-12">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t("forgotPassword")}</CardTitle>
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
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading
                ? isAr
                  ? "جاري الإرسال..."
                  : "Sending..."
                : isAr
                ? "إرسال رابط إعادة التعيين"
                : "Send Reset Link"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link
              href={`/${locale}/auth/login`}
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <BackArrow className="h-3 w-3" />
              {t("loginButton")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
