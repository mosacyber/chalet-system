"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Save,
  Loader2,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  ExternalLink,
  Pencil,
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
  Eye,
  EyeOff,
  Star,
  Minus,
  Image,
} from "lucide-react";
import { toast } from "sonner";

interface LinkItemData {
  title: string;
  url: string;
  iconType: string;
  linkType: string;
  isActive: boolean;
  isFeatured: boolean;
  thumbnail: string;
}

// --- أنواع الأيقونات ---
const ICON_TYPES = [
  { value: "whatsapp", labelAr: "واتساب", labelEn: "WhatsApp" },
  { value: "instagram", labelAr: "انستقرام", labelEn: "Instagram" },
  { value: "x", labelAr: "X / تويتر", labelEn: "X / Twitter" },
  { value: "snapchat", labelAr: "سناب شات", labelEn: "Snapchat" },
  { value: "tiktok", labelAr: "تيك توك", labelEn: "TikTok" },
  { value: "youtube", labelAr: "يوتيوب", labelEn: "YouTube" },
  { value: "website", labelAr: "موقع إلكتروني", labelEn: "Website" },
  { value: "location", labelAr: "موقع على الخريطة", labelEn: "Map Location" },
  { value: "phone", labelAr: "هاتف", labelEn: "Phone" },
  { value: "email", labelAr: "بريد إلكتروني", labelEn: "Email" },
  { value: "link", labelAr: "رابط عام", labelEn: "General Link" },
];

// --- أنواع الروابط ---
const LINK_TYPES = [
  { value: "link", labelAr: "رابط عادي", labelEn: "Regular Link" },
  { value: "social", labelAr: "أيقونة اجتماعية", labelEn: "Social Icon" },
  { value: "header", labelAr: "عنوان فاصل", labelEn: "Section Header" },
];

// --- ألوان ---
const THEME_COLORS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b",
  "#ef4444", "#ec4899", "#06b6d4", "#84cc16",
  "#f97316", "#6366f1", "#14b8a6", "#e11d48",
];

// --- أنماط الخلفية ---
const BG_STYLES = [
  { value: "flat", labelAr: "لون ثابت", labelEn: "Flat Color" },
  { value: "gradient", labelAr: "تدرج لوني", labelEn: "Gradient" },
  { value: "animated", labelAr: "تدرج متحرك", labelEn: "Animated Gradient" },
  { value: "particles", labelAr: "جزيئات", labelEn: "Particles" },
];

// --- أنماط الأزرار ---
const BTN_STYLES = [
  { value: "rounded", labelAr: "دائري", labelEn: "Rounded" },
  { value: "pill", labelAr: "كبسولة", labelEn: "Pill" },
  { value: "sharp", labelAr: "حاد", labelEn: "Sharp" },
  { value: "outline", labelAr: "محدد", labelEn: "Outline" },
  { value: "shadow", labelAr: "بظل", labelEn: "Shadow" },
  { value: "glass", labelAr: "زجاجي", labelEn: "Glass" },
];

// --- الخطوط ---
const FONT_FAMILIES = [
  { value: "default", labelAr: "افتراضي", labelEn: "Default" },
  { value: "arabic", labelAr: "عربي كلاسيكي", labelEn: "Arabic Classic" },
  { value: "modern", labelAr: "عصري", labelEn: "Modern" },
  { value: "handwritten", labelAr: "خط يد", labelEn: "Handwritten" },
];

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

