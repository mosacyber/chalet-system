"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Loader2, Lock, Unlock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ar as arLocale } from "date-fns/locale/ar";

interface BookedRange {
  checkIn: string;
  checkOut: string;
}

export default function ChaletCalendarPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const params = useParams();
  const slug = params.slug as string;
  const isAr = locale === "ar";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [chaletName, setChaletName] = useState("");

  // Customer bookings (PENDING/CONFIRMED) - cannot be modified
  const [customerBookedDates, setCustomerBookedDates] = useState<Date[]>([]);
  // Owner blocked dates (BLOCKED) - can be toggled
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  // Currently selected dates by owner in the calendar
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    Promise.all([
      // Fetch all booked ranges (includes PENDING, CONFIRMED, BLOCKED)
      fetch(`/api/chalets/${slug}/bookings`).then((r) => r.json()),
      // Fetch only BLOCKED dates
      fetch(`/api/chalets/${slug}/blocked-dates`).then((r) => r.json()),
      // Fetch chalet name
      fetch(`/api/chalets?dashboard=true`).then((r) => r.json()),
    ])
      .then(([allBookedRanges, blockedDateStrings, chalets]) => {
        // Build set of blocked date strings
        const blockedSet = new Set<string>(
          Array.isArray(blockedDateStrings) ? blockedDateStrings : []
        );

        // Parse all booked ranges into individual dates
        const customerDates: Date[] = [];
        const ownerBlockedDates: Date[] = [];

        if (Array.isArray(allBookedRanges)) {
          for (const range of allBookedRanges as BookedRange[]) {
            const start = new Date(range.checkIn);
            const end = new Date(range.checkOut);
            const d = new Date(start);
            while (d < end) {
              const dateStr = d.toISOString().split("T")[0];
              if (blockedSet.has(dateStr)) {
                ownerBlockedDates.push(new Date(d));
              } else {
                customerDates.push(new Date(d));
              }
              d.setDate(d.getDate() + 1);
            }
          }
        }

        setCustomerBookedDates(customerDates);
        setBlockedDates(ownerBlockedDates);

        // Get chalet name
        if (Array.isArray(chalets)) {
          const chalet = chalets.find(
            (c: { slug: string }) => c.slug === slug
          );
          if (chalet) {
            setChaletName(isAr ? chalet.nameAr : chalet.nameEn);
          }
        }
      })
      .catch(() => {
        toast.error(isAr ? "حدث خطأ في تحميل البيانات" : "Error loading data");
      })
      .finally(() => setLoading(false));
  }, [slug, isAr]);

  // Check if a date is a customer booking (not modifiable)
  const isCustomerBooked = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return customerBookedDates.some(
      (d) => d.toISOString().split("T")[0] === dateStr
    );
  };

  // Check if a date is blocked by owner
  const isBlocked = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return blockedDates.some(
      (d) => d.toISOString().split("T")[0] === dateStr
    );
  };

  // Handle blocking selected dates
  const handleBlock = async () => {
    if (!selectedDates || selectedDates.length === 0) return;

    const datesToBlock = selectedDates
      .filter((d) => !isCustomerBooked(d) && !isBlocked(d))
      .map((d) => d.toISOString().split("T")[0]);

    if (datesToBlock.length === 0) {
      toast.error(
        isAr ? "جميع التواريخ المحددة محجوزة بالفعل" : "All selected dates are already occupied"
      );
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/chalets/${slug}/blocked-dates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: datesToBlock }),
      });

      if (res.ok) {
        const newBlocked = datesToBlock.map((d) => new Date(d + "T00:00:00"));
        setBlockedDates((prev) => [...prev, ...newBlocked]);
        setSelectedDates([]);
        toast.success(
          isAr
            ? `تم حجب ${datesToBlock.length} يوم بنجاح`
            : `${datesToBlock.length} day(s) blocked successfully`
        );
      } else {
        toast.error(isAr ? "حدث خطأ" : "An error occurred");
      }
    } catch {
      toast.error(isAr ? "حدث خطأ" : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  // Handle unblocking selected dates
  const handleUnblock = async () => {
    if (!selectedDates || selectedDates.length === 0) return;

    const datesToUnblock = selectedDates
      .filter((d) => isBlocked(d))
      .map((d) => d.toISOString().split("T")[0]);

    if (datesToUnblock.length === 0) {
      toast.error(
        isAr ? "لا توجد تواريخ محجوبة في التحديد" : "No blocked dates in selection"
      );
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/chalets/${slug}/blocked-dates`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: datesToUnblock }),
      });

      if (res.ok) {
        setBlockedDates((prev) =>
          prev.filter(
            (d) => !datesToUnblock.includes(d.toISOString().split("T")[0])
          )
        );
        setSelectedDates([]);
        toast.success(
          isAr
            ? `تم إلغاء حجب ${datesToUnblock.length} يوم بنجاح`
            : `${datesToUnblock.length} day(s) unblocked successfully`
        );
      } else {
        toast.error(isAr ? "حدث خطأ" : "An error occurred");
      }
    } catch {
      toast.error(isAr ? "حدث خطأ" : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  // Count selected dates by type
  const selectedAvailable = (selectedDates || []).filter(
    (d) => !isCustomerBooked(d) && !isBlocked(d)
  ).length;
  const selectedBlocked = (selectedDates || []).filter((d) =>
    isBlocked(d)
  ).length;

  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/dashboard/chalets`}>
          <Button variant="ghost" size="icon">
            <BackIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{t("manageCalendar")}</h1>
          {chaletName && (
            <p className="text-sm text-muted-foreground">{chaletName}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("selectDatesToBlock")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={setSelectedDates}
                  disabled={[
                    { before: today },
                    ...customerBookedDates,
                  ]}
                  modifiers={{
                    customerBooked: customerBookedDates,
                    ownerBlocked: blockedDates,
                  }}
                  modifiersClassNames={{
                    customerBooked:
                      "!bg-blue-100 !text-blue-500 !opacity-100 dark:!bg-blue-950 dark:!text-blue-400",
                    ownerBlocked:
                      "!bg-red-100 !text-red-500 !opacity-100 dark:!bg-red-950 dark:!text-red-400",
                  }}
                  numberOfMonths={2}
                  locale={isAr ? arLocale : undefined}
                  dir={isAr ? "rtl" : "ltr"}
                  className="rounded-md border p-3"
                />
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-sm bg-blue-100 dark:bg-blue-950" />
                  {t("customerBooking")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-sm bg-red-100 dark:bg-red-950" />
                  {t("blockedByOwner")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-sm bg-primary" />
                  {isAr ? "محدد" : "Selected"}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-3 w-3 rounded-sm border bg-background" />
                  {t("availableDay")}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Actions */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">
                {isAr ? "الإجراءات" : "Actions"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selection info */}
              {(selectedDates || []).length > 0 ? (
                <div className="rounded-lg border p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {isAr ? "أيام محددة" : "Selected days"}
                    </span>
                    <span className="font-semibold">
                      {(selectedDates || []).length}
                    </span>
                  </div>
                  {selectedAvailable > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{isAr ? "متاحة (قابلة للحجب)" : "Available (can block)"}</span>
                      <span>{selectedAvailable}</span>
                    </div>
                  )}
                  {selectedBlocked > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>
                        {isAr ? "محجوبة (قابلة للإلغاء)" : "Blocked (can unblock)"}
                      </span>
                      <span>{selectedBlocked}</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isAr
                    ? "انقر على الأيام في التقويم لتحديدها"
                    : "Click on days in the calendar to select them"}
                </p>
              )}

              {/* Block button */}
              <Button
                onClick={handleBlock}
                disabled={saving || selectedAvailable === 0}
                className="w-full gap-2"
                variant="destructive"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                {t("blockDates")}
                {selectedAvailable > 0 && ` (${selectedAvailable})`}
              </Button>

              {/* Unblock button */}
              <Button
                onClick={handleUnblock}
                disabled={saving || selectedBlocked === 0}
                className="w-full gap-2"
                variant="outline"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}
                {t("unblockDates")}
                {selectedBlocked > 0 && ` (${selectedBlocked})`}
              </Button>

              {/* Stats */}
              <div className="rounded-lg border p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("customerBooking")}
                  </span>
                  <span className="font-semibold text-blue-600">
                    {customerBookedDates.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t("blockedByOwner")}
                  </span>
                  <span className="font-semibold text-red-500">
                    {blockedDates.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
