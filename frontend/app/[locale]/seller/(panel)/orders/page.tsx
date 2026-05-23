"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { SellerTabNav } from "@/components/seller/SellerTabNav";
import { GounFonts } from "@/components/goun/GounFonts";

type OrderRow = {
  id: string;
  reference: string;
  product_name?: string;
  buyer_city?: string;
  order_status: string;
  created_at: string;
};

export default function SellerOrdersPage() {
  const params = useParams();
  const locale = params.locale as string;
  const rtl = locale === "ar";
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/seller/orders")
      .then((r) => {
        const items = r.data?.items ?? r.data ?? [];
        setOrders(Array.isArray(items) ? items : []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const t = (fr: string, ar: string) => (rtl ? ar : fr);

  return (
    <GounFonts rtl={rtl}>
      <div dir={rtl ? "rtl" : "ltr"}>
        <SellerTabNav />
        <h1 className="text-2xl text-[var(--goun-forest)] mb-6 goun-font-display">
          {t("Mes commandes", "طلباتي")}
        </h1>
        {loading ? (
          <p className="goun-font-ui text-sm opacity-60">{t("Chargement…", "جاري التحميل…")}</p>
        ) : orders.length === 0 ? (
          <p className="goun-font-ui text-sm opacity-60">{t("Aucune commande.", "لا توجد طلبات.")}</p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <article
                key={o.id}
                className="bg-white rounded-xl border border-[var(--goun-mist)] p-4 flex flex-wrap justify-between gap-2"
              >
                <div>
                  <p className="font-medium goun-font-ui">{o.reference}</p>
                  <p className="text-sm opacity-70">{o.product_name}</p>
                </div>
                <div className="text-sm goun-font-ui text-end">
                  <span className="inline-block px-2 py-1 rounded bg-[var(--goun-mist)]">{o.order_status}</span>
                  <p className="mt-1 opacity-60">{o.buyer_city}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </GounFonts>
  );
}
