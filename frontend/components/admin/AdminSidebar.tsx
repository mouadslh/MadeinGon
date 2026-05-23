"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Star,
  UserCog,
  Settings,
  LogOut,
  UserCircle,
  Shield,
  Store,
  X,
} from "lucide-react";
import { clearStoredTokens } from "@/lib/auth";
import { api } from "@/lib/api";

type Counts = {
  pending_products: number;
  pending_sellers: number;
  flagged_reviews: number;
};

type Me = {
  full_name?: string;
};

type NavItem = {
  labelKey: "dashboard" | "products" | "sellers" | "orders" | "reviews" | "users" | "settings";
  href: string;
  icon: typeof LayoutDashboard;
  badge?: number;
};

type AdminSidebarProps = {
  mobileOpen?: boolean;
  onNavigate?: () => void;
};

export function AdminSidebar({ mobileOpen = false, onNavigate }: AdminSidebarProps) {
  const t = useTranslations("admin");
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const [counts, setCounts] = useState<Counts>({ pending_products: 0, pending_sellers: 0, flagged_reviews: 0 });
  const [me, setMe] = useState<Me>({});

  useEffect(() => {
    const load = () => api.get("/admin/moderation/counts").then((r) => setCounts(r.data)).catch(() => {});
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    api.get("/auth/me").then((r) => setMe(r.data)).catch(() => {});
  }, []);

  const items: NavItem[] = useMemo(
    () => [
      { labelKey: "dashboard", href: `/${locale}/admin/dashboard`, icon: LayoutDashboard },
      { labelKey: "products", href: `/${locale}/admin/products`, icon: Package, badge: counts.pending_products || undefined },
      { labelKey: "sellers", href: `/${locale}/admin/sellers`, icon: Store, badge: counts.pending_sellers || undefined },
      { labelKey: "orders", href: `/${locale}/admin/orders`, icon: ShoppingCart },
      { labelKey: "reviews", href: `/${locale}/admin/reviews`, icon: Star, badge: counts.flagged_reviews || undefined },
      { labelKey: "users", href: `/${locale}/admin/users`, icon: Users },
      { labelKey: "settings", href: `/${locale}/admin/settings/profile`, icon: Settings },
    ],
    [locale, counts]
  );

  const logout = () => {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) {
      api.post("/auth/logout", { refresh_token: refresh }).catch(() => {});
    }
    clearStoredTokens();
    router.push(`/${locale}/login`);
  };

  const otherLocale = locale === "fr" ? "ar" : "fr";
  const path = pathname.replace(/^\/(fr|ar)/, "") || "/";

  return (
    <aside
      className={[
        "bg-sand border-dune/70 min-h-screen p-3 flex flex-col shrink-0 w-64 max-w-[85vw]",
        "fixed inset-y-0 start-0 z-50 border-e transition-transform duration-200 ease-out",
        "md:static md:translate-x-0 md:max-w-none",
        mobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full md:rtl:translate-x-0",
      ].join(" ")}
      aria-hidden={!mobileOpen ? undefined : undefined}
    >
      <div className="flex items-center justify-between gap-2 mb-4 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <Shield size={22} className="text-ochre shrink-0" />
          <div className="min-w-0">
            <p className="font-display text-lg text-ochre leading-tight truncate">{t("brand")}</p>
            <p className="text-xs text-night/60">{t("subtitle")}</p>
          </div>
        </div>
        <button
          type="button"
          className="md:hidden min-h-tap min-w-tap flex items-center justify-center rounded-card hover:bg-dune"
          aria-label={t("menuClose")}
          onClick={onNavigate}
        >
          <X size={20} />
        </button>
      </div>

      <Link
        href={`/${otherLocale}${path}`}
        className="hidden md:flex items-center justify-center text-xs font-medium mb-3 px-2 py-2 rounded-card border border-dune hover:bg-dune"
      >
        {t("switchLocale")}
      </Link>

      <nav className="space-y-1 flex-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-2 rounded-card px-3 py-2.5 text-sm min-h-tap ${
                active ? "bg-ochre text-white" : "hover:bg-dune text-night"
              }`}
            >
              <Icon size={18} className={active ? "text-white shrink-0" : "text-night/60 shrink-0"} />
              <span className="flex-1">{t(`nav.${item.labelKey}`)}</span>
              {item.badge != null && item.badge > 0 ? (
                <span className="bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shrink-0">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-dune/70 pt-3 space-y-2">
        <div className="flex items-center gap-3 px-2">
          <UserCircle size={36} className="text-night/40 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{me.full_name || t("role")}</p>
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-night text-white">
              <UserCog size={10} />
              {t("role")}
            </span>
          </div>
        </div>
        <Link
          href={`/${locale}/admin/settings/password`}
          onClick={onNavigate}
          className="flex items-center gap-2 text-night/80 text-sm px-3 py-2 rounded-card hover:bg-dune min-h-tap"
        >
          <Settings size={16} className="shrink-0" />
          {t("password")}
        </Link>
        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2 text-red-600 text-sm px-3 py-2 rounded-card hover:bg-red-50 min-h-tap"
        >
          <LogOut size={16} className="shrink-0" />
          {t("logout")}
        </button>
      </div>
    </aside>
  );
}
