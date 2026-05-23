"use client";

import { useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CinViewButtonProps {
  url: string | null | undefined;
  viewLabel: string;
  missingLabel: string;
  openInBrowserLabel?: string;
  closeLabel?: string;
}

function isDisplayableImage(url: string): boolean {
  if (/\.(jpe?g|png|gif|webp|bmp)(\?|$)/i.test(url)) return true;
  if (url.includes("res.cloudinary.com") && url.includes("/image/upload")) return true;
  return false;
}

function isPdf(url: string): boolean {
  return /\.pdf(\?|$)/i.test(url) || url.includes("/raw/upload") || url.includes("format=pdf");
}

export function CinViewButton({
  url,
  viewLabel,
  missingLabel,
  openInBrowserLabel = "Ouvrir dans le navigateur",
  closeLabel = "Fermer",
}: CinViewButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!url || !url.startsWith("http")) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 whitespace-nowrap">
        {missingLabel}
      </span>
    );
  }

  const openExternal = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleView = () => {
    if (isPdf(url)) {
      openExternal();
      return;
    }
    if (isDisplayableImage(url)) {
      setModalOpen(true);
      return;
    }
    openExternal();
  };

  return (
    <>
      <div className="flex flex-col gap-1.5 items-start">
        {isDisplayableImage(url) && (
          <button type="button" onClick={handleView} className="block rounded border border-dune overflow-hidden hover:ring-2 hover:ring-ochre">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt="CIN"
              className="h-16 w-auto max-w-[140px] object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </button>
        )}
        <button
          type="button"
          onClick={handleView}
          className="inline-flex items-center gap-1 text-atlantic underline text-xs font-medium hover:text-ochre min-h-tap"
        >
          <ExternalLink size={12} />
          {viewLabel}
        </button>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-[var(--surface-card)] rounded-card shadow-xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-dune">
              <span className="font-medium text-sm">{viewLabel}</span>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="min-h-tap min-w-tap p-2 rounded-card hover:bg-dune"
                aria-label={closeLabel}
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1 flex flex-col items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="CIN"
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
              <Button type="button" variant="secondary" onClick={openExternal}>
                <ExternalLink size={16} className="inline me-2" />
                {openInBrowserLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
