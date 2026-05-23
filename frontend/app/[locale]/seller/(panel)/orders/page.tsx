"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, formatPrice } from "@/lib/api";
import { SellerTabNav } from "@/components/seller/SellerTabNav";
import { GounFonts } from "@/components/goun/GounFonts";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Banknote, CreditCard, Package } from "lucide-react";

type OrderRow = {
  id: string;
  reference: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_address?: { city?: string; address?: string };
  items: { product_name: string; quantity: number }[];
  total_amount: number;
  payment_method: string;
  payment_status: string;
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
      .get("/seller/orders", { params: { limit: 50 } })
      .then((r) => {
        const list = r.data?.orders ?? [];
        setOrders(Array.isArray(list) ? list : []);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const t = (fr: string, ar: string) => (rtl ? ar : fr);

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      pending: t("En attente", "قيد الانتظار"),
      confirmed: t("Confirmée", "مؤكدة"),
      shipped: t("Expédiée", "مُرسَلة"),
      delivered: t("Livrée", "مُسلّمة"),
      cancelled: t("Annulée", "ملغاة"),
    };
    return map[s] ?? s;
  };

  return (
    <GounFonts rtl={rtl}>
      <div dir={rtl ? "rtl" : "ltr"}>
        <SellerTabNav />
        <h1 className="text-2xl text-[var(--goun-forest)] mb-6 goun-font-display flex items-center gap-2">
          <Package size={24} />
          {t("Mes commandes", "طلباتي")}
        </h1>

        {loading ? (
          <p className="goun-font-ui text-sm opacity-60">{t("Chargement…", "جاري التحميل…")}</p>
        ) : orders.length === 0 ? (
          <Card className="text-center py-12">
            <Package size={40} className="text-night/30 mx-auto mb-3" />
            <p className="goun-font-ui text-sm opacity-60">
              {t("Aucune commande pour le moment.", "لا توجد طلبات حالياً.")}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Card key={o.id}>
                <div className="flex flex-wrap justify-between gap-3 mb-2">
                  <div>
                    <p className="font-mono text-sm font-semibold">{o.reference}</p>
                    <p className="text-sm text-night/70 mt-1">
                      {o.buyer_name}
                      {o.buyer_phone ? ` · ${o.buyer_phone}` : ""}
                    </p>
                  </div>
                  <Badge variant={o.order_status === "delivered" ? "success" : "warning"}>
                    {statusLabel(o.order_status)}
                  </Badge>
                </div>

                <p className="text-sm text-night/60 mb-2">
                  {o.items?.[0]?.product_name}
                  {(o.items?.length ?? 0) > 1
                    ? ` +${o.items.length - 1} ${t("autre(s)", "أخرى")}`
                    : ""}
                  {" · "}
                  {new Date(o.created_at).toLocaleDateString(locale)}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm flex items-center gap-1 text-night/70">
                    {o.payment_method === "cod" ? (
                      <>
                        <Banknote size={14} /> {t("Cash à la livraison", "نقداً عند الاستلام")}
                      </>
                    ) : (
                      <>
                        <CreditCard size={14} /> {t("Carte bancaire", "بطاقة بنكية")}
                      </>
                    )}
                  </p>
                  <p className="font-mono text-ochre font-semibold">
                    {formatPrice(Number(o.total_amount), locale)}
                  </p>
                </div>

                {o.buyer_address?.city && (
                  <p className="text-xs text-night/50 mt-2">
                    {t("Livraison", "التوصيل")}: {o.buyer_address.address}, {o.buyer_address.city}
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </GounFonts>
  );
}
