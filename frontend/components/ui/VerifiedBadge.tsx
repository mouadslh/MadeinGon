"use client";

import { BadgeCheck } from "lucide-react";
import { useTranslations } from "next-intl";

type Size = "sm" | "md" | "lg";

interface VerifiedBadgeProps {
  size?: Size;
  showLabel?: boolean;
  className?: string;
  variant?: "gold" | "green";
}

const SIZE_MAP: Record<Size, { wrapper: string; icon: number; text: string }> = {
  sm: { wrapper: "px-1.5 py-0.5 gap-1 text-[10px]", icon: 12, text: "" },
  md: { wrapper: "px-2 py-1 gap-1 text-[11px]", icon: 14, text: "" },
  lg: { wrapper: "px-3 py-1.5 gap-1.5 text-[13px]", icon: 16, text: "" },
};

export function VerifiedBadge({
  size = "md",
  showLabel = true,
  className = "",
  variant = "gold",
}: VerifiedBadgeProps) {
  const t = useTranslations("badge");
  const dims = SIZE_MAP[size];
  const palette =
    variant === "green"
      ? {
          background: "var(--deep-green)",
          color: "white",
        }
      : {
          background: "var(--gold-light)",
          color: "var(--deep-green)",
        };

  return (
    <span
      className={`verified-badge inline-flex items-center font-semibold rounded-full shadow-warm ${dims.wrapper} ${className}`}
      style={{
        ...palette,
        fontFamily: "var(--font-ui)",
        whiteSpace: "nowrap",
      }}
      aria-label={t("verifiedByGon")}
      title={t("verifiedByGon")}
    >
      <BadgeCheck size={dims.icon} aria-hidden strokeWidth={2.4} />
      {showLabel && <span>{t("verifiedByGon")}</span>}
    </span>
  );
}
