"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2, Droplets } from "lucide-react";
import { toast } from "sonner";

interface WaterExpense {
  id: string;
  chaletId: string;
  chaletNameAr: string;
  chaletNameEn: string;
  amount: number;
  notes: string | null;
  date: string;
}

interface ChaletOption {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
}

export default function WaterPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expenses, setExpenses] = useState<WaterExpense[]>([]);
  const [chalets, setChalets] = useState<ChaletOption[]>([]);

  // Form
  const [chaletId, setChaletId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Load chalets and expenses
  useEffect(() => {
    Promise.all([
      fetch("/api/chalets?dashboard=true").then((r) => r.json()),
      fetch("/api/dashboard/water").then((r) => r.json()),
    ])
      .then(([chaletsData, waterData]) => {
        if (Array.isArray(chaletsData)) {
          setChalets(chaletsData);
          if (chaletsData.length === 1) {
            setChaletId(chaletsData[0].id);
          }
        }
        if (Array.isArray(waterData)) {
          setExpenses(waterData);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!chaletId || !amount) {
      toast.error(isAr ? "أدخل الشاليه والمبلغ" : "Enter chalet and amount");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chaletId, amount: Number(amount), notes: notes || null, date }),
      });

      if (res.ok) {
        toast.success(isAr ? "تمت الإضافة بنجاح" : "Added successfully");
        // Reload expenses
        const data = await fetch("/api/dashboard/water").then((r) => r.json());
        if (Array.isArray(data)) setExpenses(data);
        setAmount("");
        setNotes("");
        setDate(new Date().toISOString().split("T")[0]);
      } else {
        toast.error(isAr ? "حدث خطأ" : "An error occurred");
      }
    } catch {
      toast.error(isAr ? "حدث خطأ" : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? "هل أنت متأكد من الحذف؟" : "Are you sure?")) return;

    try {
      const res = await fetch("/api/dashboard/water", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setExpenses((prev) => prev.filter((e) => e.id !== id));
        toast.success(isAr ? "تم الحذف" : "Deleted");
      }
    } catch {
      toast.error(isAr ? "حدث خطأ" : "An error occurred");
    }
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Droplets className="h-6 w-6 text-cyan-600" />
        <h1 className="text-2xl font-bold">{isAr ? "وايت الماء" : "Water Tanker"}</h1>
      </div>

      {/* Add Form */}
      <Card>
        <CardHeader>
          <CardTitle>{isAr ? "إضافة تعبئة ماء" : "Add Water Expense"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Chalet */}
            <div className="space-y-2">
              <Label>{isAr ? "الشاليه" : "Chalet"}</Label>
              <Select value={chaletId} onValueChange={setChaletId}>
                <SelectTrigger>
                  <SelectValue placeholder={isAr ? "اختر الشاليه" : "Select chalet"} />
                </SelectTrigger>
                <SelectContent>
                  {chalets.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {isAr ? c.nameAr : c.nameEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label>{isAr ? "المبلغ" : "Amount"} ({tc("sar")})</Label>
              <Input
                type="number"
                dir="ltr"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>{isAr ? "التاريخ" : "Date"}</Label>
              <Input
                type="date"
                dir="ltr"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>{isAr ? "ملاحظات" : "Notes"}</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isAr ? "اختياري" : "Optional"}
              />
            </div>

            {/* Submit */}
            <div className="flex items-end">
              <Button onClick={handleAdd} disabled={saving} className="w-full gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {isAr ? "إضافة" : "Add"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total */}
      {expenses.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-100 dark:bg-cyan-950">
                  <Droplets className="h-5 w-5 text-cyan-600" />
                </div>
                <span className="font-semibold">{isAr ? "إجمالي تعبئة الماء" : "Total Water Expenses"}</span>
              </div>
              <span className="text-xl font-bold text-cyan-600">
                {total.toLocaleString()} {tc("sar")}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>{isAr ? "سجل التعبئة" : "Water Log"}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {expenses.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {isAr ? "لا توجد مصاريف ماء" : "No water expenses"}
            </p>
          ) : (
            <>
              {/* Mobile: Card layout */}
              <div className="space-y-3 p-4 md:hidden">
                {expenses.map((expense) => (
                  <div key={expense.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium" dir="ltr">{expense.date}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isAr ? expense.chaletNameAr : expense.chaletNameEn}
                    </div>
                    {expense.notes && (
                      <div className="text-sm text-muted-foreground">{expense.notes}</div>
                    )}
                    <div className="text-sm font-bold text-cyan-600">
                      {expense.amount.toLocaleString()} {tc("sar")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: Table layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-sm text-muted-foreground">
                      <th className="px-4 py-3 text-start font-medium">{isAr ? "التاريخ" : "Date"}</th>
                      <th className="px-4 py-3 text-start font-medium">{isAr ? "الشاليه" : "Chalet"}</th>
                      <th className="px-4 py-3 text-start font-medium">{isAr ? "المبلغ" : "Amount"}</th>
                      <th className="px-4 py-3 text-start font-medium">{isAr ? "ملاحظات" : "Notes"}</th>
                      <th className="px-4 py-3 text-start font-medium">{isAr ? "حذف" : "Delete"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense.id} className="border-b last:border-0">
                        <td className="px-4 py-3 text-sm" dir="ltr">{expense.date}</td>
                        <td className="px-4 py-3 text-sm">
                          {isAr ? expense.chaletNameAr : expense.chaletNameEn}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-cyan-600">
                          {expense.amount.toLocaleString()} {tc("sar")}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {expense.notes || "-"}
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDelete(expense.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
