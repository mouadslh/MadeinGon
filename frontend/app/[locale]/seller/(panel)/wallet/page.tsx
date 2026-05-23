"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, formatPrice } from "@/lib/api";
import { SellerTabNav } from "@/components/seller/SellerTabNav";
import { GounFonts } from "@/components/goun/GounFonts";

type WalletSummary = {
  balance?: number;
  pending_payout?: number;
  total_earned?: number;
};

export default function SellerWalletPage() {
  const params = useParams();
  const locale = params.locale as string;
  const rtl = locale === "ar";
  const [wallet, setWallet] = useState<WalletSummary>({});

  useEffect(() => {
    api.get("/seller/wallet").then((r) => setWallet(r.data)).catch(() => {});
  }, []);

  const t = (fr: string, ar: string) => (rtl ? ar : fr);

  return (
    <GounFonts rtl={rtl}>
      <div dir={rtl ? "rtl" : "ltr"}>
        <SellerTabNav />
        <h1 className="text-2xl text-[var(--goun-forest)] mb-6 goun-font-display">
          {t("Wallet & revenus", "المحفظة والإيرادات")}
        </h1>
        <div className="grid md:grid-cols-3 gap-4">
          <article className="bg-white rounded-xl border border-[var(--goun-mist)] p-6">
            <p className="text-sm goun-font-ui opacity-60">{t("Solde disponible", "الرصيد المتاح")}</p>
            <p className="text-2xl font-bold mt-2">{formatPrice(wallet.balance ?? 0, locale)}</p>
          </article>
          <article className="bg-white rounded-xl border border-[var(--goun-mist)] p-6">
            <p className="text-sm goun-font-ui opacity-60">{t("En attente", "قيد الانتظار")}</p>
            <p className="text-2xl font-bold mt-2">{formatPrice(wallet.pending_payout ?? 0, locale)}</p>
          </article>
          <article className="bg-white rounded-xl border border-[var(--goun-mist)] p-6">
            <p className="text-sm goun-font-ui opacity-60">{t("Total gagné", "إجمالي الأرباح")}</p>
            <p className="text-2xl font-bold mt-2">{formatPrice(wallet.total_earned ?? 0, locale)}</p>
          </article>
        </div>
      </div>
    </GounFonts>
  );
}
