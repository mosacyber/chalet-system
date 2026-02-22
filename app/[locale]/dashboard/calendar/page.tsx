"use client";

import { useEffect, useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { type DayButton as DayButtonType } from "react-day-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Lock,
  Unlock,
  Banknote,
  CreditCard,
  Building2,
  Phone,
  User,
  X,
  Eye,
  Printer,
  Trash2,
  Pencil,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface BookedRange {
  checkIn: string;
  checkOut: string;
}

interface BlockedDateInfo {
  id: string;
  date: string;
  checkOut: string;
  guestName: string;
  guestPhone: string;
  paymentMethod: string;
  deposit: number;
  remainingAmount: number;
  remainingPaymentMethod: string;
  remainingCollected: boolean;
  createdAt: string;
}

interface ChaletOption {
  slug: string;
  nameAr: string;
  nameEn: string;
}

// Hijri date formatter
const hijriMonthFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
  month: "long",
  year: "numeric",
});

const hijriDayFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function getHijriMonth(date: Date): string {
  return hijriMonthFormatter.format(date);
}

function getHijriDay(date: Date): string {
  return hijriDayFormatter.format(date);
}

// Hijri day number only (for calendar cells)
const hijriDayNumFormatter = new Intl.DateTimeFormat("ar-u-ca-islamic-umalqura", {
  day: "numeric",
});

// Custom DayButton that shows both Gregorian and Hijri day numbers
function HijriDayButton({ children, day, ...rest }: React.ComponentProps<typeof DayButtonType>) {
  const hijriNum = hijriDayNumFormatter.format(day.date);
  return (
    <CalendarDayButton day={day} {...rest}>
      {children}
      <span className="!text-[9px] !opacity-50 leading-none font-normal">{hijriNum}</span>
    </CalendarDayButton>
  );
}

