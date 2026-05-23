"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { ProductCard, ProductCardData } from "@/components/buyer/ProductCard";
import { CatalogueSkeleton } from "@/components/buyer/CatalogueSkeleton";
import { useFavoritesStore } from "@/hooks/useFavorite";

interface FavoriteItem {
  product_id: string;
  created_at: string;
  product: {
    id: string;
    seller_id: string;
    title_fr: string;
    title_ar?: string | null;
    price: number;
    authenticity_badge?: string | null;
    images?: { url: string }[];
  };
}

export default function FavorisPage() {
  const t = useTranslations("favorites");
  const router = useRouter();
  const params = useParams();
  const locale = (params.locale as string) || useLocale();
  const [items, setItems] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const hydrate = useFavoritesStore((s) => s.hydrate);

  useEffect(() => {
    if (!isAuthenticated()) {
      const redirect = encodeURIComponent(`/${locale}/favoris`);
      router.replace(`/${locale}/login?redirect=${redirect}`);
      return;
    }
    void hydrate();
    api
      .get<{ items: FavoriteItem[]; total: number }>("/favorites")
      .then(({ data }) => {
        setItems(
          data.items.map((it) => ({
            id: it.product.id,
            seller_id: it.product.seller_id,
            title_fr: it.product.title_fr,
            title_ar: it.product.title_ar,
            price: Number(it.product.price),
            image_url: it.product.images?.[0]?.url ?? null,
            authenticity_badge: Boolean(it.product.authenticity_badge),
          })),
        );
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [hydrate, locale, router]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <header className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl md:text-3xl font-bold flex items-center gap-2"
          style={{ color: "var(--deep-green)", fontFamily: "var(--font-display)" }}
        >
          <Heart className="w-6 h-6 text-red-500" fill="currentColor" />
          {t("title")}
        </h1>
        {!loading && items.length > 0 && (
          <span className="text-sm text-night/60">{t("count", { count: items.length })}</span>
        )}
      </header>

      {loading ? (
        <CatalogueSkeleton />
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <div
            className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6"
            style={{ background: "var(--warm-border)" }}
          >
            <Heart className="w-10 h-10 text-night/40" />
          </div>
          <p className="text-lg text-night/70 mb-6">{t("empty")}</p>
          <Link
            href={`/${locale}/catalogue`}
            className="inline-flex items-center px-6 py-3 rounded-full font-semibold text-white"
            style={{ background: "var(--ocre)" }}
          >
            {t("discover")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
