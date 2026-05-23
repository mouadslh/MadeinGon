"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LANG_FLAGS, LANG_LABELS, SUPPORTED_LANGS, ANNOUNCEMENT, type Lang } from "./copy";

const SITE_LOCALES = ["fr", "ar"] as const;

function getLocaleFromPath(path: string): "fr" | "ar" {
  const m = path.match(/^\/(fr|ar)(?=\/|$)/);
  return (m?.[1] as "fr" | "ar") ?? "fr";
}

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = getLocaleFromPath(pathname);
  const announcement = ANNOUNCEMENT[currentLocale];

  const handleLangChange = (lang: Lang) => {
    if (!SITE_LOCALES.includes(lang as "fr" | "ar")) {
      return;
    }
    const stripped = pathname.replace(/^\/(fr|ar)(?=\/|$)/, "") || "/";
    router.push(`/${lang}${stripped === "/" ? "" : stripped}`);
  };

  return (
    <div
      className="w-full h-[36px] flex items-center text-[13px]"
      style={{ background: "var(--deep-green)", color: "var(--sand)" }}
    >
      <div className="mx-auto max-w-7xl w-full px-4 flex items-center justify-between gap-4">
        <span className="truncate opacity-95" style={{ fontFamily: "var(--font-ui)" }}>
          {announcement}
        </span>

        <div className="flex items-center gap-1 shrink-0">
          {SUPPORTED_LANGS.map((lang) => {
            const isActive = currentLocale === lang;
            const isAvailable = (SITE_LOCALES as readonly string[]).includes(lang);
            return (
              <button
                key={lang}
                type="button"
                onClick={() => handleLangChange(lang)}
                disabled={!isAvailable}
                className={`px-2 py-1 rounded-full text-xs transition-colors flex items-center gap-1 ${
                  isActive ? "bg-white/15 font-semibold" : "hover:bg-white/10"
                } ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                aria-label={`Switch to ${LANG_LABELS[lang]}`}
                title={!isAvailable ? "Bientôt disponible" : LANG_LABELS[lang]}
              >
                <span aria-hidden>{LANG_FLAGS[lang]}</span>
                <span className="hidden sm:inline">{LANG_LABELS[lang]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
