"use client";

import { useRouter, useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight, Loader2, Save, Upload, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const AMENITY_KEYS = [
  "wifi", "pool", "bbq", "parking", "ac", "kitchen",
  "tv", "garden", "playground", "football", "volleyball", "jacuzzi",
] as const;

interface ChaletData {
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  locationAr: string;
  locationEn: string;
  capacity: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  weekendPrice: number | null;
  images: string[];
  amenities: string[];
  isActive: boolean;
}

export default function EditChaletPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const tch = useTranslations("chalets");
  const ta = useTranslations("amenityLabels");
  const locale = useLocale();
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const isAr = locale === "ar";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    nameAr: "",
    nameEn: "",
    descriptionAr: "",
    descriptionEn: "",
    locationAr: "",
    locationEn: "",
    capacity: "",
    bedrooms: "",
    bathrooms: "",
    pricePerNight: "",
    weekendPrice: "",
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  useEffect(() => {
    fetch(`/api/chalets?dashboard=true`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const chalet = data.find((c: ChaletData) => c.slug === slug);
          if (chalet) {
            setFormData({
              nameAr: chalet.nameAr || "",
              nameEn: chalet.nameEn || "",
              descriptionAr: chalet.descriptionAr || "",
              descriptionEn: chalet.descriptionEn || "",
              locationAr: chalet.locationAr || "",
              locationEn: chalet.locationEn || "",
              capacity: String(chalet.capacity || ""),
              bedrooms: String(chalet.bedrooms || ""),
              bathrooms: String(chalet.bathrooms || ""),
              pricePerNight: String(Number(chalet.pricePerNight) || ""),
              weekendPrice: chalet.weekendPrice ? String(Number(chalet.weekendPrice)) : "",
            });
            setImages(chalet.images || []);
            setSelectedAmenities(chalet.amenities || []);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleAmenity = (key: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleUploadImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    const fd = new FormData();
    for (const file of Array.from(files)) {
      fd.append("files", file);
    }

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        setImages((prev) => [...prev, ...data.urls]);
      } else {
        toast.error(isAr ? "فشل رفع الصور" : "Image upload failed");
      }
    } catch {
      toast.error(isAr ? "فشل رفع الصور" : "Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nameAr.trim()) {
      toast.error(isAr ? "يرجى إدخال اسم الشاليه" : "Please enter the chalet name");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`/api/chalets/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameAr: formData.nameAr,
          nameEn: formData.nameEn || formData.nameAr,
          descriptionAr: formData.descriptionAr,
          descriptionEn: formData.descriptionEn,
          locationAr: formData.locationAr,
          locationEn: formData.locationEn,
          capacity: Number(formData.capacity) || 0,
          bedrooms: Number(formData.bedrooms) || 0,
          bathrooms: Number(formData.bathrooms) || 0,
          pricePerNight: Number(formData.pricePerNight) || 0,
          weekendPrice: Number(formData.weekendPrice) || null,
          images,
          amenities: selectedAmenities,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || (isAr ? "حدث خطأ" : "An error occurred"));
        return;
      }

      toast.success(isAr ? "تم تحديث الشاليه بنجاح" : "Chalet updated successfully");
      router.push(`/${locale}/dashboard/chalets`);
    } catch {
      toast.error(isAr ? "حدث خطأ، حاول مرة أخرى" : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const BackIcon = isAr ? ArrowRight : ArrowLeft;

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
        <Link href={`/${locale}/dashboard/chalets`}>
          <Button variant="ghost" size="icon">
            <BackIcon className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">
          {isAr ? "تعديل الشاليه" : "Edit Chalet"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isAr ? "المعلومات الأساسية" : "Basic Information"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("chaletNameAr")}</Label>
              <Input
                required
                name="nameAr"
                value={formData.nameAr}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("chaletNameEn")}</Label>
              <Input
                name="nameEn"
                value={formData.nameEn}
                onChange={handleChange}
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{tch("description")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("descriptionAr")}</Label>
              <Textarea
                name="descriptionAr"
                value={formData.descriptionAr}
                onChange={handleChange}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("descriptionEn")}</Label>
              <Textarea
                name="descriptionEn"
                value={formData.descriptionEn}
                onChange={handleChange}
                rows={4}
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{tch("location")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("locationAr")}</Label>
              <Input
                name="locationAr"
                value={formData.locationAr}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("locationEn")}</Label>
              <Input
                name="locationEn"
                value={formData.locationEn}
                onChange={handleChange}
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>

        {/* Capacity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{tch("capacity")}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>{tch("capacity")} ({tch("person")})</Label>
              <Input
                type="number"
                name="capacity"
                min={0}
                value={formData.capacity}
                onChange={handleChange}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>{tch("bedrooms")}</Label>
              <Input
                type="number"
                name="bedrooms"
                min={0}
                value={formData.bedrooms}
                onChange={handleChange}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>{tch("bathrooms")}</Label>
              <Input
                type="number"
                name="bathrooms"
                min={0}
                value={formData.bathrooms}
                onChange={handleChange}
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isAr ? "التسعير" : "Pricing"}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{tch("pricePerNight")} ({tc("sar")})</Label>
              <Input
                type="number"
                name="pricePerNight"
                min={0}
                step="0.01"
                value={formData.pricePerNight}
                onChange={handleChange}
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>{tch("weekendPrice")} ({tc("sar")})</Label>
              <Input
                type="number"
                name="weekendPrice"
                min={0}
                step="0.01"
                value={formData.weekendPrice}
                onChange={handleChange}
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{tch("amenities")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("selectAmenities")}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {AMENITY_KEYS.map((key) => {
                const selected = selectedAmenities.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleAmenity(key)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        selected
                          ? "border-primary bg-primary text-white"
                          : "border-muted-foreground/30"
                      }`}
                    >
                      {selected && (
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    {ta(key)}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isAr ? "الصور" : "Images"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {isAr ? "ارفق صور الشاليه" : "Attach chalet images"}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {images.map((url, index) => (
                  <div
                    key={index}
                    className="group relative aspect-square overflow-hidden rounded-lg border"
                  >
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-colors hover:border-primary/50">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleUploadImages}
                disabled={uploading}
              />
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {isAr ? "اضغط لرفع الصور" : "Click to upload images"}
                  </span>
                  <span className="text-xs text-muted-foreground/70">
                    {isAr
                      ? "JPG, PNG, WebP - حد أقصى 5 ميجابايت"
                      : "JPG, PNG, WebP - Max 5MB each"}
                  </span>
                </>
              )}
            </label>
          </CardContent>
        </Card>

        <Separator />

        {/* Submit */}
        <div className="flex items-center gap-3">
          <Button type="submit" size="lg" disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving
              ? isAr ? "جاري الحفظ..." : "Saving..."
              : isAr ? "حفظ التغييرات" : "Save Changes"}
          </Button>
          <Link href={`/${locale}/dashboard/chalets`}>
            <Button type="button" variant="outline" size="lg">
              {tc("cancel")}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
