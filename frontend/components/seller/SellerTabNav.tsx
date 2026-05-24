"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { LayoutDashboard, Package, PlusCircle, ShoppingCart, UserCircle } from "lucide-react";

const TABS: {
  href: string;
  icon: typeof LayoutDashboard;
  fr: string;
  ar: string;
  external?: boolean;
}[] = [
  { href: "dashboard", icon: LayoutDashboard, fr: "Tableau de bord", ar: "لوحة التحكم" },
  { href: "products", icon: Package, fr: "Mes produits", ar: "منتجاتي" },
  { href: "products/new", icon: PlusCircle, fr: "Ajouter un produit", ar: "إضافة منتج", external: true },
  { href: "orders", icon: ShoppingCart, fr: "Commandes", ar: "الطلبات" },
  { href: "settings/profile", icon: UserCircle, fr: "Mon profil", ar: "الملف الشخصي" },
];

export function SellerTabNav() {
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const rtl = locale === "ar";

  return (
    <nav
      className="flex gap-1 overflow-x-auto pb-2 mb-6 border-b border-[var(--goun-mist)] scrollbar-hide"
      aria-label={rtl ? "تنقل البائع" : "Navigation vendeur"}
    >
      {TABS.map((tab) => {
        const href = tab.external
          ? `/${locale}/products/new`
          : `/${locale}/seller/${tab.href}`;
        const active = tab.external
          ? pathname.includes("/products/new")
          : pathname.includes(`/seller/${tab.href}`);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={href}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg whitespace-nowrap text-sm goun-font-ui transition-colors min-h-tap shrink-0 ${
              active
                ? "bg-[var(--goun-forest)] text-white"
                : "text-[var(--goun-charcoal)] hover:bg-[var(--goun-mist)]/80"
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" aria-hidden />
            <span>{rtl ? tab.ar : tab.fr}</span>
          </Link>
        );
      })}
    </nav>
  );
}
