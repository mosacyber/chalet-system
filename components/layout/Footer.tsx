import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Building, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2 text-lg font-bold"
            >
              <Building className="h-5 w-5" />
              {t("common.siteName")}
            </Link>
            <p className="text-sm text-muted-foreground">
              {t("common.siteDescription")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t("footer.quickLinks")}</h3>
            <nav className="flex flex-col gap-2">
              <Link
                href={`/${locale}`}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {t("common.home")}
              </Link>
              <Link
                href={`/${locale}/chalets`}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {t("common.chalets")}
              </Link>
              <Link
                href={`/${locale}/about`}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {t("common.about")}
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {t("common.contact")}
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              {t("footer.contactInfo")}
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span dir="ltr">{t("footer.phone")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{t("footer.email")}</span>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">
              {t("contact.workingHours")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("contact.allDay")}
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          &copy; {year} {t("common.siteName")}. {t("footer.rights")}.
        </div>
      </div>
    </footer>
  );
}
