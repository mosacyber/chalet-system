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
} from "lucide-react";
import { toast } from "sonner";

interface LinkItemData {
  id?: string;
  title: string;
  url: string;
  iconType: string;
  isActive: boolean;
}

const ICON_TYPES = [
  { value: "whatsapp", labelAr: "واتساب", labelEn: "WhatsApp" },
  { value: "instagram", labelAr: "انستقرام", labelEn: "Instagram" },
  { value: "x", labelAr: "X / تويتر", labelEn: "X / Twitter" },
  { value: "snapchat", labelAr: "سناب شات", labelEn: "Snapchat" },
  { value: "tiktok", labelAr: "تيك توك", labelEn: "TikTok" },
  { value: "youtube", labelAr: "يوتيوب", labelEn: "YouTube" },
  { value: "website", labelAr: "موقع إلكتروني", labelEn: "Website" },
  { value: "location", labelAr: "الموقع على الخريطة", labelEn: "Location" },
  { value: "phone", labelAr: "هاتف", labelEn: "Phone" },
  { value: "email", labelAr: "بريد إلكتروني", labelEn: "Email" },
  { value: "link", labelAr: "رابط عام", labelEn: "General Link" },
];

const THEME_COLORS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

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

export default function LinksPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const isAr = locale === "ar";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Page settings
  const [slug, setSlug] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [themeColor, setThemeColor] = useState("#10b981");
  const [isPublished, setIsPublished] = useState(false);

  // Links
  const [links, setLinks] = useState<LinkItemData[]>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogUrl, setDialogUrl] = useState("");
  const [dialogIconType, setDialogIconType] = useState("link");

  // Load data
  useEffect(() => {
    fetch("/api/dashboard/links")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.slug) {
          setSlug(data.slug);
          setDisplayName(data.displayName || "");
          setBio(data.bio || "");
          setThemeColor(data.themeColor || "#10b981");
          setIsPublished(data.isPublished || false);
          if (data.links) {
            setLinks(
              data.links.map((l: LinkItemData) => ({
                title: l.title,
                url: l.url,
                iconType: l.iconType,
                isActive: l.isActive,
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
          bio: bio.trim(),
          themeColor,
          isPublished,
          links,
        }),
      });

      if (res.ok) {
        toast.success(t("linksSaved"));
      } else {
        const err = await res.json();
        if (res.status === 409) {
          toast.error(
            isAr
              ? "هذا الرابط مستخدم بالفعل، اختر رابطاً آخر"
              : "This URL is already taken, choose another one"
          );
        } else {
          toast.error(err.error || (isAr ? "حدث خطأ" : "An error occurred"));
        }
      }
    } catch {
      toast.error(isAr ? "حدث خطأ" : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const openAddDialog = () => {
    setEditingIndex(null);
    setDialogTitle("");
    setDialogUrl("");
    setDialogIconType("link");
    setDialogOpen(true);
  };

  const openEditDialog = (index: number) => {
    const link = links[index];
    setEditingIndex(index);
    setDialogTitle(link.title);
    setDialogUrl(link.url);
    setDialogIconType(link.iconType);
    setDialogOpen(true);
  };

  const handleDialogSave = () => {
    if (!dialogTitle.trim() || !dialogUrl.trim()) {
      toast.error(
        isAr ? "العنوان والرابط مطلوبان" : "Title and URL are required"
      );
      return;
    }

    const newLink: LinkItemData = {
      title: dialogTitle.trim(),
      url: dialogUrl.trim(),
      iconType: dialogIconType,
      isActive: true,
    };

    if (editingIndex !== null) {
      const updated = [...links];
      updated[editingIndex] = {
        ...updated[editingIndex],
        title: newLink.title,
        url: newLink.url,
        iconType: newLink.iconType,
      };
      setLinks(updated);
    } else {
      setLinks([...links, newLink]);
    }

    setDialogOpen(false);
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const moveLink = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= links.length) return;
    const updated = [...links];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setLinks(updated);
  };

  const toggleLinkActive = (index: number) => {
    const updated = [...links];
    updated[index] = { ...updated[index], isActive: !updated[index].isActive };
    setLinks(updated);
  };

  const copyPublicUrl = () => {
    if (!slug) return;
    const url = `${window.location.origin}/${locale}/links/${slug}`;
    navigator.clipboard.writeText(url);
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("linksPageTitle")}</h1>
        {slug && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyPublicUrl}>
              <Copy className="h-4 w-4 me-1" />
              {t("linksCopyUrl")}
            </Button>
            <a
              href={`/${locale}/links/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 me-1" />
                {t("linksPreview")}
              </Button>
            </a>
          </div>
        )}
      </div>

      {/* Page Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t("linksPageSettings")}
            <Badge variant={isPublished ? "default" : "secondary"}>
              {isPublished
                ? isAr
                  ? "منشورة"
                  : "Published"
                : t("linksNotPublished")}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Slug */}
          <div className="space-y-2">
            <Label>{t("linksSlug")}</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground" dir="ltr">
                {typeof window !== "undefined" ? window.location.origin : ""}/
                {locale}/links/
              </span>
              <Input
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "")
                  )
                }
                placeholder="my-chalet"
                dir="ltr"
                className="max-w-[200px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Display Name */}
            <div className="space-y-2">
              <Label>{t("linksDisplayName")}</Label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={isAr ? "اسم الاستراحة" : "Resort name"}
              />
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
                    className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      backgroundColor: color,
                      borderColor:
                        themeColor === color ? "currentColor" : "transparent",
                      transform:
                        themeColor === color ? "scale(1.15)" : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label>{t("linksBio")}</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={
                isAr
                  ? "اكتب نبذة قصيرة عن الاستراحة..."
                  : "Write a short bio about your resort..."
              }
              rows={3}
            />
          </div>

          {/* Publish Toggle */}
          <div className="flex items-center gap-3">
            <Button
              variant={isPublished ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPublished(!isPublished)}
            >
              {isPublished ? (
                <Eye className="h-4 w-4 me-1" />
              ) : (
                <EyeOff className="h-4 w-4 me-1" />
              )}
              {t("linksPublished")}
            </Button>
            <span className="text-sm text-muted-foreground">
              {isPublished
                ? isAr
                  ? "الصفحة مرئية للجميع"
                  : "Page is visible to everyone"
                : isAr
                  ? "الصفحة مخفية"
                  : "Page is hidden"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Links Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t("linksMyLinks")}
            <Button size="sm" onClick={openAddDialog}>
              <Plus className="h-4 w-4 me-1" />
              {t("linksAddLink")}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {links.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Link2 className="h-12 w-12 mb-3 opacity-50" />
              <p>{t("linksNoLinks")}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((link, index) => {
                const IconComp = getIconComponent(link.iconType);
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-opacity ${
                      !link.isActive ? "opacity-50" : ""
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: themeColor }}
                    >
                      <IconComp className="h-5 w-5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{link.title}</p>
                      <p className="text-sm text-muted-foreground truncate" dir="ltr">
                        {link.url}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleLinkActive(index)}
                        title={
                          link.isActive
                            ? isAr
                              ? "تعطيل"
                              : "Disable"
                            : isAr
                              ? "تفعيل"
                              : "Enable"
                        }
                      >
                        {link.isActive ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveLink(index, "up")}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => moveLink(index, "down")}
                        disabled={index === links.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(index)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeLink(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={saving} className="gap-2" size="lg">
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        {isAr ? "حفظ التغييرات" : "Save Changes"}
      </Button>

      {/* Add/Edit Link Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? t("linksEditLink") : t("linksAddLink")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Icon Type */}
            <div className="space-y-2">
              <Label>{t("linksIconType")}</Label>
              <Select value={dialogIconType} onValueChange={setDialogIconType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {isAr ? type.labelAr : type.labelEn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>{t("linksTitle")}</Label>
              <Input
                value={dialogTitle}
                onChange={(e) => setDialogTitle(e.target.value)}
                placeholder={isAr ? "مثال: واتساب الحجوزات" : "e.g., Booking WhatsApp"}
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <Label>{t("linksUrl")}</Label>
              <Input
                value={dialogUrl}
                onChange={(e) => setDialogUrl(e.target.value)}
                placeholder="https://..."
                dir="ltr"
              />
            </div>

            <Button onClick={handleDialogSave} className="w-full">
              {editingIndex !== null
                ? isAr
                  ? "تحديث الرابط"
                  : "Update Link"
                : isAr
                  ? "إضافة الرابط"
                  : "Add Link"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
