"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { toast } from "sonner";

export default function ContactForm() {
  const t = useTranslations("contact");
  const locale = useLocale();
  const isAr = locale === "ar";
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success(t("sent"));
    (e.target as HTMLFormElement).reset();
    setLoading(false);
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold md:text-4xl">{t("title")}</h1>
          <p className="text-lg text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t("name")}</Label>
                      <Input required placeholder={t("name")} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("email")}</Label>
                      <Input type="email" required placeholder={t("email")} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("phone")}</Label>
                    <Input type="tel" placeholder={t("phone")} dir="ltr" />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("message")}</Label>
                    <Textarea
                      required
                      rows={5}
                      placeholder={
                        isAr ? "اكتب رسالتك هنا..." : "Write your message here..."
                      }
                    />
                  </div>

                  <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
                    <Send className="h-4 w-4" />
                    {loading
                      ? isAr
                        ? "جاري الإرسال..."
                        : "Sending..."
                      : t("send")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            {[
              {
                icon: Phone,
                title: t("phone"),
                value: "+966 50 000 0000",
                dir: "ltr" as const,
              },
              {
                icon: Mail,
                title: t("email"),
                value: "info@chalets.com",
                dir: "ltr" as const,
              },
              {
                icon: MapPin,
                title: t("address"),
                value: isAr ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia",
                dir: undefined,
              },
              {
                icon: Clock,
                title: t("workingHours"),
                value: t("allDay"),
                dir: undefined,
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {item.title}
                    </div>
                    <div className="font-medium" dir={item.dir}>
                      {item.value}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
