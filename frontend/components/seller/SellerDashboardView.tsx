"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TrendingUp, TrendingDown, Package, ShoppingCart, Star, DollarSign } from "lucide-react";
import { api, formatPrice } from "@/lib/api";
import { GounFonts } from "@/components/goun/GounFonts";

interface DashboardStats {
  shop_name?: string;
  products_count?: number;
  products_published?: number;
  orders_pending?: number;
  revenue?: number;
  rating?: number;
}

type OrderRow = {
  id: string;
  reference: string;
  product_name?: string;
  buyer_city?: string;
  order_status: string;
  created_at: string;
};

const MOCK_ORDERS: OrderRow[] = [
  { id: "1", reference: "GON-2401", product_name: "Huile d'argan", buyer_city: "Guelmim", order_status: "pending", created_at: "2026-05-20" },
  { id: "2", reference: "GON-2402", product_name: "Miel", buyer_city: "Tan-Tan", order_status: "confirmed", created_at: "2026-05-19" },
  { id: "3", reference: "GON-2403", product_name: "Tapis", buyer_city: "Paris", order_status: "shipped", created_at: "2026-05-18" },
];

export function SellerDashboardView() {
  const params = useParams();
  const locale = params.locale as string;
  const rtl = locale === "ar";
  const [stats, setStats] = useState<DashboardStats>({});
  const [orders, setOrders] = useState<OrderRow[]>(MOCK_ORDERS);

  useEffect(() => {
    api.get("/sellers/dashboard").then((r) => setStats(r.data)).catch(() => {});
    api
      .get("/seller/orders", { params: { page_size: 5 } })
      .then((r) => {
        const items = r.data?.items ?? r.data ?? [];
        if (items.length) setOrders(items);
      })
      .catch(() => {});
  }, []);

  const t = (fr: string, ar: string) => (rtl ? ar : fr);

  const kpis = [
    {
      label: t("Ventes ce mois", "مبيعات الشهر"),
      value: formatPrice(stats.revenue ?? 12450, locale),
      trend: "up" as const,
      icon: DollarSign,
    },
    {
      label: t("Commandes en attente", "طلبات قيد الانتظار"),
      value: String(stats.orders_pending ?? 3),
      trend: "down" as const,
      icon: ShoppingCart,
    },
    {
      label: t("Produits actifs", "منتجات نشطة"),
      value: String(stats.products_published ?? stats.products_count ?? 8),
      trend: "up" as const,
      icon: Package,
    },
    {
      label: t("Note moyenne", "متوسط التقييم"),
      value: `${(stats.rating ?? 4.8).toFixed(1)}/5`,
      trend: "up" as const,
      icon: Star,
    },
  ];

  const statusColor: Record<string, string> = {
    pending: "bg-[var(--goun-gold)]/20 text-[var(--goun-charcoal)]",
    confirmed: "bg-[var(--goun-forest)]/15 text-[var(--goun-forest)]",
    shipped: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
  };

  return (
    <GounFonts rtl={rtl}>
      <div dir={rtl ? "rtl" : "ltr"}>
        <h1 className={`text-2xl text-[var(--goun-forest)] mb-1 ${rtl ? "goun-font-ar" : "goun-font-display"}`}>
          {stats.shop_name || t("Mon atelier GON", "ورشتي GON")}
        </h1>
        <p className="goun-font-ui text-sm text-[var(--goun-charcoal)]/60 mb-8">{t("Tableau de bord vendeur", "لوحة تحكم البائع")}</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((k) => {
            const Icon = k.icon;
            const TrendIcon = k.trend === "up" ? TrendingUp : TrendingDown;
            return (
              <article
                key={k.label}
                className="bg-white rounded-xl border border-[var(--goun-mist)] p-5 shadow-sm goun-card-hover"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="p-2 rounded-lg bg-[var(--goun-forest)]/10">
                    <Icon className="w-5 h-5 text-[var(--goun-forest)]" />
                  </span>
                  <TrendIcon
                    className={`w-4 h-4 ${k.trend === "up" ? "text-green-600" : "text-[var(--goun-earth)]"}`}
                  />
                </div>
                <p className="text-2xl font-bold text-[var(--goun-charcoal)] goun-font-display">{k.value}</p>
                <p className="text-xs goun-font-ui text-[var(--goun-charcoal)]/60 mt-1">{k.label}</p>
              </article>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl border p-6">
            <h2 className="goun-font-ui font-medium mb-4 text-[var(--goun-forest)]">
              {t("Commandes récentes", "أحدث الطلبات")}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm goun-font-ui">
                <thead>
                  <tr className="text-[var(--goun-charcoal)]/50 border-b">
                    <th className="py-2 text-start">ID</th>
                    <th className="py-2 text-start">{t("Produit", "المنتج")}</th>
                    <th className="py-2 text-start">{t("Ville", "المدينة")}</th>
                    <th className="py-2 text-start">{t("Statut", "الحالة")}</th>
                    <th className="py-2 text-start">{t("Date", "التاريخ")}</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="border-b border-[var(--goun-mist)]/60">
                      <td className="py-3 font-mono text-xs">{o.reference || o.id}</td>
                      <td className="py-3">{o.product_name || "—"}</td>
                      <td className="py-3">{o.buyer_city || "—"}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[o.order_status] || statusColor.pending}`}>
                          {o.order_status}
                        </span>
                      </td>
                      <td className="py-3 text-xs opacity-70">{o.created_at?.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link href={`/${locale}/seller/orders`} className="inline-block mt-4 text-sm text-[var(--goun-earth)] goun-font-ui hover:underline">
              {t("Voir toutes les commandes →", "كل الطلبات ←")}
            </Link>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <h2 className="goun-font-ui font-medium mb-4 text-[var(--goun-forest)]">{t("Ventes (aperçu)", "المبيعات")}</h2>
            <svg viewBox="0 0 200 100" className="w-full h-32" aria-hidden>
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <rect
                  key={i}
                  x={i * 28 + 8}
                  y={100 - h}
                  width={18}
                  height={h}
                  fill="var(--goun-forest)"
                  opacity={0.35 + i * 0.08}
                  rx={4}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </GounFonts>
  );
}
