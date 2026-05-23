"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ShoppingCart, User, Search, Heart } from "lucide-react";
import { LanguageSwitcher } from "@/components/goun/LanguageSwitcher";
import { Logo } from "@/components/layout/Logo";
import { useCartStore } from "@/lib/cart-store";
import { getRoleFromToken, isAuthenticated, syncAccessTokenCookie, type UserRole } from "@/lib/auth";
import { localeToGounLang } from "@/lib/goun-copy";

export function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const itemCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  useEffect(() => {
    setMounted(true);
    syncAccessTokenCookie();
    setRole(getRoleFromToken());
    setLoggedIn(isAuthenticated());
  }, [pathname]);

  const displayCount = mounted ? itemCount : 0;
  const isLoggedIn = mounted && loggedIn;
  const isAdmin = isLoggedIn && role === "ADMIN";
  const isSeller = isLoggedIn && role === "SELLER";
  const gounLang = localeToGounLang(locale);

  return (
    <header className="sticky top-0 z-50 bg-[var(--surface-card)] border-b border-dune/50 shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2 min-h-tap">
        <Logo size="md" />


        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-night/50" aria-hidden />
            <input
              type="search"
              placeholder={locale === "ar" ? "ابحث عن منتج..." : "Rechercher..."}
              className="w-full pl-10 pr-4 py-3 rounded-card bg-mist border border-dune focus:outline-none focus:ring-2 focus:ring-ochre min-h-tap"
              aria-label={locale === "ar" ? "بحث المنتجات" : "Rechercher des produits"}
            />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <LanguageSwitcher active={gounLang} className="hidden sm:flex" />
          <Link href={`/${locale}/catalogue`} className="hidden sm:flex text-night hover:text-ochre min-h-tap items-center text-sm">
            {t("catalogue")}
          </Link>
          {isLoggedIn && (
            <Link
              href={`/${locale}/favoris`}
              className="relative min-h-tap p-2"
              aria-label="Favoris"
              title="Favoris"
            >
              <Heart className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
          )}
          <Link
            href={`/${locale}/cart`}
            className="relative min-h-tap p-2"
            aria-label={t("cart")}
            title={t("cart")}
          >
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
            {displayCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-ochre text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {displayCount}
              </span>
            )}
          </Link>
          {isLoggedIn ? (
            <>
              {isAdmin ? (
                <Link href={`/${locale}/admin/dashboard`} className="min-h-tap flex items-center gap-1 text-atlantic text-sm px-1">
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline">{t("dashboard")}</span>
                </Link>
              ) : isSeller ? (
                <Link href={`/${locale}/seller/dashboard`} className="min-h-tap flex items-center gap-1 text-atlantic text-sm px-1">
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline">{t("dashboard")}</span>
                </Link>
              ) : (
                <Link href={`/${locale}/orders`} className="min-h-tap flex items-center gap-1 text-atlantic text-sm px-1">
                  <User className="w-5 h-5" />
                  <span className="hidden md:inline">{t("account")}</span>
                </Link>
              )}
              <Link
                href={`/${locale}/logout`}
                className="inline-flex items-center gap-1 rounded-card bg-red-600 text-white hover:bg-red-700 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium min-h-tap shrink-0"
              >
                {locale === "ar" ? "خروج" : "Déconnexion"}
              </Link>
            </>
          ) : (
            <Link href={`/${locale}/login`} className="btn-primary text-sm py-2 px-3 min-h-tap">
              {t("login")}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
