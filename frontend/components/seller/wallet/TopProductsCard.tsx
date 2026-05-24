"use client";

import { formatPrice } from "@/lib/api";
import { Trophy } from "lucide-react";

type TopProduct = {
  product_name: string;
  revenue: number;
  units_sold: number;
};

type Props = {
  products: TopProduct[];
  locale: string;
  rtl?: boolean;
};

const MEDALS = ["🥇", "🥈", "🥉"];

export function TopProductsCard({ products, locale, rtl = false }: Props) {
  const t = (fr: string, ar: string) => (rtl ? ar : fr);
  const maxRevenue = Math.max(...products.map((p) => p.revenue), 1);

  return (
    <article className="bg-white rounded-xl border border-[var(--goun-mist)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={18} className="text-[var(--goun-earth)]" />
        <h2 className="text-sm font-semibold text-[var(--goun-forest)] goun-font-ui">
          {t("Top ventes", "أفضل المبيعات")}
        </h2>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-night/40 goun-font-ui py-8 text-center">
          {t("Aucune vente enregistrée.", "لا توجد مبيعات مسجلة.")}
        </p>
      ) : (
        <ul className="space-y-4">
          {products.map((p, i) => (
            <li key={`${p.product_name}-${i}`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">{MEDALS[i] ?? `${i + 1}.`}</span>
                  <span className="text-sm font-medium truncate">{p.product_name}</span>
                </div>
                <span className="text-sm font-mono text-[var(--goun-earth)] shrink-0">
                  {formatPrice(p.revenue, locale)}
                </span>
              </div>
              <div className="h-2 bg-[var(--goun-mist)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--goun-forest)]"
                  style={{ width: `${(p.revenue / maxRevenue) * 100}%` }}
                />
              </div>
              <p className="text-xs text-night/50 mt-1">
                {p.units_sold} {t("unité(s) vendue(s)", "وحدة مباعة")}
              </p>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