export default function LinksPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Page settings
  const [slug, setSlug] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [bio, setBio] = useState("");
  const [themeColor, setThemeColor] = useState("#10b981");
  const [backgroundStyle, setBackgroundStyle] = useState("flat");
  const [buttonStyle, setButtonStyle] = useState("rounded");
  const [fontFamily, setFontFamily] = useState("default");
  const [isPublished, setIsPublished] = useState(false);

  // Links
  const [links, setLinks] = useState<LinkItemData[]>([]);

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogUrl, setDialogUrl] = useState("");
  const [dialogIconType, setDialogIconType] = useState("link");
  const [dialogLinkType, setDialogLinkType] = useState("link");
  const [dialogThumbnail, setDialogThumbnail] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/links")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.slug) {
          setSlug(data.slug);
          setDisplayName(data.displayName || "");
          setSubtitle(data.subtitle || "");
          setBio(data.bio || "");
          setThemeColor(data.themeColor || "#10b981");
          setBackgroundStyle(data.backgroundStyle || "flat");
          setButtonStyle(data.buttonStyle || "rounded");
          setFontFamily(data.fontFamily || "default");
          setIsPublished(data.isPublished || false);
          if (data.links) {
            setLinks(
              data.links.map((l: LinkItemData) => ({
                title: l.title,
                url: l.url,
                iconType: l.iconType,
                linkType: l.linkType || "link",
                isActive: l.isActive,
                isFeatured: l.isFeatured || false,
                thumbnail: l.thumbnail || "",
              }))
            );
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!slug.trim()) {
      toast.error(isAr ? "الرابط المخصص مطلوب" : "Custom URL is required");
      return;
    }
    if (!displayName.trim()) {
      toast.error(isAr ? "الاسم المعروض مطلوب" : "Display name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/dashboard/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug.toLowerCase().trim(),
          displayName: displayName.trim(),
          subtitle: subtitle.trim(),
          bio: bio.trim(),
          themeColor,
          backgroundStyle,
          buttonStyle,
          fontFamily,
          isPublished,
          links,
        }),
      });
      if (res.ok) {
        toast.success(t("linksSaved"));
      } else if (res.status === 409) {
        toast.error(isAr ? "هذا الرابط مستخدم بالفعل" : "URL already taken");
      } else {
        toast.error(isAr ? "حدث خطأ" : "An error occurred");
      }
    } catch {
      toast.error(isAr ? "حدث خطأ" : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const openAddDialog = (type: string = "link") => {
    setEditingIndex(null);
    setDialogTitle("");
    setDialogUrl("");
    setDialogIconType("link");
    setDialogLinkType(type);
    setDialogThumbnail("");
    setDialogOpen(true);
  };

  const openEditDialog = (index: number) => {
    const link = links[index];
    setEditingIndex(index);
    setDialogTitle(link.title);
    setDialogUrl(link.url);
    setDialogIconType(link.iconType);
    setDialogLinkType(link.linkType);
    setDialogThumbnail(link.thumbnail || "");
    setDialogOpen(true);
  };

  const handleDialogSave = () => {
    if (!dialogTitle.trim()) {
      toast.error(isAr ? "العنوان مطلوب" : "Title is required");
      return;
    }
    if (dialogLinkType !== "header" && !dialogUrl.trim()) {
      toast.error(isAr ? "الرابط مطلوب" : "URL is required");
      return;
    }

    const newLink: LinkItemData = {
      title: dialogTitle.trim(),
      url: dialogLinkType === "header" ? "" : dialogUrl.trim(),
      iconType: dialogIconType,
      linkType: dialogLinkType,
      isActive: true,
      isFeatured: editingIndex !== null ? links[editingIndex].isFeatured : false,
      thumbnail: dialogThumbnail.trim(),
    };

    if (editingIndex !== null) {
      const updated = [...links];
      updated[editingIndex] = { ...updated[editingIndex], ...newLink, isActive: updated[editingIndex].isActive };
      setLinks(updated);
    } else {
      setLinks([...links, newLink]);
    }
    setDialogOpen(false);
  };

  const removeLink = (index: number) => setLinks(links.filter((_, i) => i !== index));

  const moveLink = (index: number, dir: "up" | "down") => {
    const ni = dir === "up" ? index - 1 : index + 1;
    if (ni < 0 || ni >= links.length) return;
    const u = [...links];
    [u[index], u[ni]] = [u[ni], u[index]];
    setLinks(u);
  };

  const toggleActive = (i: number) => {
    const u = [...links];
    u[i] = { ...u[i], isActive: !u[i].isActive };
    setLinks(u);
  };

  const toggleFeatured = (i: number) => {
    const u = [...links];
    u[i] = { ...u[i], isFeatured: !u[i].isFeatured };
    setLinks(u);
  };

  const copyPublicUrl = () => {
    if (!slug) return;
    navigator.clipboard.writeText(`${window.location.origin}/${locale}/links/${slug}`);
    toast.success(t("linksCopied"));
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("linksPageTitle")}</h1>
        {slug && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyPublicUrl}>
              <Copy className="h-4 w-4 me-1" />
              {t("linksCopyUrl")}
            </Button>
            <a href={`/${locale}/links/${slug}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 me-1" />
                {t("linksPreview")}
              </Button>
            </a>
          </div>
        )}
      </div>

      {/* === إعدادات الصفحة === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t("linksPageSettings")}
            <Badge variant={isPublished ? "default" : "secondary"}>
              {isPublished ? (isAr ? "منشورة" : "Published") : t("linksNotPublished")}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Slug */}
          <div className="space-y-2">
            <Label>{t("linksSlug")}</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground" dir="ltr">
                {typeof window !== "undefined" ? window.location.origin : ""}/{locale}/links/
              </span>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="my-chalet"
                dir="ltr"
                className="max-w-[200px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("linksDisplayName")}</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder={isAr ? "اسم الاستراحة" : "Resort name"} />
            </div>
            <div className="space-y-2">
              <Label>{isAr ? "العنوان الفرعي" : "Subtitle"}</Label>
              <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder={isAr ? "مثال: حجوزات واستفسارات" : "e.g., Bookings & Inquiries"} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("linksBio")}</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder={isAr ? "اكتب نبذة عن الاستراحة..." : "Write a short bio..."} rows={3} />
          </div>

          {/* Theme Color */}
          <div className="space-y-2">
            <Label>{t("linksThemeColor")}</Label>
            <div className="flex flex-wrap gap-2">
              {THEME_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setThemeColor(color)}
                  className="h-8 w-8 rounded-full border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: themeColor === color ? "currentColor" : "transparent",
                    transform: themeColor === color ? "scale(1.15)" : undefined,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Background Style */}
          <div className="space-y-2">
            <Label>{isAr ? "نمط الخلفية" : "Background Style"}</Label>
            <div className="flex flex-wrap gap-2">
              {BG_STYLES.map((s) => (
                <Button
                  key={s.value}
                  type="button"
                  variant={backgroundStyle === s.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBackgroundStyle(s.value)}
                >
                  {isAr ? s.labelAr : s.labelEn}
                </Button>
              ))}
            </div>
          </div>

          {/* Button Style */}
          <div className="space-y-2">
            <Label>{isAr ? "شكل الأزرار" : "Button Style"}</Label>
            <div className="flex flex-wrap gap-2">
              {BTN_STYLES.map((s) => (
                <Button
                  key={s.value}
                  type="button"
                  variant={buttonStyle === s.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setButtonStyle(s.value)}
                >
                  {isAr ? s.labelAr : s.labelEn}
                </Button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <Label>{isAr ? "نوع الخط" : "Font"}</Label>
            <div className="flex flex-wrap gap-2">
              {FONT_FAMILIES.map((f) => (
                <Button
                  key={f.value}
                  type="button"
                  variant={fontFamily === f.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFontFamily(f.value)}
                >
                  {isAr ? f.labelAr : f.labelEn}
                </Button>
              ))}
            </div>
          </div>

          {/* Publish */}
          <div className="flex items-center gap-3">
            <Button variant={isPublished ? "default" : "outline"} size="sm" onClick={() => setIsPublished(!isPublished)}>
              {isPublished ? <Eye className="h-4 w-4 me-1" /> : <EyeOff className="h-4 w-4 me-1" />}
              {t("linksPublished")}
            </Button>
            <span className="text-sm text-muted-foreground">
              {isPublished ? (isAr ? "الصفحة مرئية للجميع" : "Visible to everyone") : (isAr ? "الصفحة مخفية" : "Page is hidden")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* === إدارة الروابط === */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t("linksMyLinks")}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openAddDialog("social")}>
                <Instagram className="h-4 w-4 me-1" />
                {isAr ? "أيقونة اجتماعية" : "Social Icon"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => openAddDialog("header")}>
                <Minus className="h-4 w-4 me-1" />
                {isAr ? "عنوان فاصل" : "Header"}
              </Button>
              <Button size="sm" onClick={() => openAddDialog("link")}>
                <Plus className="h-4 w-4 me-1" />
                {t("linksAddLink")}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Link2 className="h-12 w-12 mb-3 opacity-50" />
              <p>{t("linksNoLinks")}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {links.map((link, index) => {
                const IconComp = getIconComponent(link.iconType);
                const isHeader = link.linkType === "header";
                const isSocial = link.linkType === "social";

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-all ${
                      !link.isActive ? "opacity-40" : ""
                    } ${link.isFeatured ? "ring-2 ring-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/20" : ""} ${
                      isHeader ? "bg-muted/50 border-dashed" : ""
                    }`}
                  >
                    {/* Badge */}
                    {isSocial && <Badge variant="secondary" className="text-[10px] px-1.5">{isAr ? "اجتماعي" : "Social"}</Badge>}
                    {isHeader && <Badge variant="outline" className="text-[10px] px-1.5">{isAr ? "فاصل" : "Header"}</Badge>}

                    {/* Icon */}
                    {!isHeader && (
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: themeColor }}
                      >
                        <IconComp className="h-5 w-5" />
                      </div>
                    )}
                    {isHeader && <Minus className="h-5 w-5 text-muted-foreground" />}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{link.title}</p>
                        {link.isFeatured && <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />}
                        {link.thumbnail && <Image className="h-3.5 w-3.5 text-muted-foreground" />}
                      </div>
                      {!isHeader && (
                        <p className="text-sm text-muted-foreground truncate" dir="ltr">{link.url}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5">
                      {!isHeader && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleFeatured(index)} title={isAr ? "مميز" : "Featured"}>
                          <Star className={`h-3.5 w-3.5 ${link.isFeatured ? "fill-yellow-400 text-yellow-400" : ""}`} />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleActive(index)}>
                        {link.isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveLink(index, "up")} disabled={index === 0}>
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveLink(index, "down")} disabled={index === links.length - 1}>
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(index)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeLink(index)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save */}
      <Button onClick={handleSave} disabled={saving} className="gap-2" size="lg">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {isAr ? "حفظ التغييرات" : "Save Changes"}
      </Button>

      {/* === Dialog إضافة/تعديل رابط === */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? t("linksEditLink") : t("linksAddLink")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Link Type */}
            <div className="space-y-2">
              <Label>{isAr ? "نوع العنصر" : "Item Type"}</Label>
              <Select value={dialogLinkType} onValueChange={setDialogLinkType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LINK_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{isAr ? t.labelAr : t.labelEn}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Icon Type - for link and social */}
            {dialogLinkType !== "header" && (
              <div className="space-y-2">
                <Label>{t("linksIconType")}</Label>
                <Select value={dialogIconType} onValueChange={setDialogIconType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ICON_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>{isAr ? type.labelAr : type.labelEn}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label>{dialogLinkType === "header" ? (isAr ? "عنوان القسم" : "Section Title") : t("linksTitle")}</Label>
              <Input
                value={dialogTitle}
                onChange={(e) => setDialogTitle(e.target.value)}
                placeholder={dialogLinkType === "header" ? (isAr ? "مثال: وسائل التواصل" : "e.g., Social Media") : (isAr ? "مثال: واتساب الحجوزات" : "e.g., Booking WhatsApp")}
              />
            </div>

            {/* URL - not for headers */}
            {dialogLinkType !== "header" && (
              <div className="space-y-2">
                <Label>{t("linksUrl")}</Label>
                <Input
                  value={dialogUrl}
                  onChange={(e) => setDialogUrl(e.target.value)}
                  placeholder={
                    dialogIconType === "location" ? "https://maps.google.com/..." :
                    dialogIconType === "whatsapp" ? "https://wa.me/966500000000" :
                    dialogIconType === "phone" ? "tel:+966500000000" :
                    dialogIconType === "email" ? "mailto:info@example.com" :
                    "https://..."
                  }
                  dir="ltr"
                />
              </div>
            )}

            {/* Thumbnail - only for regular links */}
            {dialogLinkType === "link" && (
              <div className="space-y-2">
                <Label>{isAr ? "صورة مصغرة (اختياري)" : "Thumbnail (optional)"}</Label>
                <Input
                  value={dialogThumbnail}
                  onChange={(e) => setDialogThumbnail(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  dir="ltr"
                />
              </div>
            )}

            <Button onClick={handleDialogSave} className="w-full">
              {editingIndex !== null ? (isAr ? "تحديث" : "Update") : (isAr ? "إضافة" : "Add")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
