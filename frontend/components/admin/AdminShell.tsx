"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const otherLocale = locale === "fr" ? "ar" : "fr";
  const path = pathname.replace(/^\/(fr|ar)/, "") || "/";

  return (
    <div className="flex min-h-screen bg-sand">
      {menuOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-night/50 md:hidden"
          aria-label={t("menuClose")}
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <AdminSidebar mobileOpen={menuOpen} onNavigate={() => setMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 w-full">
        <header className="sticky top-0 z-30 flex md:hidden h-14 items-center justify-between gap-2 border-b border-dune/70 bg-sand/95 backdrop-blur px-4 shrink-0">
          <button
            type="button"
            className="min-h-tap min-w-tap flex items-center justify-center rounded-card hover:bg-dune"
            aria-label={menuOpen ? t("menuClose") : t("menuOpen")}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <span className="font-display text-ochre text-sm truncate">{t("subtitle")}</span>
          <Link
            href={`/${otherLocale}${path}`}
            className="text-xs font-medium px-2 py-1 rounded-card border border-dune hover:bg-dune shrink-0"
          >
            {t("switchLocale")}
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
