"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Wallet,
  Bell,
  Star,
  Bot,
  Settings,
  LogOut,
  UserCircle,
  Store,
} from "lucide-react";
import { clearStoredTokens } from "@/lib/auth";
import { api } from "@/lib/api";

type Me = { full_name?: string };
type SellerProfile = { shop_name?: string };

export function SellerSidebar() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const locale = params.locale as string;
  const [me, setMe] = useState<Me>({});
  const [profile, setProfile] = useState<SellerProfile>({});
  const [pendingOrders, setPendingOrders] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    api.get("/auth/me").then((r) => setMe(r.data)).catch(() => {});
    api.get("/sellers/profile").then((r) => setProfile(r.data)).catch(() => {});
    api.get("/seller/orders/counts").then((r) => setPendingOrders(r.data.pending ?? 0)).catch(() => {});
    api.get("/seller/notifications/unread-count").then((r) => setUnreadNotifs(r.data.count ?? 0)).catch(() => {});
  }, []);

  const logout = () => {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) {
      api.post("/auth/logout", { refresh_token: refresh }).catch(() => {});
    }
    clearStoredTokens();
    router.push(`/${locale}/login`);
  };

  const label = profile.shop_name || me.full_name || "Artisan";

  const navItems = [
    { href: `/${locale}/seller/dashboard`, label: locale === "ar" ? "لوحة التحكم" : "Tableau de bord", icon: LayoutDashboard },
    { href: `/${locale}/seller/products`, label: locale === "ar" ? "منتجاتي" : "Mes Produits", icon: Package, badge: undefined as number | undefined },
    { href: `/${locale}/products/new`, label: locale === "ar" ? "منتج جديد" : "Nouveau produit", icon: Package },
    { href: `/${locale}/seller/orders`, label: locale === "ar" ? "الطلبات" : "Commandes", icon: ShoppingCart, badge: pendingOrders || undefined },
    { href: `/${locale}/seller/wallet`, label: locale === "ar" ? "المحفظة" : "Wallet & Revenus", icon: Wallet },
    { href: `/${locale}/seller/notifications`, label: locale === "ar" ? "الإشعارات" : "Notifications", icon: Bell, badge: unreadNotifs || undefined },
    { href: `/${locale}/seller/reviews`, label: locale === "ar" ? "التقييمات" : "Avis clients", icon: Star },
    { href: `/${locale}/seller/settings/profile`, label: locale === "ar" ? "الإعدادات" : "Paramètres", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-sand border-r border-dune/70 min-h-screen p-3 flex flex-col shrink-0">
      <div className="font-display text-xl text-ochre mb-4">Made in Goun</div>
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded-card px-3 py-2 text-sm ${
                active ? "bg-ochre text-white" : "hover:bg-dune text-night"
              }`}
            >
              <Icon size={18} className={active ? "text-white" : "text-night/60"} />
              <span className="flex-1">{item.label}</span>
              {item.badge != null && item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-dune/70 pt-3 space-y-2">
        <div className="flex items-center gap-3 px-2">
          <UserCircle size={36} className="text-night/40 shrink-0" />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{label}</p>
            <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-full bg-night/10">
              <Store size={10} className="mr-1" />
              Artisan
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 text-red-600 text-sm px-3 py-2 rounded-card hover:bg-red-50"
        >
          <LogOut size={16} />
          {locale === "ar" ? "تسجيل الخروج" : "Se déconnecter"}
        </button>
      </div>
    </aside>
  );
}
