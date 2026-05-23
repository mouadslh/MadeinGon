"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AdminProductDetailModal } from "@/components/admin/AdminProductDetailModal";

const STATUS_KEYS = ["all", "pending", "approved", "rejected"] as const;

export default function AdminProductsPage() {
  const t = useTranslations("admin.products");
  const tc = useTranslations("common");
  const [items, setItems] = useState<{ id: string; title_fr: string; status: string }[]>([]);
  const [status, setStatus] = useState("pending");
  const [detailId, setDetailId] = useState<string | null>(null);

  const load = () => api.get("/admin/products", { params: { status } }).then((r) => setItems(r.data.items || []));

  useEffect(() => {
    load().catch(() => {});
  }, [status]);

  const filterLabel = (s: string) => {
    if (s === "all") return t("filterAll");
    if (s === "pending") return t("filterPending");
    if (s === "approved") return t("filterApproved");
    return t("filterRejected");
  };

  const removeFromList = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="max-w-6xl w-full space-y-4">
      <h1 className="font-display text-xl sm:text-2xl text-ochre">{t("title")}</h1>
      <div className="flex flex-wrap gap-2">
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
      <Card>
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-sm min-w-[400px]">
            <thead>
              <tr className="border-b border-dune text-start">
                <th className="py-2 pe-3">{t("name")}</th>
                <th className="py-2 pe-3">{t("status")}</th>
                <th className="py-2">{tc("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-dune/60">
                  <td className="py-3 pe-3">{p.title_fr}</td>
                  <td className="py-3 pe-3">{p.status}</td>
                  <td className="py-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="outline" className="text-xs" onClick={() => setDetailId(p.id)}>
                        {t("viewDetails")}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AdminProductDetailModal
        productId={detailId}
        onClose={() => setDetailId(null)}
        onUpdated={() => {
          if (detailId) removeFromList(detailId);
          load().catch(() => {});
        }}
      />
    </div>
  );
}
