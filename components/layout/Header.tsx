"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Globe, Home, Building, Info, Phone, User, LayoutDashboard, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const t = useTranslations("common");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const role = (session?.user as { role?: string })?.role;
  const hasDashboard = role === "ADMIN" || role === "OWNER";
  const { theme, setTheme } = useTheme();

  const navLinks = [
    { href: `/${locale}`, label: t("home"), icon: Home },
    { href: `/${locale}/chalets`, label: t("chalets"), icon: Building },
    { href: `/${locale}/about`, label: t("about"), icon: Info },
    { href: `/${locale}/contact`, label: t("contact"), icon: Phone },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 text-xl font-bold text-primary"
        >
          <Building className="h-6 w-6" />
          <span className="truncate">{t("siteName")}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>
          <LanguageSwitcher />
          {isLoggedIn ? (
            <>
              {hasDashboard && (
                <Link href={`/${locale}/dashboard`}>
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    <LayoutDashboard className="h-4 w-4" />
                    {t("dashboard")}
                  </Button>
                </Link>
              )}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">
                  {session?.user?.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: `/${locale}` })}
              >
                <LogOut className="h-4 w-4" />
                {t("logout")}
              </Button>
            </>
          ) : (
            <>
              <Link href={`/${locale}/auth/login`}>
                <Button variant="ghost" size="sm">
                  {t("login")}
                </Button>
              </Link>
              <Link href={`/${locale}/auth/register`}>
                <Button size="sm">{t("register")}</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side={locale === "ar" ? "right" : "left"} className="w-[280px] sm:w-72">
            <div className="flex flex-col gap-4 pt-8">
              <Link
                href={`/${locale}`}
                className="flex items-center gap-2 text-lg font-bold text-primary"
                onClick={() => setOpen(false)}
              >
                <Building className="h-5 w-5" />
                {t("siteName")}
              </Link>

              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent"
                    onClick={() => setOpen(false)}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="border-t pt-4">
                {isLoggedIn ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 px-3 py-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">
                        {session?.user?.name}
                      </span>
                    </div>
                    {hasDashboard && (
                      <Link
                        href={`/${locale}/dashboard`}
                        onClick={() => setOpen(false)}
                      >
                        <Button variant="outline" className="w-full gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          {t("dashboard")}
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      className="w-full gap-2 text-destructive"
                      onClick={() => {
                        setOpen(false);
                        signOut({ callbackUrl: `/${locale}` });
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      {t("logout")}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/${locale}/auth/login`}
                      onClick={() => setOpen(false)}
                    >
                      <Button variant="outline" className="w-full">
                        {t("login")}
                      </Button>
                    </Link>
                    <Link
                      href={`/${locale}/auth/register`}
                      onClick={() => setOpen(false)}
                    >
                      <Button className="w-full">{t("register")}</Button>
                    </Link>
                  </div>
                )}
              </div>

              <div className="border-t pt-4 flex items-center gap-3">
                <LanguageSwitcher />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="h-9 w-9"
                >
                  <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
