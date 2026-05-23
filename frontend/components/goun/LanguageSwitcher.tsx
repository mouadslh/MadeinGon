"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { GounLang } from "@/lib/goun-copy";

const LANGS: { id: GounLang; flag: string; code: string }[] = [
  { id: "fr", flag: "🇫🇷", code: "FR" },
  { id: "ar", flag: "🇲🇦", code: "AR" },
];

export function LanguageSwitcher({
  active,
  className = "",
}: {
  active: GounLang;
  className?: string;
}) {
  const pathname = usePathname();
  const path = pathname.replace(/^\/(fr|ar)/, "") || "/";

  return (
    <div className={`flex gap-2 ${className}`} role="group" aria-label="Language">
      {LANGS.map((lang) => {
        const isActive = active === lang.id;
        return (
          <Link
            key={lang.id}
            href={`/${lang.id}${path}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors min-h-tap goun-font-ui ${
              isActive
                ? "bg-[var(--goun-forest)] text-white border-[var(--goun-forest)]"
                : "border-[var(--goun-mist)] hover:bg-[var(--goun-sand)] text-[var(--goun-charcoal)]"
            }`}
            aria-current={isActive ? "true" : undefined}
          >
            <span className="text-lg leading-none" aria-hidden>
              {lang.flag}
            </span>
            <span className="text-sm font-medium">{lang.code}</span>
          </Link>
        );
      })}
    </div>
  );
}
