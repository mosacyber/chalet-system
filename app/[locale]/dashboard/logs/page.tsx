"use client";

import { useEffect, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  RefreshCw,
  Trash2,
  AlertCircle,
  AlertTriangle,
  Info,
  Database,
  Filter,
} from "lucide-react";

interface LogEntry {
  id: number;
  timestamp: string;
  level: "info" | "warn" | "error";
  source: string;
  message: string;
}

interface HealthStatus {
  app: string;
  database: string;
  dbError?: string;
  userCount?: number;
  uptime: number;
  timestamp: string;
}

export default function LogsPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const [logsRes, healthRes] = await Promise.all([
        fetch(`/api/logs${filter !== "all" ? `?level=${filter}` : ""}`),
        fetch("/api/health"),
      ]);
      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data.logs || []);
      }
      const healthData = await healthRes.json();
      setHealth(healthData);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const clearLogs = async () => {
    await fetch("/api/logs", { method: "DELETE" });
    fetchLogs();
  };

  const levelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warn":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const levelBg = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-500/10 border-red-500/20";
      case "warn":
        return "bg-yellow-500/10 border-yellow-500/20";
      default:
        return "bg-muted/50 border-border";
    }
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const errorCount = logs.filter((l) => l.level === "error").length;
  const warnCount = logs.filter((l) => l.level === "warn").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isAr ? "سجل النظام" : "System Logs"}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw
              className={`h-4 w-4 me-1 ${autoRefresh ? "animate-spin" : ""}`}
            />
            {isAr ? "تحديث تلقائي" : "Auto Refresh"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 me-1 ${loading ? "animate-spin" : ""}`} />
            {isAr ? "تحديث" : "Refresh"}
          </Button>
          <Button variant="destructive" size="sm" onClick={clearLogs}>
            <Trash2 className="h-4 w-4 me-1" />
            {isAr ? "مسح" : "Clear"}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Database
                className={`h-8 w-8 ${
                  health?.database === "ok"
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              />
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAr ? "قاعدة البيانات" : "Database"}
                </p>
                <p className="text-lg font-bold">
                  {health?.database === "ok"
                    ? isAr
                      ? "متصلة"
                      : "Connected"
                    : isAr
                      ? "غير متصلة"
                      : "Disconnected"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAr ? "أخطاء" : "Errors"}
                </p>
                <p className="text-lg font-bold">{errorCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAr ? "تحذيرات" : "Warnings"}
                </p>
                <p className="text-lg font-bold">{warnCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Info className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {isAr ? "وقت التشغيل" : "Uptime"}
                </p>
                <p className="text-lg font-bold">
                  {health ? formatUptime(health.uptime) : "--"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DB Error Banner */}
      {health?.database === "error" && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-bold text-red-600">
                  {isAr
                    ? "قاعدة البيانات غير متصلة!"
                    : "Database is not connected!"}
                </p>
                <p className="text-sm text-red-500/80 mt-1 font-mono break-all">
                  {health.dbError}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              {isAr ? "السجلات" : "Logs"}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({logs.length})
              </span>
            </CardTitle>
            <div className="flex gap-1">
              {["all", "error", "warn", "info"].map((level) => (
                <Button
                  key={level}
                  variant={filter === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(level)}
                  className="text-xs"
                >
                  {level === "all"
                    ? isAr
                      ? "الكل"
                      : "All"
                    : level.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              {isAr ? "لا توجد سجلات" : "No logs found"}
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${levelBg(
                    log.level
                  )}`}
                >
                  <div className="mt-0.5">{levelIcon(log.level)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono font-bold">
                        {log.source}
                      </span>
                      <span className="text-xs text-muted-foreground" dir="ltr">
                        {new Date(log.timestamp).toLocaleTimeString("en-US", {
                          hour12: false,
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm font-mono break-all whitespace-pre-wrap">
                      {log.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
