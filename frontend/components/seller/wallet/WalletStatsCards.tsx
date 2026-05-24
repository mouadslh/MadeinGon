"use client";

import { TrendingDown, TrendingUp, ShoppingBag, Receipt } from "lucide-react";
import { formatPrice } from "@/lib/api";

type Props = {
  revenueTotal: number;
  ordersCount: number;
  avgOrderValue: number;
  growthVsPrev: number;
  locale: string;
  rtl?: boolean;
};

export function WalletStatsCards({
  revenueTotal,
  ordersCount,
  avgOrderValue,
  growthVsPrev,
  locale,
  rtl = false,
}: Props) {
  const t = (fr: string, ar: string) => (rtl ? ar : fr);
  const growthUp = growthVsPrev >= 0;

  const cards = [
    {
      label: t("Revenus (période)", "الإيرادات (الفترة)"),
      value: formatPrice(revenueTotal, locale),
      sub: growthUp ? (
        <span className="inline-flex items-center gap-1 text-green-600 text-xs">
          <TrendingUp size={12} /> +{growthVsPrev.toFixed(1)}%
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-red-500 text-xs">
          <TrendingDown size={12} /> {growthVsPrev.toFixed(1)}%
        </span>
      ),
      icon: Receipt,
    },
    {
      label: t("Commandes", "الطلبات"),
      value: String(ordersCount),
      sub: t("sur la période", "خلال الفترة"),
      icon: ShoppingBag,
    },
    {
      label: t("Panier moyen", "متوسط السلة"),
      value: formatPrice(avgOrderValue, locale),
      sub: t("par commande", "لكل طلب"),
      icon: Receipt,
    },
  ];

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <article
            key={c.label}
            className="bg-white rounded-xl border border-[var(--goun-mist)] p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs goun-font-ui text-night/50">{c.label}</p>
              <Icon size={16} className="text-[var(--goun-forest)]/40" />
            </div>
            <p className="text-xl font-bold text-[var(--goun-forest)]">{c.value}</p>
            <div className="mt-1 text-xs text-night/50">{c.sub}</div>
          </article>
        );
      })}
    </div>
  );
}
