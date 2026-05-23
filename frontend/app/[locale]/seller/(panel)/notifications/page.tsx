"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Bell,
  ShoppingCart,
  BadgeCheck,
  Truck,
  PackageCheck,
  PackageX,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  ShieldX,
  MessageSquare,
  X,
  Check,
} from "lucide-react";
import { api } from "@/lib/api";

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
};

const notifIcon: Record<string, React.ReactNode> = {
  new_order: <ShoppingCart size={16} className="text-blue-500" />,
  order_paid: <BadgeCheck size={16} className="text-green-500" />,
  order_shipped: <Truck size={16} className="text-indigo-500" />,
  order_delivered: <PackageCheck size={16} className="text-emerald-600" />,
  order_cancelled: <PackageX size={16} className="text-red-500" />,
  low_stock: <AlertTriangle size={16} className="text-orange-500" />,
  out_of_stock: <AlertCircle size={16} className="text-red-600" />,
  product_approved: <ShieldCheck size={16} className="text-green-600" />,
  product_rejected: <ShieldX size={16} className="text-red-500" />,
  new_review: <MessageSquare size={16} className="text-yellow-500" />,
};

const TYPE_FILTERS = [
  "all",
  "new_order",
  "order_paid",
  "order_shipped",
  "order_delivered",
  "low_stock",
  "out_of_stock",
] as const;

export default function SellerNotificationsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const [items, setItems] = useState<Notif[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);

  const load = () => {
    api
      .get("/seller/notifications", {
        params: {
          page,
          limit: 20,
          unread_only: unreadOnly,
          type: filter === "all" ? undefined : filter,
        },
      })
      .then((r) => setItems(r.data.notifications || []))
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, [filter, unreadOnly, page]);

  const markRead = async (id: string) => {
    await api.patch(`/seller/notifications/${id}/read`);
    load();
  };

  const remove = async (id: string) => {
    await api.delete(`/seller/notifications/${id}`);
    load();
  };

  const t = (fr: string, ar: string) => (locale === "ar" ? ar : fr);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="font-display text-2xl text-ochre mb-6 flex items-center gap-2">
        <Bell size={24} />
        {t("Notifications", "الإشعارات")}
      </h1>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setUnreadOnly(false)}
          className={`px-3 py-1 rounded-full text-sm ${!unreadOnly ? "bg-ochre text-white" : "bg-dune"}`}
        >
          {t("Toutes", "الكل")}
        </button>
        <button
          type="button"
          onClick={() => setUnreadOnly(true)}
          className={`px-3 py-1 rounded-full text-sm ${unreadOnly ? "bg-ochre text-white" : "bg-dune"}`}
        >
          {t("Non lues", "غير مقروءة")}
        </button>
        {TYPE_FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${filter === f ? "bg-night text-white" : "bg-dune"}`}
          >
            {f !== "all" && notifIcon[f]}
            {f === "all" ? t("Types", "الأنواع") : f.replace("_", " ")}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={48} className="text-night/30 mx-auto mb-4" />
          <p className="text-night/60">{t("Aucune notification pour le moment", "لا توجد إشعارات حالياً")}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n) => (
            <li
              key={n.id}
              className={`flex gap-3 p-4 rounded-card border border-dune ${!n.is_read ? "bg-ochre/5" : "bg-white"}`}
            >
              <span className="mt-1">{notifIcon[n.type] || <Bell size={16} />}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{n.title}</p>
                <p className="text-sm text-night/60">{n.body}</p>
                <p className="text-xs text-night/40 mt-1">{new Date(n.created_at).toLocaleString(locale)}</p>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                {!n.is_read && (
                  <button type="button" onClick={() => markRead(n.id)} className="p-1 hover:text-ochre" title="Marquer lue">
                    <Check size={14} />
                  </button>
                )}
                <button type="button" onClick={() => remove(n.id)} className="p-1 hover:text-red-600" title="Supprimer">
                  <X size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex justify-center gap-2 mt-6">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-3 py-1 text-sm bg-dune rounded-card disabled:opacity-50"
        >
          {t("Préc.", "السابق")}
        </button>
        <button
          type="button"
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 text-sm bg-dune rounded-card"
        >
          {t("Suiv.", "التالي")}
        </button>
      </div>
    </div>
  );
}
