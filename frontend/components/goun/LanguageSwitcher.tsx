"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { GounLang } from "@/lib/goun-copy";

const LANGS: { id: GounLang; code: string; label: string }[] = [
  { id: "fr", code: "FR", label: "Français" },
  { id: "ar", code: "AR", label: "العربية" },
];

export function LanguageSwitcher({
  active,
  className = "",
  variant = "compact",
  ariaLabel,
}: {
  active: GounLang;
  className?: string;
  /** compact = chips FR/AR ; sidebar = boutons pleine largeur pour le panel vendeur */
  variant?: "compact" | "sidebar";
  ariaLabel?: string;
}) {
  const pathname = usePathname();
  const path = pathname.replace(/^\/(fr|ar)/, "") || "/";
  const groupLabel = ariaLabel ?? (active === "ar" ? "اللغة" : "Langue");

  return (
    <div
      className={`${variant === "sidebar" ? "flex flex-col gap-1.5 w-full" : "flex gap-2"} ${className}`}
      role="group"
      aria-label={groupLabel}
    >
      {LANGS.map((lang) => {
        const isActive = active === lang.id;
        const href = `/${lang.id}${path}`;
        const base =
          variant === "sidebar"
            ? "flex items-center justify-between w-full px-3 py-2 rounded-card text-sm border transition-colors min-h-tap"
            : "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors min-h-tap goun-font-ui";
        const activeCls =
          variant === "sidebar"
            ? "bg-ochre text-white border-ochre"
            : "bg-[var(--goun-forest)] text-white border-[var(--goun-forest)]";
        const idleCls =
          variant === "sidebar"
            ? "border-dune/70 hover:bg-dune/50 text-night"
            : "border-[var(--goun-mist)] hover:bg-[var(--goun-sand)] text-[var(--goun-charcoal)]";

        return (
          <Link
            key={lang.id}
            href={href}
            className={`${base} ${isActive ? activeCls : idleCls} ${lang.id === "ar" ? "goun-font-ar" : ""}`}
            aria-current={isActive ? "page" : undefined}
            lang={lang.id}
          >
            <span className="font-medium">{lang.label}</span>
            <span className={`text-xs ${isActive ? "opacity-90" : "opacity-60"}`}>{lang.code}</span>
          </Link>
        );
      })}
    </div>
  );
}
