"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  LayoutDashboard,
  Building,
  CalendarDays,
  CalendarCheck,
  Users,
  Star,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Menu,
  Droplets,
  Eye,
  Link2,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function DashboardShell({
  children,
  role,
}: {
  children: React.ReactNode;
  role?: string;
}) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const locale = useLocale();
  const isAr = locale === "ar";
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  const adminNavItems = [
    { href: `/${locale}/dashboard`, label: t("overview"), icon: LayoutDashboard },
    { href: `/${locale}/dashboard/chalets`, label: t("manageChalets"), icon: Building },
    { href: `/${locale}/dashboard/calendar`, label: t("manageCalendar"), icon: CalendarCheck },
    { href: `/${locale}/dashboard/water`, label: isAr ? "وايت الماء" : "Water Tanker", icon: Droplets },
    { href: `/${locale}/dashboard/bookings`, label: t("manageBookings"), icon: CalendarDays },
    { href: `/${locale}/dashboard/links`, label: t("myLinks"), icon: Link2 },
    { href: `/${locale}/dashboard/marketing`, label: t("marketing"), icon: Megaphone },
    { href: `/${locale}/dashboard/customers`, label: t("manageCustomers"), icon: Users },
    { href: `/${locale}/dashboard/reviews`, label: t("manageReviews"), icon: Star },
    { href: `/${locale}/dashboard/visits`, label: isAr ? "الزيارات" : "Visits", icon: Eye },
    { href: `/${locale}/dashboard/reports`, label: t("reports"), icon: BarChart3 },
    { href: `/${locale}/dashboard/notifications`, label: t("notifications"), icon: Bell },
    { href: `/${locale}/dashboard/settings`, label: t("settings"), icon: Settings },
  ];

  const ownerNavItems = [
    { href: `/${locale}/dashboard`, label: t("overview"), icon: LayoutDashboard },
    { href: `/${locale}/dashboard/chalets`, label: t("myChalets"), icon: Building },
    { href: `/${locale}/dashboard/calendar`, label: t("manageCalendar"), icon: CalendarCheck },
    { href: `/${locale}/dashboard/water`, label: isAr ? "وايت الماء" : "Water Tanker", icon: Droplets },
    { href: `/${locale}/dashboard/bookings`, label: t("myBookings"), icon: CalendarDays },
    { href: `/${locale}/dashboard/links`, label: t("myLinks"), icon: Link2 },
    { href: `/${locale}/dashboard/marketing`, label: t("marketing"), icon: Megaphone },
    { href: `/${locale}/dashboard/settings`, label: t("settings"), icon: Settings },
  ];

  const navItems = role === "ADMIN" ? adminNavItems : ownerNavItems;

  const isActive = (href: string) => pathname === href || (href !== `/${locale}/dashboard` && pathname.startsWith(href + "/"));

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4">
        <Link
          href={`/${locale}/dashboard`}
          className="flex items-center gap-2 text-lg font-bold"
        >
          <Building className="h-5 w-5 text-primary" />
          {t("title")}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t p-3">
        <Link href={`/${locale}`}>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground">
            <LogOut className="h-4 w-4" />
            {tc("home")}
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-e bg-card lg:block">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 lg:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={locale === "ar" ? "right" : "left"} className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-3 ms-auto">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-0.5 -end-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                3
              </span>
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {(session?.user?.name || "U").charAt(0)}
                </span>
              </div>
              <span className="hidden text-sm font-medium sm:block">
                {session?.user?.name || (role === "ADMIN" ? "Admin" : "Owner")}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
