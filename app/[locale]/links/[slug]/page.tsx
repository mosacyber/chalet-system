"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import {
  Loader2,
  Link2,
  Globe,
  MessageCircle,
  Instagram,
  Twitter,
  Youtube,
  Music,
  MapPin,
  Phone,
  Mail,
  Ghost,
  Building,
} from "lucide-react";

interface LinkData {
  title: string;
  url: string;
  iconType: string;
}

interface PageData {
  displayName: string;
  bio: string | null;
  themeColor: string;
  links: LinkData[];
}

function getIconComponent(iconType: string) {
  switch (iconType) {
    case "whatsapp":
      return MessageCircle;
    case "instagram":
      return Instagram;
    case "x":
      return Twitter;
    case "snapchat":
      return Ghost;
    case "tiktok":
      return Music;
    case "youtube":
      return Youtube;
    case "website":
      return Globe;
    case "location":
      return MapPin;
    case "phone":
      return Phone;
    case "email":
      return Mail;
    default:
      return Link2;
  }
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 16, g: 185, b: 129 };
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

export default function PublicLinksPage() {
  const locale = useLocale();
  const isAr = locale === "ar";
  const params = useParams();
  const slug = params.slug as string;

  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/links/${slug}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setPageData(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (notFound || !pageData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <Link2 className="h-16 w-16 mb-4 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-600 dark:text-gray-400">
          {isAr ? "الصفحة غير موجودة" : "Page Not Found"}
        </h1>
        <p className="mt-2 text-gray-400">
          {isAr
            ? "هذا الرابط غير متاح أو تم حذفه"
            : "This link is not available or has been removed"}
        </p>
      </div>
    );
  }

  const rgb = hexToRgb(pageData.themeColor);

  return (
    <div
      className="flex min-h-screen flex-col items-center px-4 py-12"
      style={{
        background: `linear-gradient(135deg, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15) 0%, rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05) 50%, rgba(255,255,255,0.95) 100%)`,
      }}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Profile Section */}
      <div className="flex flex-col items-center text-center mb-8">
        {/* Avatar */}
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full text-white text-3xl font-bold mb-4 shadow-lg"
          style={{ backgroundColor: pageData.themeColor }}
        >
          {pageData.displayName.charAt(0)}
        </div>

        {/* Name */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {pageData.displayName}
        </h1>

        {/* Bio */}
        {pageData.bio && (
          <p className="mt-2 max-w-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {pageData.bio}
          </p>
        )}
      </div>

      {/* Links */}
      <div className="w-full max-w-md space-y-3">
        {pageData.links.map((link, index) => {
          const IconComp = getIconComponent(link.iconType);
          return (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm transition-all hover:shadow-md hover:scale-[1.02] dark:border-gray-700 dark:bg-gray-800"
              style={{
                borderColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
              }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                style={{ backgroundColor: pageData.themeColor }}
              >
                <IconComp className="h-5 w-5" />
              </div>
              <span className="flex-1 font-medium text-gray-800 dark:text-gray-200">
                {link.title}
              </span>
              <svg
                className="h-4 w-4 text-gray-400 rtl:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-12 flex items-center gap-2 text-sm text-gray-400">
        <Building className="h-4 w-4" />
        <a
          href={`/${locale}`}
          className="hover:text-gray-600 transition-colors"
        >
          {isAr ? "مدعوم من شاليهات الراحة" : "Powered by Al-Raha Chalets"}
        </a>
      </div>
    </div>
  );
}
