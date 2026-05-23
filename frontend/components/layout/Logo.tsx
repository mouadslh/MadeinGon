"use client";

import Link from "next/link";
import { useLocale } from "next-intl";

type LogoVariant = "default" | "light" | "mono";
type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  href?: string;
  withWordmark?: boolean;
  className?: string;
}

const SIZE: Record<LogoSize, { svg: number; text: string }> = {
  sm: { svg: 24, text: "text-base" },
  md: { svg: 28, text: "text-lg md:text-xl" },
  lg: { svg: 40, text: "text-2xl md:text-3xl" },
};

function PaletteFor(variant: LogoVariant) {
  switch (variant) {
    case "light":
      return { drop: "var(--gold-light)", stripe: "var(--deep-green)", made: "var(--sand)", gon: "var(--ocre)" };
    case "mono":
      return { drop: "currentColor", stripe: "currentColor", made: "currentColor", gon: "currentColor" };
    default:
      return { drop: "var(--deep-green)", stripe: "var(--gold-light)", made: "var(--deep-green)", gon: "var(--ocre)" };
  }
}

/**
 * Composant Logo unifié Made in GON.
 *
 * - Forme : goutte d'argan stylisée, palette charte de la plateforme.
 * - Inline SVG (pas de fichier statique à charger).
 * - Utiliser ce composant partout (Navbar, Footer, Intro, Auth…).
 */
export function Logo({
  variant = "default",
  size = "md",
  href,
  withWordmark = true,
  className = "",
}: LogoProps) {
  const locale = useLocale();
  const dims = SIZE[size];
  const palette = PaletteFor(variant);

  const inner = (
    <span className={`inline-flex items-center gap-2 shrink-0 ${className}`} aria-label="Made in GON">
      <svg
        width={dims.svg}
        height={dims.svg}
        viewBox="0 0 64 64"
        aria-hidden
        role="img"
      >
        <path
          d="M32 6c-9 14-14 24-14 34 0 9 6 16 14 16s14-7 14-16C46 30 41 20 32 6z"
          fill={palette.drop}
        />
        <path d="M32 14v40" stroke={palette.stripe} strokeWidth="1.6" />
      </svg>
      {withWordmark && (
        <span
          className={`font-bold leading-none ${dims.text}`}
          style={{ fontFamily: "var(--font-display)", color: palette.made }}
        >
          Made in <span style={{ color: palette.gon }}>GON</span>
        </span>
      )}
    </span>
  );

  if (href === null || href === "") return inner;
  const target = href ?? `/${locale}`;
  return (
    <Link href={target} className="inline-flex" aria-label="Made in GON — Accueil">
      {inner}
    </Link>
  );
}
