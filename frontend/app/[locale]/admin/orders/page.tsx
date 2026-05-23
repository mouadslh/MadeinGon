"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

const STATUS_KEYS = ["all", "pending", "processing", "shipped", "delivered", "disputed"] as const;

export default function AdminOrdersPage() {
  const t = useTranslations("admin.orders");
  const [items, setItems] = useState<{ id: string; status: string }[]>([]);
  const [status, setStatus] = useState("all");

  const load = () => api.get("/admin/orders", { params: { status } }).then((r) => setItems(r.data.items || []));
  useEffect(() => {
    load().catch(() => {});
  }, [status]);

  const filterLabel = (s: (typeof STATUS_KEYS)[number]) => {
    const map: Record<(typeof STATUS_KEYS)[number], string> = {
      all: t("filterAll"),
      pending: t("filterPending"),
      processing: t("filterProcessing"),
      shipped: t("filterShipped"),
      delivered: t("filterDelivered"),
      disputed: t("filterDisputed"),
    };
    return map[s];
  };

  return (
    <div className="max-w-6xl w-full space-y-4">
      <h1 className="font-display text-xl sm:text-2xl text-ochre mb-2">{t("title")}</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_KEYS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`px-3 py-2 rounded-card text-sm min-h-tap ${
              status === s ? "bg-ochre text-white" : "bg-dune hover:bg-dune/80"
            }`}
          >
            {filterLabel(s)}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {items.map((o) => (
          <div
            key={o.id}
            className={`card-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              o.status === "DISPUTED" ? "border-s-4 border-amber-500" : ""
            }`}
          >
            <div className="font-mono text-sm">
              #{o.id.slice(0, 8)} — {o.status}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                className="text-xs w-full sm:w-auto"
                onClick={() => api.patch(`/admin/orders/${o.id}/flag`, { note: "Needs review" }).then(load)}
              >
                {t("flag")}
              </Button>
              <Button
                variant="secondary"
                className="text-xs w-full sm:w-auto"
                onClick={() => api.patch(`/admin/orders/${o.id}/resolve`, { resolution: "Resolved by admin" }).then(load)}
              >
                {t("resolve")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
