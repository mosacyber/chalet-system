"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarDays } from "lucide-react";
import Link from "next/link";
import type { DateRange } from "react-day-picker";
import { ar as arLocale } from "date-fns/locale/ar";

interface BookedRange {
  checkIn: string;
  checkOut: string;
}

interface BookingCalendarProps {
  chaletId: string;
  slug: string;
  pricePerNight: number;
  weekendPrice: number;
}

export default function BookingCalendar({
  chaletId,
  slug,
  pricePerNight,
  weekendPrice,
}: BookingCalendarProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const tb = useTranslations("booking");
  const tc = useTranslations("common");

  const [bookedRanges, setBookedRanges] = useState<BookedRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<DateRange | undefined>();

  useEffect(() => {
    fetch(`/api/chalets/${slug}/bookings`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBookedRanges(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  // Build a Set of booked date strings for fast lookup
  const bookedDatesSet = new Set<string>();
  for (const range of bookedRanges) {
    const start = new Date(range.checkIn);
    const end = new Date(range.checkOut);
    const d = new Date(start);
    while (d < end) {
      bookedDatesSet.add(d.toISOString().split("T")[0]);
      d.setDate(d.getDate() + 1);
    }
  }

  const bookedDatesArray: Date[] = [];
  for (const dateStr of bookedDatesSet) {
    bookedDatesArray.push(new Date(dateStr + "T00:00:00"));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate nights and price
  let nightsCount = 0;
  let totalPrice = 0;
  if (selected?.from && selected?.to) {
    const d = new Date(selected.from);
    while (d < selected.to) {
      const day = d.getDay();
      const isWeekend = day === 5 || day === 6;
      const price =
        isWeekend && weekendPrice ? weekendPrice : pricePerNight;
      totalPrice += price;
      nightsCount++;
      d.setDate(d.getDate() + 1);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {tb("selectDatesRange")}
      </p>

      <div className="flex justify-center">
        <Calendar
          mode="range"
          selected={selected}
          onSelect={setSelected}
          disabled={[
            { before: today },
            ...bookedDatesArray.map((d) => d),
          ]}
          modifiers={{
            booked: bookedDatesArray,
          }}
          modifiersClassNames={{
            booked:
              "!bg-red-100 !text-red-400 !opacity-100 line-through dark:!bg-red-950 dark:!text-red-400",
          }}
          numberOfMonths={1}
          locale={isAr ? arLocale : undefined}
          dir={isAr ? "rtl" : "ltr"}
          className="rounded-md border p-3"
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-red-100 dark:bg-red-950" />
          {tb("booked")}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-primary" />
          {tb("selected")}
        </span>
      </div>

      {/* Price summary */}
      {nightsCount > 0 && (
        <div className="rounded-lg border p-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {nightsCount} {tb("nights")}
            </span>
            <span className="font-semibold">
              {totalPrice.toLocaleString()} {tc("sar")}
            </span>
          </div>
        </div>
      )}

      {/* Book button */}
      <Link
        href={
          selected?.from && selected?.to
            ? `/${locale}/booking/${chaletId}?checkIn=${selected.from.toISOString().split("T")[0]}&checkOut=${selected.to.toISOString().split("T")[0]}`
            : "#"
        }
      >
        <Button
          className="w-full gap-2"
          size="lg"
          disabled={!selected?.from || !selected?.to}
        >
          <CalendarDays className="h-4 w-4" />
          {tc("bookNow")}
        </Button>
      </Link>
    </div>
  );
}
