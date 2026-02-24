"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Save,
  Megaphone,
  Phone,
  QrCode,
  Wifi,
  WifiOff,
  RefreshCw,
  Unplug,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface WhatsAppData {
  id: string;
  phone: string;
  instanceId: string | null;
  status: string;
  lastConnectedAt: string | null;
}

export default function MarketingPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [phone, setPhone] = useState("");
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [status, setStatus] = useState<string>("disconnected");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [lastConnected, setLastConnected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // جلب البيانات
  useEffect(() => {
    fetch("/api/dashboard/marketing")
      .then(async (res) => {
        const data = await res.json();
        if (data && !data.error) {
          setPhone(data.phone || "");
          setPhoneSaved(!!data.phone);
          setStatus(data.status || "disconnected");
          setLastConnected(data.lastConnectedAt || null);
        } else if (data?.error) {
          setError(`API: ${data.error}`);
        }
      })
      .catch((err) => {
        setError(`Load: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, []);

  // Polling لتحديث الحالة عند انتظار المسح
  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard/marketing/connect");
      const data = await res.json();
      if (data.status === "connected") {
        setStatus("connected");
        setQrCode(null);
        setLastConnected(new Date().toISOString());
        toast.success(isAr ? "تم الاتصال بنجاح!" : "Connected successfully!");
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }
    } catch {
      // silent
    }
  }, [isAr]);

  useEffect(() => {
    if (status === "qr_pending" && qrCode) {
      pollingRef.current = setInterval(checkStatus, 3000);
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [status, qrCode, checkStatus]);

  // حفظ الرقم
  const handleSavePhone = async () => {
    if (!phone.trim()) {
      toast.error(t("marketingPhoneRequired"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      if (res.ok) {
        setPhoneSaved(true);
        toast.success(t("marketingPhoneSaved"));
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || (isAr ? "حدث خطأ" : "An error occurred"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : (isAr ? "حدث خطأ في الاتصال" : "Connection error"));
    } finally {
      setSaving(false);
    }
  };

  // ربط واتساب
  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/marketing/connect", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.qrCode) {
        setQrCode(data.qrCode);
        setStatus("qr_pending");
      } else {
        setError(data.error || (isAr ? "فشل الاتصال بـ OpenClaw" : "Failed to connect to OpenClaw"));
      }
    } catch {
      setError(isAr ? "فشل الاتصال بالخادم" : "Failed to connect to server");
    } finally {
      setConnecting(false);
    }
  };

  // فصل الاتصال
  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await fetch("/api/dashboard/marketing/connect", { method: "DELETE" });
      setStatus("disconnected");
      setQrCode(null);
      setLastConnected(null);
      toast.success(isAr ? "تم فصل الاتصال" : "Disconnected successfully");
    } catch {
      toast.error(isAr ? "حدث خطأ" : "An error occurred");
    } finally {
      setDisconnecting(false);
    }
  };

  // تحديث الحالة يدوي
  const handleRefresh = async () => {
    setRefreshing(true);
    await checkStatus();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Megaphone className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">{t("marketingTitle")}</h1>
      </div>

      {/* === Card: إعداد واتساب === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            {t("marketingSetup")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* رقم الهاتف */}
          <div className="space-y-2">
            <Label>{t("marketingWhatsappPhone")}</Label>
            <div className="flex gap-2">
              <Input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setPhoneSaved(false);
                }}
                placeholder={t("marketingWhatsappPhonePlaceholder")}
                dir="ltr"
                className="max-w-xs"
              />
              <Button onClick={handleSavePhone} disabled={saving || (phoneSaved && phone.trim() !== "")}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 me-1" />}
                {t("marketingSavePhone")}
              </Button>
            </div>
            {phoneSaved && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t("marketingPhoneSaved")}
              </p>
            )}
          </div>

          {/* حالة الاتصال */}
          <div className="flex items-center gap-3">
            <Label>{t("marketingStatus")}:</Label>
            {status === "connected" ? (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 gap-1">
                <Wifi className="h-3 w-3" />
                {t("marketingConnected")}
              </Badge>
            ) : status === "qr_pending" ? (
              <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 gap-1">
                <QrCode className="h-3 w-3" />
                {t("marketingWaiting")}
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <WifiOff className="h-3 w-3" />
                {t("marketingDisconnected")}
              </Badge>
            )}
          </div>

          {/* أزرار الاتصال */}
          {status === "disconnected" && phoneSaved && (
            <Button onClick={handleConnect} disabled={connecting} className="gap-2">
              {connecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Phone className="h-4 w-4" />
              )}
              {t("marketingConnect")}
            </Button>
          )}

          {/* رسالة خطأ */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* === Card: QR Code === */}
      {status === "qr_pending" && qrCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              {t("marketingQrTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("marketingQrDesc")}
            </p>

            {/* QR Code Image */}
            <div className="flex justify-center">
              <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-white p-6 shadow-sm">
                <img
                  src={qrCode.startsWith("data:") ? qrCode : `data:image/png;base64,${qrCode}`}
                  alt="WhatsApp QR Code"
                  className="h-64 w-64"
                />
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {t("marketingRefresh")}
              </Button>
              <Button variant="destructive" onClick={handleDisconnect} disabled={disconnecting} className="gap-2">
                {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unplug className="h-4 w-4" />}
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
            </div>

            {/* تنبيه */}
            <div className="rounded-lg bg-muted/50 p-3 text-center text-xs text-muted-foreground">
              {isAr
                ? "الباركود ينتهي خلال دقائق. إذا انتهى اضغط \"ربط واتساب\" مجدداً."
                : "QR code expires in minutes. If expired, click \"Connect WhatsApp\" again."}
            </div>
          </CardContent>
        </Card>
      )}

      {/* === Card: متصل === */}
      {status === "connected" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-5 w-5" />
              {t("marketingConnectedDesc")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">{t("marketingWhatsappPhone")}</p>
                <p className="mt-1 font-medium" dir="ltr">{phone}</p>
              </div>
              {lastConnected && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">{t("marketingLastConnected")}</p>
                  <p className="mt-1 font-medium">
                    {new Date(lastConnected).toLocaleDateString(isAr ? "ar-SA" : "en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                {t("marketingRefresh")}
              </Button>
              <Button variant="destructive" onClick={handleDisconnect} disabled={disconnecting} className="gap-2">
                {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unplug className="h-4 w-4" />}
                {t("marketingDisconnect")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
