"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { ProductCard, ProductCardData } from "@/components/buyer/ProductCard";

interface RecommendationCarouselProps {
  productId?: string;
  limit?: number;
}

export function RecommendationCarousel({ productId, limit = 6 }: RecommendationCarouselProps) {
  const t = useTranslations("recommendations");
  const [items, setItems] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params: Record<string, string | number> = { limit };
    if (productId) params.product_id = productId;
    api
      .get("/ai/recommendations", { params })
      .then((r) => {
        const list = (r.data.items || []) as ProductCardData[];
        setItems(
          list.map((p) => ({
            id: p.id,
            seller_id: p.seller_id,
            title_fr: p.title_fr,
            title_ar: p.title_ar,
            price: p.price,
            image_url: p.image_url,
            authenticity_badge: p.authenticity_badge,
            reason: p.reason,
          }))
        );
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [productId, limit]);

  if (!loading && items.length === 0) return null;

  return (
    <section className="py-8">
      <h2 className="font-display text-xl text-ochre mb-4">{t("title")}</h2>
      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-48 shrink-0 aspect-square rounded-card skeleton-shimmer" />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
          {items.map((p) => (
            <div key={p.id} className="w-56 shrink-0 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
