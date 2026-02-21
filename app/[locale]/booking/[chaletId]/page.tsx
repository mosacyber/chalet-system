"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Users, CreditCard, CheckCircle } from "lucide-react";

export default function BookingPage() {
  const t = useTranslations("booking");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [step, setStep] = useState<"form" | "confirmed">("form");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState("");

  const nightsCount =
    checkIn && checkOut
      ? Math.max(
          1,
          Math.ceil(
            (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : 0;

  const pricePerNight = 800;
  const totalPrice = nightsCount * pricePerNight;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("confirmed");
  };

  if (step === "confirmed") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-12">
        <Card className="mx-auto w-full max-w-md text-center">
          <CardContent className="p-8">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
            <h2 className="mb-2 text-2xl font-bold">{t("confirmation")}</h2>
            <p className="mb-6 text-muted-foreground">
              {t("confirmationMessage")}
            </p>
            <div className="mb-6 rounded-lg bg-muted p-4">
              <div className="text-sm text-muted-foreground">
                {t("bookingNumber")}
              </div>
              <div className="text-xl font-bold">BK-2024-001</div>
            </div>
            <Link href={`/${locale}`}>
              <Button className="w-full">{tc("home")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h1 className="mb-8 text-3xl font-bold">{t("title")}</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    {t("selectDates")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{t("checkIn")}</Label>
                      <Input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("checkOut")}</Label>
                      <Input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        min={checkIn || new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {t("guestCount")}
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={15}
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("notes")}</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={
                        isAr
                          ? "أي ملاحظات أو طلبات خاصة..."
                          : "Any special notes or requests..."
                      }
                      rows={3}
                    />
                  </div>

                  <Separator />

                  {/* Payment Method */}
                  <div>
                    <Label className="mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      {t("paymentMethod")}
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "card", label: t("creditCard") },
                        { value: "mada", label: t("mada") },
                        { value: "apple_pay", label: t("applePay") },
                      ].map((method) => (
                        <label
                          key={method.value}
                          className="flex cursor-pointer items-center justify-center rounded-lg border p-3 text-sm transition-colors hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={method.value}
                            defaultChecked={method.value === "card"}
                            className="sr-only"
                          />
                          {method.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={!checkIn || !checkOut}>
                    {t("confirmBooking")}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>{t("bookingSummary")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("checkIn")}</span>
                    <span className="font-medium">{checkIn || "---"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("checkOut")}</span>
                    <span className="font-medium">{checkOut || "---"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("guestCount")}</span>
                    <span className="font-medium">
                      {guests} {tc("guests")}
                    </span>
                  </div>
                  {nightsCount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {pricePerNight} {tc("sar")} x {nightsCount} {tc("nights")}
                      </span>
                      <span className="font-medium">
                        {totalPrice} {tc("sar")}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>{t("totalPrice")}</span>
                  <span className="text-primary">
                    {totalPrice > 0 ? `${totalPrice} ${tc("sar")}` : "---"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