export default function DashboardCalendarPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [chalets, setChalets] = useState<ChaletOption[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");

  // Dates
  const [customerBookedDates, setCustomerBookedDates] = useState<Date[]>([]);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [blockedInfo, setBlockedInfo] = useState<Map<string, BlockedDateInfo>>(new Map());
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);

  // Dialog
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [detailsDate, setDetailsDate] = useState<BlockedDateInfo | null>(null);

  // Form
  const [formData, setFormData] = useState({
    guestName: "",
    guestPhone: "",
    paymentMethod: "",
    deposit: "",
    remainingAmount: "",
  });

  // Edit remaining dialog
  const [showEditRemainingDialog, setShowEditRemainingDialog] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BlockedDateInfo | null>(null);
  const [editRemainingData, setEditRemainingData] = useState({
    remainingAmount: "",
    remainingPaymentMethod: "",
  });

  // Responsive: 1 month on mobile, 2 on md+
  const [isMd, setIsMd] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    setIsMd(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMd(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Current displayed month for Hijri
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Load chalets
  useEffect(() => {
    fetch("/api/chalets?dashboard=true")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setChalets(data);
          if (data.length === 1) {
            setSelectedSlug(data[0].slug);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load calendar data when chalet selected
  useEffect(() => {
    if (!selectedSlug) return;

    setLoading(true);
    Promise.all([
      fetch(`/api/chalets/${selectedSlug}/bookings`).then((r) => r.json()),
      fetch(`/api/chalets/${selectedSlug}/blocked-dates`).then((r) => r.json()),
    ])
      .then(([allBookedRanges, blockedData]) => {
        // Build blocked info map
        const infoMap = new Map<string, BlockedDateInfo>();
        const blockedSet = new Set<string>();
        if (Array.isArray(blockedData)) {
          for (const item of blockedData as BlockedDateInfo[]) {
            infoMap.set(item.date, item);
            blockedSet.add(item.date);
          }
        }

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
        setBlockedInfo(infoMap);
        setSelectedDates([]);
      })
      .catch(() => {
        toast.error(isAr ? "حدث خطأ في تحميل البيانات" : "Error loading data");
      })
      .finally(() => setLoading(false));
  }, [selectedSlug, isAr]);

  const isCustomerBooked = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return customerBookedDates.some((d) => d.toISOString().split("T")[0] === dateStr);
  };

  const isBlocked = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return blockedDates.some((d) => d.toISOString().split("T")[0] === dateStr);
  };

  const selectedAvailable = (selectedDates || []).filter(
    (d) => !isCustomerBooked(d) && !isBlocked(d)
  ).length;
  const selectedBlocked = (selectedDates || []).filter((d) => isBlocked(d)).length;

  // Open booking dialog
  const openBookingDialog = () => {
    if (selectedAvailable === 0) return;
    setFormData({ guestName: "", guestPhone: "", paymentMethod: "", deposit: "", remainingAmount: "" });
    setShowBookingDialog(true);
  };

  // Show details of a blocked date
  const showBlockedDetails = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    const info = blockedInfo.get(dateStr);
    if (info) {
      setDetailsDate(info);
      setShowDetailsDialog(true);
    }
  };

  // Handle calendar day click for blocked dates
  const handleDayClick = (day: Date) => {
    if (isBlocked(day)) {
      showBlockedDetails(day);
    }
  };

  // Submit booking
  const handleSubmitBooking = async () => {
    if (!selectedSlug) return;

    const datesToBlock = (selectedDates || [])
      .filter((d) => !isCustomerBooked(d) && !isBlocked(d))
      .map((d) => d.toISOString().split("T")[0]);

    if (datesToBlock.length === 0) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/chalets/${selectedSlug}/blocked-dates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dates: datesToBlock,
          guestName: formData.guestName,
          guestPhone: formData.guestPhone,
          paymentMethod: formData.paymentMethod,
          deposit: Number(formData.deposit) || 0,
          remainingAmount: Number(formData.remainingAmount) || 0,
        }),
      });

      if (res.ok) {
        const newBlocked = datesToBlock.map((d) => new Date(d + "T00:00:00"));
        setBlockedDates((prev) => [...prev, ...newBlocked]);

        // Update info map
        const newMap = new Map(blockedInfo);
        for (const d of datesToBlock) {
          const nextDay = new Date(d + "T00:00:00");
          nextDay.setDate(nextDay.getDate() + 1);
          newMap.set(d, {
            id: "tmp-" + d,
            date: d,
            checkOut: nextDay.toISOString().split("T")[0],
            guestName: formData.guestName,
            guestPhone: formData.guestPhone,
            paymentMethod: formData.paymentMethod,
            deposit: Number(formData.deposit) || 0,
            remainingAmount: Number(formData.remainingAmount) || 0,
            remainingPaymentMethod: "",
            remainingCollected: false,
            createdAt: new Date().toISOString(),
          });
        }
        setBlockedInfo(newMap);

        setSelectedDates([]);
        setShowBookingDialog(false);
        toast.success(
          isAr
            ? `تم حجز ${datesToBlock.length} يوم بنجاح`
            : `${datesToBlock.length} day(s) booked successfully`
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

  // Unblock selected dates
  const handleUnblock = async () => {
    if (!selectedSlug) return;

    const datesToUnblock = (selectedDates || [])
      .filter((d) => isBlocked(d))
      .map((d) => d.toISOString().split("T")[0]);

    if (datesToUnblock.length === 0) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/chalets/${selectedSlug}/blocked-dates`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: datesToUnblock }),
      });

      if (res.ok) {
        setBlockedDates((prev) =>
          prev.filter((d) => !datesToUnblock.includes(d.toISOString().split("T")[0]))
        );
        const newMap = new Map(blockedInfo);
        for (const d of datesToUnblock) newMap.delete(d);
        setBlockedInfo(newMap);
        setSelectedDates([]);
        toast.success(
          isAr
            ? `تم إلغاء حجز ${datesToUnblock.length} يوم`
            : `${datesToUnblock.length} day(s) unblocked`
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

  // Unblock from details dialog
  const handleUnblockSingle = async (dateStr: string) => {
    if (!selectedSlug) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/chalets/${selectedSlug}/blocked-dates`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates: [dateStr] }),
      });
      if (res.ok) {
        setBlockedDates((prev) =>
          prev.filter((d) => d.toISOString().split("T")[0] !== dateStr)
        );
        const newMap = new Map(blockedInfo);
        newMap.delete(dateStr);
        setBlockedInfo(newMap);
        setShowDetailsDialog(false);
        toast.success(isAr ? "تم إلغاء الحجز" : "Booking removed");
      }
    } catch {
      toast.error(isAr ? "حدث خطأ" : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  // Open edit remaining dialog
  const openEditRemaining = (booking: BlockedDateInfo) => {
    setEditingBooking(booking);
    setEditRemainingData({
      remainingAmount: String(booking.remainingAmount || ""),
      remainingPaymentMethod: booking.remainingPaymentMethod || "",
    });
    setShowEditRemainingDialog(true);
  };

  // Submit edit remaining
  const handleSubmitEditRemaining = async () => {
    if (!selectedSlug || !editingBooking) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/chalets/${selectedSlug}/blocked-dates`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: editingBooking.id,
          remainingAmount: Number(editRemainingData.remainingAmount) || 0,
          remainingPaymentMethod: editRemainingData.remainingPaymentMethod,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update local state
        const newMap = new Map(blockedInfo);
        const existing = newMap.get(editingBooking.date);
        if (existing) {
          newMap.set(editingBooking.date, {
            ...existing,
            remainingAmount: data.remainingAmount ?? (Number(editRemainingData.remainingAmount) || 0),
            remainingPaymentMethod: data.remainingPaymentMethod ?? editRemainingData.remainingPaymentMethod,
            remainingCollected: data.remainingCollected ?? (!!editRemainingData.remainingPaymentMethod),
          });
          setBlockedInfo(newMap);
        }
        setShowEditRemainingDialog(false);
        // Also update details dialog if open
        if (detailsDate?.id === editingBooking.id) {
          setDetailsDate({
            ...detailsDate,
            remainingAmount: data.remainingAmount ?? (Number(editRemainingData.remainingAmount) || 0),
            remainingPaymentMethod: data.remainingPaymentMethod ?? editRemainingData.remainingPaymentMethod,
            remainingCollected: data.remainingCollected ?? (!!editRemainingData.remainingPaymentMethod),
          });
        }
        toast.success(isAr ? "تم تحديث الباقي بنجاح" : "Remaining updated successfully");
      } else {
        toast.error(isAr ? "حدث خطأ" : "An error occurred");
      }
    } catch {
      toast.error(isAr ? "حدث خطأ" : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const paymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: isAr ? "كاش" : "Cash",
      transfer: isAr ? "تحويل" : "Bank Transfer",
      card: isAr ? "شبكة" : "Card",
    };
    return labels[method] || method;
  };

  // Bookings list from blocked info
  const bookingsList = useMemo(() => {
    return Array.from(blockedInfo.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [blockedInfo]);

  // Get selected chalet name
  const selectedChaletName = useMemo(() => {
    const c = chalets.find((ch) => ch.slug === selectedSlug);
    return c ? (isAr ? c.nameAr : c.nameEn) : "";
  }, [chalets, selectedSlug, isAr]);

  // Print invoice
  const printInvoice = (booking: BlockedDateInfo) => {
    const siteName = isAr ? "شاليهات الراحة" : "Al-Raha Chalets";
    const invoiceTitle = isAr ? "فاتورة حجز" : "Booking Invoice";
    const hijriDate = getHijriDay(new Date(booking.date + "T00:00:00"));
    const total = booking.deposit + booking.remainingAmount;
    const payLabel = paymentMethodLabel(booking.paymentMethod);
    const currency = isAr ? "ريال" : "SAR";
    const dir = isAr ? "rtl" : "ltr";

    const html = `<!DOCTYPE html>
<html dir="${dir}" lang="${isAr ? "ar" : "en"}">
<head>
<meta charset="utf-8">
<title>${invoiceTitle}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; padding: 40px; color: #1a1a1a; direction: ${dir}; }
  .invoice { max-width: 600px; margin: 0 auto; border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
  .header { background: #1e293b; color: white; padding: 24px; text-align: center; }
  .header h1 { font-size: 22px; margin-bottom: 4px; }
  .header h2 { font-size: 14px; font-weight: normal; opacity: 0.8; }
  .section { padding: 20px 24px; border-bottom: 1px solid #e5e7eb; }
  .section:last-child { border-bottom: none; }
  .row { display: flex; justify-content: space-between; padding: 8px 0; }
  .row .label { color: #6b7280; font-size: 14px; }
  .row .value { font-weight: 600; font-size: 14px; }
  .total-row { display: flex; justify-content: space-between; padding: 12px 0; border-top: 2px solid #1e293b; margin-top: 8px; }
  .total-row .label { font-size: 16px; font-weight: 700; }
  .total-row .value { font-size: 18px; font-weight: 700; color: #059669; }
  .footer { text-align: center; padding: 16px 24px; background: #f9fafb; color: #6b7280; font-size: 12px; }
  .booking-id { font-family: monospace; font-size: 12px; opacity: 0.7; margin-top: 4px; }
  @media print { body { padding: 0; } .invoice { border: none; } }
</style>
</head>
<body>
<div class="invoice">
  <div class="header">
    <h1>${siteName}</h1>
    <h2>${invoiceTitle}</h2>
    <div class="booking-id">#${booking.id.slice(-8).toUpperCase()}</div>
  </div>
  <div class="section">
    <div class="row"><span class="label">${isAr ? "الشاليه" : "Chalet"}</span><span class="value">${selectedChaletName}</span></div>
    <div class="row"><span class="label">${isAr ? "التاريخ" : "Date"}</span><span class="value">${booking.date}</span></div>
    <div class="row"><span class="label">${isAr ? "التاريخ الهجري" : "Hijri Date"}</span><span class="value">${hijriDate}</span></div>
  </div>
  <div class="section">
    ${booking.guestName ? `<div class="row"><span class="label">${isAr ? "اسم الضيف" : "Guest Name"}</span><span class="value">${booking.guestName}</span></div>` : ""}
    ${booking.guestPhone ? `<div class="row"><span class="label">${isAr ? "رقم الجوال" : "Phone"}</span><span class="value" dir="ltr">${booking.guestPhone}</span></div>` : ""}
  </div>
  <div class="section">
    ${booking.paymentMethod ? `<div class="row"><span class="label">${isAr ? "طريقة الدفع" : "Payment Method"}</span><span class="value">${payLabel}</span></div>` : ""}
    <div class="row"><span class="label">${isAr ? "العربون" : "Deposit"}</span><span class="value">${booking.deposit.toLocaleString()} ${currency}</span></div>
    <div class="row"><span class="label">${isAr ? "الباقي" : "Remaining"}</span><span class="value">${booking.remainingAmount.toLocaleString()} ${currency}</span></div>
    <div class="total-row"><span class="label">${isAr ? "الإجمالي" : "Total"}</span><span class="value">${total.toLocaleString()} ${currency}</span></div>
  </div>
  <div class="footer">
    ${isAr ? "شكراً لتعاملكم معنا" : "Thank you for your business"} &bull; ${new Date().toLocaleDateString(isAr ? "ar-SA" : "en-US")}
  </div>
</div>
<script>window.onload=function(){window.print();}<\/script>
</body>
</html>`;

    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  // Hijri month display
  const hijriMonthText = useMemo(() => getHijriMonth(currentMonth), [currentMonth]);

  if (loading && chalets.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("manageCalendar")}</h1>
      </div>

      {/* Chalet selector */}
      {chalets.length > 1 && (
        <Card>
          <CardContent className="py-4">
            <Label className="mb-2 block">{t("selectChalet")}</Label>
            <Select value={selectedSlug} onValueChange={setSelectedSlug}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder={t("selectChalet")} />
              </SelectTrigger>
              <SelectContent>
                {chalets.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>
                    {isAr ? c.nameAr : c.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {!selectedSlug ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {t("selectChalet")}
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                  <span>{t("selectDatesToBlock")}</span>
                </CardTitle>
                {/* Hijri date display */}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{t("hijriDate")}: <span className="font-semibold text-foreground">{hijriMonthText}</span></span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={setSelectedDates}
                    onDayClick={handleDayClick}
                    disabled={[{ before: today }, ...customerBookedDates]}
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
                    components={{
                      DayButton: HijriDayButton,
                    }}
                    numberOfMonths={isMd ? 2 : 1}
                    dir={isAr ? "rtl" : "ltr"}
                    className="rounded-md border p-3 [--cell-size:2.75rem]"
                    onMonthChange={setCurrentMonth}
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

                {/* Hijri hint */}
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {isAr
                    ? "انقر على يوم محجوب (أحمر) لعرض تفاصيل الحجز"
                    : "Click on a blocked day (red) to view booking details"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Actions */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-20">
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
                      <span className="font-semibold">{(selectedDates || []).length}</span>
                    </div>
                    {selectedAvailable > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>{isAr ? "متاحة" : "Available"}</span>
                        <span>{selectedAvailable}</span>
                      </div>
                    )}
                    {selectedBlocked > 0 && (
                      <div className="flex justify-between text-red-500">
                        <span>{isAr ? "محجوزة" : "Blocked"}</span>
                        <span>{selectedBlocked}</span>
                      </div>
                    )}
                    {/* Hijri dates of selection */}
                    {(selectedDates || []).length <= 3 && (
                      <div className="border-t pt-2 mt-2 space-y-1">
                        {(selectedDates || []).map((d, i) => (
                          <div key={i} className="text-xs text-muted-foreground">
                            {getHijriDay(d)}
                          </div>
                        ))}
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

                {/* Add Booking button - opens dialog */}
                <Button
                  onClick={openBookingDialog}
                  disabled={saving || selectedAvailable === 0}
                  className="w-full gap-2"
                  variant="destructive"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  {t("addBooking")}
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
                    <span className="text-muted-foreground">{t("customerBooking")}</span>
                    <span className="font-semibold text-blue-600">
                      {customerBookedDates.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t("blockedByOwner")}</span>
                    <span className="font-semibold text-red-500">
                      {blockedDates.length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Bookings List Table */}
      {selectedSlug && !loading && bookingsList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("bookingsList")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Mobile: Card layout */}
            <div className="space-y-3 p-4 md:hidden">
              {bookingsList.map((booking) => (
                <div key={booking.id || booking.date} className="rounded-lg border p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold">{booking.date}</div>
                      <div className="text-xs text-muted-foreground">
                        {getHijriDay(new Date(booking.date + "T00:00:00"))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setDetailsDate(booking); setShowDetailsDialog(true); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => printInvoice(booking)}>
                        <Printer className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { if (confirm(isAr ? "هل أنت متأكد من حذف هذا الحجز؟" : "Delete this booking?")) handleUnblockSingle(booking.date); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {booking.guestName && <div className="text-sm"><span className="text-muted-foreground">{t("guestName")}: </span>{booking.guestName}</div>}
                  {booking.guestPhone && <div className="text-sm" dir="ltr"><span className="text-muted-foreground" dir={isAr ? "rtl" : "ltr"}>{t("guestPhone")}: </span>{booking.guestPhone}</div>}
                  <div className="flex items-center justify-between text-sm pt-1 border-t">
                    <span className="text-green-600">{t("depositAmount")}: {booking.deposit.toLocaleString()}</span>
                    <span className="font-bold">{(booking.deposit + booking.remainingAmount).toLocaleString()} {isAr ? "ريال" : "SAR"}</span>
                  </div>
                  {/* Remaining status / edit button */}
                  {booking.remainingAmount > 0 && (
                    <div className="flex items-center justify-between text-sm pt-1 border-t">
                      <span className="text-muted-foreground">{isAr ? "الباقي" : "Remaining"}: <span className="text-orange-500 font-medium">{booking.remainingAmount.toLocaleString()}</span></span>
                      {booking.remainingCollected ? (
                        <span className="flex items-center gap-1 text-green-600 text-xs">
                          <CheckCircle className="h-3 w-3" />
                          {isAr ? "تم الاستلام" : "Collected"} ({paymentMethodLabel(booking.remainingPaymentMethod)})
                        </span>
                      ) : (
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => openEditRemaining(booking)}>
                          <Pencil className="h-3 w-3" />
                          {isAr ? "استلام الباقي" : "Collect"}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop: Table layout */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-sm text-muted-foreground">
                    <th className="px-4 py-3 text-start font-medium">{t("bookingDate")}</th>
                    <th className="px-4 py-3 text-start font-medium">{t("guestName")}</th>
                    <th className="px-4 py-3 text-start font-medium">{t("guestPhone")}</th>
                    <th className="px-4 py-3 text-start font-medium">{t("paymentMethodLabel")}</th>
                    <th className="px-4 py-3 text-start font-medium">{t("depositAmount")}</th>
                    <th className="px-4 py-3 text-start font-medium">{t("remainingAmountLabel")}</th>
                    <th className="px-4 py-3 text-start font-medium">{t("totalAmount")}</th>
                    <th className="px-4 py-3 text-start font-medium">{isAr ? "الإجراءات" : "Actions"}</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsList.map((booking) => (
                    <tr key={booking.id || booking.date} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium">{booking.date}</div>
                        <div className="text-xs text-muted-foreground">{getHijriDay(new Date(booking.date + "T00:00:00"))}</div>
                      </td>
                      <td className="px-4 py-3 text-sm">{booking.guestName || "-"}</td>
                      <td className="px-4 py-3 text-sm" dir="ltr">{booking.guestPhone || "-"}</td>
                      <td className="px-4 py-3 text-sm">{booking.paymentMethod ? paymentMethodLabel(booking.paymentMethod) : "-"}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-medium">{booking.deposit > 0 ? `${booking.deposit.toLocaleString()} ${isAr ? "ريال" : "SAR"}` : "-"}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-1.5">
                          {booking.remainingCollected ? (
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                              <CheckCircle className="h-3.5 w-3.5" />
                              {isAr ? "تم الاستلام" : "Collected"}
                              {booking.remainingPaymentMethod && (
                                <span className="text-xs text-muted-foreground">({paymentMethodLabel(booking.remainingPaymentMethod)})</span>
                              )}
                            </span>
                          ) : booking.remainingAmount > 0 ? (
                            <>
                              <span className="text-orange-500 font-medium">{booking.remainingAmount.toLocaleString()} {isAr ? "ريال" : "SAR"}</span>
                              <Button variant="ghost" size="icon" className="h-7 w-7" title={isAr ? "تعديل الباقي" : "Edit remaining"} onClick={() => openEditRemaining(booking)}>
                                <Pencil className="h-3.5 w-3.5 text-primary" />
                              </Button>
                            </>
                          ) : (
                            <span>-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold">{(booking.deposit + booking.remainingAmount).toLocaleString()} {isAr ? "ريال" : "SAR"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={t("bookingDetails")} onClick={() => { setDetailsDate(booking); setShowDetailsDialog(true); }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title={t("printInvoice")} onClick={() => printInvoice(booking)}>
                            <Printer className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title={t("deleteBooking")} onClick={() => { if (confirm(isAr ? "هل أنت متأكد من حذف هذا الحجز؟" : "Are you sure you want to delete this booking?")) handleUnblockSingle(booking.date); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedSlug && !loading && bookingsList.length === 0 && blockedDates.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {t("noBookings")}
          </CardContent>
        </Card>
      )}

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("addBooking")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Guest Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {t("guestName")}
              </Label>
              <Input
                value={formData.guestName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, guestName: e.target.value }))
                }
                placeholder={isAr ? "اسم الضيف" : "Guest name"}
              />
            </div>

            {/* Guest Phone */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {t("guestPhone")}
              </Label>
              <Input
                type="tel"
                dir="ltr"
                value={formData.guestPhone}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, guestPhone: e.target.value }))
                }
                placeholder="05xxxxxxxx"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>{t("paymentMethodLabel")}</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: "cash", icon: Banknote, label: t("cash") },
                  { key: "transfer", icon: Building2, label: t("transfer") },
                  { key: "card", icon: CreditCard, label: t("card") },
                ].map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setFormData((p) => ({ ...p, paymentMethod: key }))
                    }
                    className={`flex flex-col items-center gap-1 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                      formData.paymentMethod === key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Deposit */}
            <div className="space-y-2">
              <Label>{t("depositAmount")}</Label>
              <Input
                type="number"
                dir="ltr"
                min={0}
                step="0.01"
                value={formData.deposit}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, deposit: e.target.value }))
                }
                placeholder="0.00"
              />
            </div>

            {/* Remaining */}
            <div className="space-y-2">
              <Label>{t("remainingAmountLabel")}</Label>
              <Input
                type="number"
                dir="ltr"
                min={0}
                step="0.01"
                value={formData.remainingAmount}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, remainingAmount: e.target.value }))
                }
                placeholder="0.00"
              />
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmitBooking}
              disabled={saving}
              className="w-full gap-2"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {isAr ? "تأكيد الحجز" : "Confirm Booking"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Remaining Dialog */}
      <Dialog open={showEditRemainingDialog} onOpenChange={setShowEditRemainingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{isAr ? "استلام الباقي" : "Collect Remaining"}</DialogTitle>
          </DialogHeader>
          {editingBooking && (
            <div className="space-y-4">
              {/* Booking info */}
              <div className="rounded-lg bg-muted p-3 text-center space-y-1">
                <p className="text-sm text-muted-foreground">{editingBooking.guestName || (isAr ? "بدون اسم" : "No name")}</p>
                <p className="font-semibold">{editingBooking.date}</p>
                <p className="text-xs text-muted-foreground">{getHijriDay(new Date(editingBooking.date + "T00:00:00"))}</p>
              </div>

              {/* Current remaining */}
              <div className="rounded-lg border p-3 text-center">
                <p className="text-xs text-muted-foreground">{isAr ? "المبلغ الباقي" : "Remaining Amount"}</p>
                <p className="text-2xl font-bold text-orange-500">
                  {editingBooking.remainingAmount.toLocaleString()} <span className="text-sm">{isAr ? "ريال" : "SAR"}</span>
                </p>
              </div>

              {/* Payment method selection */}
              <div className="space-y-2">
                <Label>{isAr ? "طريقة الاستلام" : "Collection Method"}</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "cash", icon: Banknote, label: isAr ? "كاش" : "Cash" },
                    { key: "card", icon: CreditCard, label: isAr ? "شبكة" : "Card" },
                    { key: "transfer", icon: Building2, label: isAr ? "تحويل" : "Transfer" },
                  ].map(({ key, icon: Icon, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setEditRemainingData((p) => ({ ...p, remainingPaymentMethod: key }))
                      }
                      className={`flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-xs font-medium transition-colors ${
                        editRemainingData.remainingPaymentMethod === key
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional: edit remaining amount */}
              <div className="space-y-2">
                <Label>{isAr ? "المبلغ المستلم" : "Amount Collected"}</Label>
                <Input
                  type="number"
                  dir="ltr"
                  min={0}
                  step="0.01"
                  value={editRemainingData.remainingAmount}
                  onChange={(e) =>
                    setEditRemainingData((p) => ({ ...p, remainingAmount: e.target.value }))
                  }
                  placeholder={String(editingBooking.remainingAmount)}
                />
              </div>

              {/* Submit */}
              <Button
                onClick={handleSubmitEditRemaining}
                disabled={saving || !editRemainingData.remainingPaymentMethod}
                className="w-full gap-2"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                {isAr ? "تأكيد الاستلام" : "Confirm Collection"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("bookingDetails")}</DialogTitle>
          </DialogHeader>
          {detailsDate && (
            <div className="space-y-3">
              {/* Date */}
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="font-semibold">{detailsDate.date}</p>
                <p className="text-sm text-muted-foreground">
                  {getHijriDay(new Date(detailsDate.date + "T00:00:00"))}
                </p>
              </div>

              {/* Guest Info */}
              {detailsDate.guestName && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("guestName")}</p>
                    <p className="font-medium">{detailsDate.guestName}</p>
                  </div>
                </div>
              )}

              {detailsDate.guestPhone && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("guestPhone")}</p>
                    <p className="font-medium" dir="ltr">{detailsDate.guestPhone}</p>
                  </div>
                </div>
              )}

              {detailsDate.paymentMethod && (
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">{t("paymentMethodLabel")}</p>
                    <p className="font-medium">{paymentMethodLabel(detailsDate.paymentMethod)}</p>
                  </div>
                </div>
              )}

              {(detailsDate.deposit > 0 || detailsDate.remainingAmount > 0) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-xs text-muted-foreground">{t("depositAmount")}</p>
                    <p className="text-lg font-bold text-green-600">
                      {detailsDate.deposit.toLocaleString()} <span className="text-xs">{isAr ? "ريال" : "SAR"}</span>
                    </p>
                  </div>
                  <div className="rounded-lg border p-3 text-center">
                    <p className="text-xs text-muted-foreground">{t("remainingAmountLabel")}</p>
                    <p className="text-lg font-bold text-orange-500">
                      {detailsDate.remainingAmount.toLocaleString()} <span className="text-xs">{isAr ? "ريال" : "SAR"}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Remaining collection status / button */}
              {detailsDate.remainingAmount > 0 && (
                detailsDate.remainingCollected ? (
                  <div className="flex items-center justify-center gap-2 rounded-lg bg-green-50 dark:bg-green-950 p-3 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">
                      {isAr ? "تم استلام الباقي" : "Remaining collected"} - {paymentMethodLabel(detailsDate.remainingPaymentMethod)}
                    </span>
                  </div>
                ) : (
                  <Button
                    onClick={() => openEditRemaining(detailsDate)}
                    className="w-full gap-2"
                    variant="default"
                  >
                    <Pencil className="h-4 w-4" />
                    {isAr ? "استلام الباقي" : "Collect Remaining"}
                  </Button>
                )
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => printInvoice(detailsDate)}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <Printer className="h-4 w-4" />
                  {t("printInvoice")}
                </Button>
                <Button
                  onClick={() => handleUnblockSingle(detailsDate.date)}
                  disabled={saving}
                  variant="outline"
                  className="flex-1 gap-2 text-destructive"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  {t("deleteBooking")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
