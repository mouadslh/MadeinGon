"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

const STATUS_KEYS = ["all", "flagged", "approved", "removed"] as const;

export default function AdminReviewsPage() {
  const t = useTranslations("admin.reviews");
  const [items, setItems] = useState<{ id: string; comment?: string; review_status: string }[]>([]);
  const [status, setStatus] = useState("all");

  const load = () => api.get("/admin/reviews", { params: { status } }).then((r) => setItems(r.data.items || []));
  useEffect(() => {
    load().catch(() => {});
  }, [status]);

  const filterLabel = (s: (typeof STATUS_KEYS)[number]) => {
    const map: Record<(typeof STATUS_KEYS)[number], string> = {
      all: t("filterAll"),
      flagged: t("filterFlagged"),
      approved: t("filterApproved"),
      removed: t("filterRemoved"),
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
        {items.map((r) => (
          <div
            key={r.id}
            className="card-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="text-sm break-words min-w-0">
              {r.comment || t("noComment")} — {r.review_status}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <Button variant="secondary" className="text-xs w-full sm:w-auto" onClick={() => api.patch(`/admin/reviews/${r.id}/approve`).then(load)}>
                {t("approve")}
              </Button>
              <Button
                variant="outline"
                className="text-xs w-full sm:w-auto"
                onClick={() => api.patch(`/admin/reviews/${r.id}/remove`, { reason: "Policy" }).then(load)}
              >
                {t("remove")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
