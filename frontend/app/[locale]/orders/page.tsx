"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Banknote, Package, Clock } from "lucide-react";
import { api, formatPrice } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type Order = {
  id: string;
  reference?: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total: number;
  created_at: string;
  items: { quantity: number; unit_price: number }[];
};

export default function BuyerOrdersPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/orders/buyer/history")
      .then((r) => setOrders(r.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const t = (fr: string, ar: string) => (locale === "ar" ? ar : fr);

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      PENDING: t("En attente", "قيد الانتظار"),
      CONFIRMED: t("Confirmée", "مؤكدة"),
      SHIPPED: t("En livraison", "قيد التوصيل"),
      DELIVERED: t("Livrée", "مُسلّمة"),
      CANCELLED: t("Annulée", "ملغاة"),
    };
    return map[s] || s;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl text-ochre mb-6 flex items-center gap-2">
        <Package size={28} />
        {t("Mes commandes", "طلباتي")}
      </h1>

      {loading && <p className="text-night/50">{t("Chargement…", "جاري التحميل…")}</p>}

      {!loading && orders.length === 0 && (
        <Card className="text-center py-12">
          <Clock size={40} className="text-night/30 mx-auto mb-3" />
          <p className="text-night/60 mb-4">{t("Aucune commande", "لا توجد طلبات")}</p>
          <Link href={`/${locale}/catalogue`} className="text-ochre hover:underline">
            {t("Voir le catalogue", "عرض الكتالوج")}
          </Link>
        </Card>
      )}

      <ul className="space-y-4">
        {orders.map((o) => (
          <li key={o.id}>
            <Card>
              <div className="flex flex-wrap justify-between gap-2 mb-2">
                <span className="font-mono text-sm">{o.reference || o.id.slice(0, 8)}</span>
                <Badge variant={o.status === "DELIVERED" ? "success" : "warning"}>
                  {statusLabel(o.status)}
                </Badge>
              </div>
              <p className="text-sm text-night/60 flex items-center gap-1 mb-2">
                {o.payment_method === "COD" ? (
                  <>
                    <Banknote size={14} /> {t("Cash à la livraison", "نقداً عند الاستلام")}
                  </>
                ) : (
                  o.payment_method
                )}
                {" · "}
                {new Date(o.created_at).toLocaleDateString(locale)}
              </p>
              <p className="font-mono text-ochre">{formatPrice(Number(o.total), locale)}</p>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
