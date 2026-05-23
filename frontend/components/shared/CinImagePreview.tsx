"use client";

import { useState } from "react";
import { isDisplayableCinImage, normalizeCinUrl } from "@/lib/cin-image";

interface CinImagePreviewProps {
  url: string;
  alt?: string;
  className?: string;
  onClick?: () => void;
}

/** Inline CIN preview — same rendering as seller dashboard (native img, Cloudinary-friendly). */
export function CinImagePreview({
  url,
  alt = "CIN",
  className = "max-h-48 w-full max-w-[220px] rounded-card border border-dune object-contain bg-white",
  onClick,
}: CinImagePreviewProps) {
  const [failed, setFailed] = useState(false);
  const src = normalizeCinUrl(url);

  if (!src || !isDisplayableCinImage(src)) return null;

  if (failed) {
    return (
      <p className="text-xs text-night/60 max-w-[220px]">
        Aperçu indisponible — utilisez « Ouvrir » pour voir le document.
      </p>
    );
  }

  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      className={className}
      onError={() => setFailed(true)}
    />
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block text-start rounded-card hover:ring-2 hover:ring-ochre">
        {img}
      </button>
    );
  }

  return img;
}
