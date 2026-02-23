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
  linkType: string;
  isFeatured: boolean;
  thumbnail: string | null;
}

interface PageData {
  displayName: string;
  subtitle: string | null;
  bio: string | null;
  themeColor: string;
  backgroundStyle: string;
  buttonStyle: string;
  fontFamily: string;
  links: LinkData[];
}

function getIconComponent(iconType: string) {
  switch (iconType) {
    case "whatsapp": return MessageCircle;
    case "instagram": return Instagram;
    case "x": return Twitter;
    case "snapchat": return Ghost;
    case "tiktok": return Music;
    case "youtube": return Youtube;
    case "website": return Globe;
    case "location": return MapPin;
    case "phone": return Phone;
    case "email": return Mail;
    default: return Link2;
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

function getBackgroundCSS(style: string, rgb: { r: number; g: number; b: number }) {
  const c = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  switch (style) {
    case "gradient":
      return { background: `linear-gradient(135deg, rgba(${c}, 0.25) 0%, rgba(${c}, 0.08) 40%, #f8fafc 100%)` };
    case "animated":
      return { background: `linear-gradient(135deg, rgba(${c}, 0.2) 0%, rgba(${c}, 0.05) 50%, #f8fafc 100%)` };
    case "particles":
      return { background: `radial-gradient(circle at 20% 20%, rgba(${c}, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(${c}, 0.1) 0%, transparent 50%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)` };
    default:
      return { background: `linear-gradient(180deg, rgba(${c}, 0.08) 0%, #f8fafc 100%)` };
  }
}

function getButtonClasses(style: string, rgb: { r: number; g: number; b: number }, isFeatured: boolean) {
  const c = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  const base = "flex items-center gap-3 w-full px-5 py-4 transition-all duration-300 hover:scale-[1.02]";
  const featured = isFeatured ? "ring-2 ring-offset-2 py-5" : "";

  switch (style) {
    case "pill":
      return { className: `${base} ${featured} rounded-full bg-white border border-gray-200 hover:shadow-lg`, style: { borderColor: `rgba(${c}, 0.2)`, ...(isFeatured && { ringColor: `rgba(${c}, 0.5)` }) } };
    case "sharp":
      return { className: `${base} ${featured} rounded-none bg-white border border-gray-200 hover:shadow-lg`, style: { borderColor: `rgba(${c}, 0.2)` } };
    case "outline":
      return { className: `${base} ${featured} rounded-xl border-2 hover:shadow-lg`, style: { borderColor: `rgb(${c})`, backgroundColor: "transparent" } };
    case "shadow":
      return { className: `${base} ${featured} rounded-xl bg-white shadow-md hover:shadow-xl border-0`, style: {} };
    case "glass":
      return { className: `${base} ${featured} rounded-xl border border-white/30 hover:shadow-lg backdrop-blur-sm`, style: { backgroundColor: `rgba(255, 255, 255, 0.6)` } };
    default: // rounded
      return { className: `${base} ${featured} rounded-xl bg-white border border-gray-200 hover:shadow-md`, style: { borderColor: `rgba(${c}, 0.2)` } };
  }
}

function getFontClass(font: string) {
  switch (font) {
    case "arabic": return "font-serif";
    case "modern": return "font-mono";
    case "handwritten": return "";
    default: return "font-sans";
  }
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
        if (!res.ok) { setNotFound(true); return null; }
        return res.json();
      })
      .then((data) => { if (data) setPageData(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (notFound || !pageData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <Link2 className="h-16 w-16 mb-4 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-600">{isAr ? "الصفحة غير موجودة" : "Page Not Found"}</h1>
        <p className="mt-2 text-gray-400">{isAr ? "هذا الرابط غير متاح أو تم حذفه" : "This link is not available or has been removed"}</p>
      </div>
    );
  }

  const rgb = hexToRgb(pageData.themeColor);
  const bgCSS = getBackgroundCSS(pageData.backgroundStyle, rgb);
  const fontClass = getFontClass(pageData.fontFamily);

  // Separate link types
  const socialLinks = pageData.links.filter((l) => l.linkType === "social");
  const regularAndHeaders = pageData.links.filter((l) => l.linkType !== "social");

  return (
    <div
      className={`flex min-h-screen flex-col items-center px-4 py-12 ${fontClass} ${pageData.backgroundStyle === "animated" ? "animate-gradient-bg" : ""}`}
      style={bgCSS}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Animated gradient CSS */}
      {pageData.backgroundStyle === "animated" && (
        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient-bg {
            background-size: 200% 200% !important;
            animation: gradientShift 8s ease infinite;
          }
        `}</style>
      )}

      {/* === Profile === */}
      <div className="flex flex-col items-center text-center mb-8">
        <div
          className="flex h-24 w-24 items-center justify-center rounded-full text-white text-4xl font-bold mb-4 shadow-xl ring-4 ring-white/50"
          style={{ backgroundColor: pageData.themeColor }}
        >
          {pageData.displayName.charAt(0)}
        </div>

        <h1 className="text-2xl font-bold text-gray-900">{pageData.displayName}</h1>

        {pageData.subtitle && (
          <p className="mt-1 text-sm font-medium" style={{ color: pageData.themeColor }}>
            {pageData.subtitle}
          </p>
        )}

        {pageData.bio && (
          <p className="mt-2 max-w-sm text-gray-600 leading-relaxed text-sm">{pageData.bio}</p>
        )}
      </div>

      {/* === Social Icons Bar === */}
      {socialLinks.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {socialLinks.map((link, i) => {
            const IconComp = getIconComponent(link.iconType);
            return (
              <a
                key={`social-${i}`}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg"
                style={{ backgroundColor: pageData.themeColor }}
                title={link.title}
              >
                <IconComp className="h-5 w-5" />
              </a>
            );
          })}
        </div>
      )}

      {/* === Links === */}
      <div className="w-full max-w-md space-y-3">
        {regularAndHeaders.map((link, index) => {
          // --- Header / Divider ---
          if (link.linkType === "header") {
            return (
              <div key={`h-${index}`} className="flex items-center gap-3 py-3">
                <div className="h-px flex-1" style={{ backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` }} />
                <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">{link.title}</span>
                <div className="h-px flex-1" style={{ backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)` }} />
              </div>
            );
          }

          // --- Regular Link ---
          const IconComp = getIconComponent(link.iconType);
          const btnProps = getButtonClasses(pageData.buttonStyle, rgb, link.isFeatured);

          return (
            <a
              key={`l-${index}`}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={btnProps.className}
              style={btnProps.style}
            >
              {/* Thumbnail or Icon */}
              {link.thumbnail ? (
                <img
                  src={link.thumbnail}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: pageData.themeColor }}
                >
                  <IconComp className="h-5 w-5" />
                </div>
              )}

              {/* Title */}
              <span className={`flex-1 font-medium text-gray-800 ${link.isFeatured ? "text-base" : "text-sm"}`}>
                {link.title}
              </span>

              {/* Arrow */}
              <svg className="h-4 w-4 text-gray-400 rtl:rotate-180 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          );
        })}
      </div>

      {/* === Map Embed === */}
      {regularAndHeaders.filter((l) => l.iconType === "location" && l.url).map((link, i) => {
        // Extract Google Maps embed URL
        const mapUrl = link.url.includes("maps.google") || link.url.includes("goo.gl") || link.url.includes("google.com/maps")
          ? `https://maps.google.com/maps?q=${encodeURIComponent(link.url)}&output=embed`
          : null;

        if (!mapUrl) return null;

        return (
          <div key={`map-${i}`} className="w-full max-w-md mt-6 rounded-xl overflow-hidden shadow-md">
            <iframe
              src={mapUrl}
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={link.title}
            />
          </div>
        );
      })}

      {/* === Footer === */}
      <div className="mt-12 flex items-center gap-2 text-xs text-gray-400">
        <Building className="h-3.5 w-3.5" />
        <a href={`/${locale}`} className="hover:text-gray-600 transition-colors">
          {isAr ? "مدعوم من شاليهات الراحة" : "Powered by Al-Raha Chalets"}
        </a>
      </div>
    </div>
  );
}
