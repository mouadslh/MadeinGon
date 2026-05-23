"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import { CATEGORIES } from "./copy";
import { Logo } from "@/components/layout/Logo";
import { isAuthenticated } from "@/lib/auth";

function getLocale(path: string): "fr" | "ar" {
  const m = path.match(/^\/(fr|ar)(?=\/|$)/);
  return (m?.[1] as "fr" | "ar") ?? "fr";
}

export function Header() {
  const pathname = usePathname();
  const locale = getLocale(pathname);
  const isRtl = locale === "ar";

  const [hidden, setHidden] = useState(false);
  const [authed, setAuthed] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY.current) < 8) return;
      setHidden(y > lastY.current && y > 120);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, [pathname]);

  const t = (fr: string, ar: string) => (locale === "ar" ? ar : fr);
  const searchPlaceholder = isRtl
    ? "ابحث عن منتج، مدينة، حرفي..."
    : "Argan, tapis, bijoux, miel...";

  const navItems = (
    <>
      <Link
        href={`/${locale}/cart`}
        aria-label={t("Panier", "السلة")}
        className="relative p-2 rounded-full hover:bg-[var(--sand-dark)] transition-colors"
      >
        <ShoppingBag size={22} style={{ color: "var(--anthracite)" }} />
        <span
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
          style={{ background: "var(--ocre)", color: "white", fontFamily: "var(--font-ui)" }}
        >
          0
        </span>
      </Link>
      {authed ? (
        <Link
          href={`/${locale}/favoris`}
          aria-label={t("Favoris", "المفضلة")}
          className="p-2 rounded-full hover:bg-[var(--sand-dark)] transition-colors"
        >
          <Heart size={22} style={{ color: "var(--anthracite)" }} />
        </Link>
      ) : (
        <Link
          href={`/${locale}/login?redirect=${encodeURIComponent(`/${locale}/favoris`)}`}
          aria-label={t("Favoris", "المفضلة")}
          className="p-2 rounded-full hover:bg-[var(--sand-dark)] transition-colors"
        >
          <Heart size={22} style={{ color: "var(--anthracite)" }} />
        </Link>
      )}
      <Link
        href={authed ? `/${locale}/orders` : `/${locale}/login`}
        aria-label={t("Connexion", "تسجيل الدخول")}
        className="p-2 rounded-full hover:bg-[var(--sand-dark)] transition-colors"
      >
        <User size={22} style={{ color: "var(--anthracite)" }} />
      </Link>
      <Link
        href={`/${locale}/seller-apply`}
        className="hidden md:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-warm"
        style={{
          background: "var(--ocre)",
          color: "white",
          fontFamily: "var(--font-ui)",
        }}
      >
        {t("Devenir vendeur", "كن بائعاً")}
      </Link>
    </>
  );

  return (
    <header
      className={`sticky top-0 z-40 transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
      style={{
        background: "rgba(248,244,235,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--warm-border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3 md:gap-6 py-3 md:py-4">
          <Logo size="md" href={`/${locale}`} />


          <form
            role="search"
            className="flex-1 max-w-2xl"
            onSubmit={(e) => e.preventDefault()}
          >
            <label className="relative block">
              <span className="sr-only">{t("Rechercher", "بحث")}</span>
              <Search
                size={18}
                className={`absolute top-1/2 -translate-y-1/2 ${
                  isRtl ? "right-4" : "left-4"
                }`}
                style={{ color: "var(--anthracite)", opacity: 0.6 }}
              />
              <input
                type="search"
                placeholder={searchPlaceholder}
                className="w-full rounded-full border bg-white/80 transition-colors focus:bg-white focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--warm-border)",
                  padding: isRtl ? "10px 44px 10px 16px" : "10px 16px 10px 44px",
                  fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-body)",
                  color: "var(--anthracite)",
                  outline: "none",
                }}
              />
            </label>
          </form>

          <div className="flex items-center gap-1 md:gap-2 shrink-0">{navItems}</div>
        </div>

        <nav
          aria-label={t("Catégories", "الفئات")}
          className="flex gap-2 md:gap-3 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-thin"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${locale}/catalogue?category=${cat.slug}`}
              className="shrink-0 px-4 py-1.5 rounded-full border text-sm font-medium transition-colors hover:shadow-warm"
              style={{
                borderColor: "var(--warm-border)",
                background: "var(--sand-dark)",
                color: "var(--deep-green)",
                fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-ui)",
                scrollSnapAlign: "start",
              }}
            >
              {isRtl ? cat.label_ar : cat.label_fr}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
