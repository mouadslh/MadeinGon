"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, formatPrice } from "@/lib/api";
import { GounFonts } from "@/components/goun/GounFonts";
import { SalesChart } from "@/components/seller/wallet/SalesChart";
import { TopProductsCard } from "@/components/seller/wallet/TopProductsCard";
import { WalletStatsCards } from "@/components/seller/wallet/WalletStatsCards";
import { Download, Wallet } from "lucide-react";

type WalletData = {
  available?: number;
  total_pending?: number;
  total_earned?: number;
  total_paid_out?: number;
};

type WalletStats = {
  revenue_by_day: { date: string; amount: number }[];
  top_products: { product_name: string; revenue: number; units_sold: number }[];
  orders_count: number;
  avg_order_value: number;
  revenue_total: number;
  growth_vs_prev: number;
};

const PERIODS = [
  { key: "7d", days: 7, fr: "7 jours", ar: "7 أيام" },
  { key: "30d", days: 30, fr: "30 jours", ar: "30 يوماً" },
  { key: "90d", days: 90, fr: "90 jours", ar: "90 يوماً" },
] as const;

export default function SellerWalletPage() {
  const params = useParams();
  const locale = params.locale as string;
  const rtl = locale === "ar";
  const [wallet, setWallet] = useState<WalletData>({});
  const [stats, setStats] = useState<WalletStats | null>(null);
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["key"]>("30d");
  const [loading, setLoading] = useState(true);

  const periodConfig = PERIODS.find((p) => p.key === period) ?? PERIODS[1];

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get("/seller/wallet"),
      api.get("/seller/wallet/stats", { params: { period } }),
    ])
      .then(([w, s]) => {
        setWallet(w.data);
        setStats(s.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const t = (fr: string, ar: string) => (rtl ? ar : fr);

  const exportCsv = async () => {
    try {
      const res = await api.get("/seller/wallet/export", {
        params: { period, format: "csv" },
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wallet-${period}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      /* export failed */
    }
  };

  return (
    <GounFonts rtl={rtl}>
      <div dir={rtl ? "rtl" : "ltr"} className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl text-[var(--goun-forest)] goun-font-display flex items-center gap-2">
            <Wallet size={24} />
            {t("Wallet & revenus", "المحفظة والإيرادات")}
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-[var(--goun-mist)] overflow-hidden">
              {PERIODS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriod(p.key)}
                  className={`px-3 py-1.5 text-xs goun-font-ui transition-colors ${
                    period === p.key
                      ? "bg-[var(--goun-forest)] text-white"
                      : "bg-white text-night/70 hover:bg-[var(--goun-mist)]/50"
                  }`}
                >
                  {rtl ? p.ar : p.fr}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={exportCsv}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-[var(--goun-mist)] hover:bg-white goun-font-ui"
            >
              <Download size={14} />
              CSV
            </button>
          </div>
        </div>

        {/* Solde */}
        <div className="grid md:grid-cols-3 gap-4">
          <article className="bg-white rounded-xl border border-[var(--goun-mist)] p-6">
            <p className="text-sm goun-font-ui opacity-60">{t("Solde disponible", "الرصيد المتاح")}</p>
            <p className="text-2xl font-bold mt-2 text-[var(--goun-forest)]">
              {formatPrice(wallet.available ?? 0, locale)}
            </p>
          </article>
          <article className="bg-white rounded-xl border border-[var(--goun-mist)] p-6">
            <p className="text-sm goun-font-ui opacity-60">{t("En attente", "قيد الانتظار")}</p>
            <p className="text-2xl font-bold mt-2 text-[var(--goun-earth)]">
              {formatPrice(wallet.total_pending ?? 0, locale)}
            </p>
          </article>
          <article className="bg-white rounded-xl border border-[var(--goun-mist)] p-6">
            <p className="text-sm goun-font-ui opacity-60">{t("Total gagné", "إجمالي الأرباح")}</p>
            <p className="text-2xl font-bold mt-2">{formatPrice(wallet.total_earned ?? 0, locale)}</p>
          </article>
        </div>

        {loading ? (
          <p className="text-sm text-night/50 goun-font-ui">{t("Chargement…", "جاري التحميل…")}</p>
        ) : stats ? (
          <>
            <WalletStatsCards
              revenueTotal={stats.revenue_total}
              ordersCount={stats.orders_count}
              avgOrderValue={stats.avg_order_value}
              growthVsPrev={stats.growth_vs_prev}
              locale={locale}
              rtl={rtl}
            />

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SalesChart
                  data={stats.revenue_by_day}
                  locale={locale}
                  rtl={rtl}
                  periodDays={periodConfig.days}
                />
              </div>
              <TopProductsCard products={stats.top_products} locale={locale} rtl={rtl} />
            </div>
          </>
        ) : null}
      </div>
    </GounFonts>
  );
}
