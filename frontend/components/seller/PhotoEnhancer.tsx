"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

interface PhotoEnhancerProps {
  imageFile: File | null;
  onUseEnhanced: (blob: Blob) => void;
}

export function PhotoEnhancer({ imageFile, onUseEnhanced }: PhotoEnhancerProps) {
  const t = useTranslations("photoEnhance");
  const [loading, setLoading] = useState(false);
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);
  const [afterBlob, setAfterBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");

  const enhance = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError("");
    if (beforeUrl) URL.revokeObjectURL(beforeUrl);
    if (afterUrl) URL.revokeObjectURL(afterUrl);
    const before = URL.createObjectURL(imageFile);
    setBeforeUrl(before);
    const form = new FormData();
    form.append("image", imageFile);
    try {
      const res = await api.post("/ai/enhance-photo", form, {
        responseType: "blob",
      });
      const blob = res.data as Blob;
      setAfterBlob(blob);
      setAfterUrl(URL.createObjectURL(blob));
    } catch {
      setError(t("error"));
      setAfterUrl(null);
      setAfterBlob(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 border border-dune rounded-card p-4 bg-sand/30">
      <Button
        type="button"
        variant="secondary"
        onClick={enhance}
        disabled={!imageFile || loading}
        className="inline-flex items-center gap-2"
      >
        <Sparkles size={16} />
        {loading ? t("processing") : t("button")}
      </Button>
      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
      {(beforeUrl || afterUrl) && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-night/60 mb-1">{t("before")}</p>
            {beforeUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={beforeUrl} alt="" className="w-full rounded-card border border-dune object-cover aspect-square" />
            )}
          </div>
          <div>
            <p className="text-xs text-night/60 mb-1">{t("after")}</p>
            {afterUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={afterUrl} alt="" className="w-full rounded-card border border-ochre object-cover aspect-square" />
            )}
          </div>
        </div>
      )}
      {afterBlob && (
        <Button type="button" onClick={() => onUseEnhanced(afterBlob)}>
          {t("useEnhanced")}
        </Button>
      )}
    </div>
  );
}
