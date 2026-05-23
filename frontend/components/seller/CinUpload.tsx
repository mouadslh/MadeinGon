"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { postFormData } from "@/lib/upload";
import { Button } from "@/components/ui/Button";

interface CinUploadProps {
  onUploaded?: (url: string) => void;
  sellerProfileId?: string | null;
  existingUrl?: string | null;
  locked?: boolean;
  locale?: string;
}

export function CinUpload({
  onUploaded,
  sellerProfileId,
  existingUrl,
  locked = false,
  locale = "fr",
}: CinUploadProps) {
  const t = useTranslations("cin");
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const isLocked = locked || Boolean(existingUrl);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setMessage(null);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const upload = async () => {
    if (!file || isLocked) return;
    setLoading(true);
    setMessage(null);
    const form = new FormData();
    form.append("file", file);
    try {
      const path = sellerProfileId
        ? `/sellers/${sellerProfileId}/upload-cin`
        : "/sellers/me/upload-cin";
      const data = await postFormData<{ cin_url: string }>(path, form);
      setMessage({ type: "ok", text: t("success") });
      onUploaded?.(data.cin_url);
      setFile(null);
      setPreview(null);
    } catch (err: unknown) {
      const detail =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : null;
      setMessage({
        type: "err",
        text: typeof detail === "string" ? detail : t("error"),
      });
    } finally {
      setLoading(false);
    }
  };

  const displayUrl = existingUrl || preview;
  const isImage =
    displayUrl &&
    (displayUrl.startsWith("data:image") ||
      /\.(jpe?g|png|gif|webp)(\?|$)/i.test(displayUrl) ||
      displayUrl.includes("/image/upload"));

  if (isLocked && existingUrl) {
    return (
      <div className="space-y-3 rounded-card border border-dune bg-sand/40 p-4">
        <div className="flex items-center gap-2 text-sm text-night/80">
          <Lock size={16} className="text-ochre shrink-0" />
          <span>{t("locked")}</span>
        </div>
        {(isImage || existingUrl.includes("cloudinary.com")) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={existingUrl}
            alt="CIN"
            className="max-h-48 rounded-card border border-dune object-contain"
          />
        )}
        <button
          type="button"
          onClick={() => window.open(existingUrl, "_blank", "noopener,noreferrer")}
          className="text-sm text-atlantic underline min-h-tap"
        >
          {locale === "ar" ? "فتح الملف" : "Ouvrir le document"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">{t("label")}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        onChange={onFileChange}
        disabled={isLocked}
        className="w-full text-sm disabled:opacity-50"
      />
      {preview && (
        <div>
          <p className="text-xs text-night/60 mb-1">{t("preview")}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="" className="max-h-40 rounded-card border border-dune object-contain" />
        </div>
      )}
      <Button type="button" onClick={upload} disabled={!file || loading || isLocked} fullWidth>
        {loading ? t("uploading") : t("upload")}
      </Button>
      {message && (
        <p
          className={`text-sm ${message.type === "ok" ? "text-[var(--color-success)]" : "text-[var(--color-danger)]"}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
