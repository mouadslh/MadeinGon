"use client";

import Link from "next/link";
import { Instagram, Facebook, MessageCircle } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { FOOTER_NAV, LANG_FLAGS, LANG_LABELS, SUPPORTED_LANGS, type Lang } from "./copy";
import { usePathname, useRouter } from "next/navigation";

type Props = { locale: Lang };

export function Footer({ locale }: Props) {
  const isRtl = locale === "ar";
  const copy = FOOTER_NAV[isRtl ? "ar" : "fr"];
  const router = useRouter();
  const pathname = usePathname();

  const handleLang = (lang: Lang) => {
    const stripped = pathname.replace(/^\/(fr|ar)(?=\/|$)/, "") || "/";
    router.push(`/${lang}${stripped === "/" ? "" : stripped}`);
  };

  return (
    <footer
      className="pt-16 pb-8 text-sm"
      style={{ background: "var(--deep-green)", color: "var(--sand)" }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Logo variant="light" size="md" href={`/${locale}`} />
          </div>
          <p
            className="opacity-85 mb-5 leading-relaxed"
            style={{ fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-body)" }}
          >
            {copy.tagline}
          </p>
          <div className="flex items-center gap-2">
            {[
              { Icon: Instagram, href: "#", label: "Instagram" },
              { Icon: Facebook, href: "#", label: "Facebook" },
              { Icon: MessageCircle, href: "#", label: "WhatsApp" },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {copy.cols.map((col) => (
          <div key={col.title}>
            <h4
              className="font-semibold mb-4"
              style={{ fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-ui)" }}
            >
              {col.title}
            </h4>
            <ul className="space-y-2.5 opacity-85">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={`/${locale}${link.href.startsWith("#") ? link.href : link.href}`}
                    className="hover:opacity-100 hover:underline transition-opacity"
                    style={{ fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-body)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4
            className="font-semibold mb-4"
            style={{ fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-ui)" }}
          >
            {copy.newsletter_label}
          </h4>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-3 mb-5"
          >
            <input
              type="email"
              required
              placeholder={copy.newsletter_placeholder}
              className="px-4 py-2.5 rounded-full text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "var(--sand)",
                border: "1px solid rgba(255,255,255,0.15)",
                fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-body)",
              }}
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full text-sm font-semibold transition-transform hover:-translate-y-0.5"
              style={{
                background: "var(--ocre)",
                color: "white",
                fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-ui)",
              }}
            >
              {copy.newsletter_cta}
            </button>
          </form>
          <div>
            <div
              className="text-xs uppercase tracking-wider mb-2 opacity-75"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              {isRtl ? "اللغة" : "Langue"}
            </div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Langue">
              {SUPPORTED_LANGS.map((lg) => (
                <button
                  key={lg}
                  type="button"
                  onClick={() => handleLang(lg)}
                  className={`px-2.5 py-1 rounded-full text-xs flex items-center gap-1 transition-colors ${
                    locale === lg ? "bg-white/15 font-semibold" : "hover:bg-white/10"
                  }`}
                  aria-current={locale === lg ? "true" : undefined}
                >
                  <span aria-hidden>{LANG_FLAGS[lg]}</span>
                  <span>{LANG_LABELS[lg]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="max-w-7xl mx-auto px-6 md:px-10 mt-12 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs opacity-80"
        style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
      >
        <span style={{ fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-ui)" }}>
          {copy.copyright}
        </span>
        <span style={{ fontFamily: "var(--font-ui)" }}>{copy.payment_methods}</span>
      </div>
    </footer>
  );
}
