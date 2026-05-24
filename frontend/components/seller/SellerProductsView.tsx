"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { Package, Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { api, formatPrice } from "@/lib/api";
import {
  getSellerProductDisplayStatus,
  matchesSellerStatusFilter,
  type SellerProductStatusFilter,
} from "@/lib/product-status";
import { getProductTitle, productMatchesSearch } from "@/lib/product-title";
import { GounFonts } from "@/components/goun/GounFonts";

const STATUS_FILTERS: { id: SellerProductStatusFilter; fr: string; ar: string }[] = [
  { id: "all", fr: "Tous", ar: "الكل" },
  { id: "active", fr: "Actifs", ar: "نشط" },
  { id: "pending", fr: "En révision", ar: "قيد المراجعة" },
  { id: "rejected", fr: "Refusés", ar: "مرفوض" },
  { id: "inactive", fr: "Inactifs", ar: "غير نشط" },
];

type Product = {
  id: string;
  title_fr: string;
  title_ar?: string | null;
  price: number;
  stock: number;
  status?: string;
  is_active: boolean;
  is_moderated?: boolean;
  images?: { url: string }[];
};

export function SellerProductsView() {
  const params = useParams();
  const locale = params.locale as string;
  const rtl = locale === "ar";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<SellerProductStatusFilter>("all");
  const t = (fr: string, ar: string) => (rtl ? ar : fr);

  const loadProducts = () => {
    setLoading(true);
    setLoadError(null);
    api
      .get("/products/seller/mine", { params: { page_size: 100 } })
      .then((r) => {
        const items = (r.data?.items ?? r.data ?? []) as Product[];
        setProducts(
          items.map((p) => ({
            ...p,
            price: typeof p.price === "string" ? parseFloat(p.price) : Number(p.price),
          }))
        );
      })
      .catch((err: { response?: { data?: { detail?: string } } }) => {
        setProducts([]);
        const detail = err.response?.data?.detail;
        setLoadError(
          typeof detail === "string"
            ? detail
            : t("Impossible de charger vos produits.", "تعذر تحميل منتجاتك.")
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusCounts = products.reduce(
    (acc, p) => {
      acc.all += 1;
      acc[getSellerProductDisplayStatus(p)] += 1;
      return acc;
    },
    { all: 0, active: 0, pending: 0, rejected: 0, inactive: 0 }
  );

  const filtered = products.filter((p) => {
    const matchSearch = productMatchesSearch(p, q);
    const matchStatus = matchesSellerStatusFilter(p, statusFilter);
    return matchSearch && matchStatus;
  });

  const badge = (p: Product) => {
    const key = getSellerProductDisplayStatus(p);
    if (key === "rejected") {
      return { label: t("Refusé", "مرفوض"), cls: "bg-red-100 text-red-800" };
    }
    if (key === "inactive") {
      return { label: t("Inactif", "غير نشط"), cls: "bg-gray-200 text-gray-700" };
    }
    if (key === "pending") {
      return { label: t("En révision", "قيد المراجعة"), cls: "bg-[var(--goun-gold)]/25 text-[var(--goun-charcoal)]" };
    }
    return { label: t("Actif", "نشط"), cls: "bg-[var(--goun-forest)]/15 text-[var(--goun-forest)]" };
  };

  return (
    <GounFonts rtl={rtl}>
      <div dir={rtl ? "rtl" : "ltr"}>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className={`text-2xl text-[var(--goun-forest)] flex items-center gap-2 ${rtl ? "goun-font-ar" : "goun-font-display"}`}>
            <Package size={24} />
            {t("Mes produits", "منتجاتي")}
          </h1>
          <Link
            href={`/${locale}/seller/products/new`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--goun-earth)] text-white goun-font-ui text-sm hover:bg-[var(--goun-forest)] min-h-tap"
          >
            <Plus size={16} />
            {t("Nouveau produit", "منتج جديد")}
          </Link>
        </div>

        {loading && (
          <p className="flex items-center gap-2 text-[var(--goun-charcoal)]/70 mb-6 goun-font-ui">
            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
            {t("Chargement…", "جاري التحميل…")}
          </p>
        )}

        {loadError && !loading && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 goun-font-ui">
            <p>{loadError}</p>
            <button
              type="button"
              onClick={loadProducts}
              className="mt-2 underline font-medium"
            >
              {t("Réessayer", "إعادة المحاولة")}
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4 mb-6">
          <label className="relative block max-w-md w-full">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--goun-charcoal)]/40" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Rechercher...", "بحث...")}
              className="w-full ps-10 pe-4 py-2.5 rounded-full border border-[var(--goun-mist)] bg-white goun-font-ui"
            />
          </label>

          <div
            className="flex flex-wrap gap-2 goun-font-ui"
            role="group"
            aria-label={t("Filtrer par statut", "تصفية حسب الحالة")}
          >
            {STATUS_FILTERS.map((opt) => {
              const count = statusCounts[opt.id];
              const active = statusFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStatusFilter(opt.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border min-h-tap transition-colors ${
                    active
                      ? "bg-[var(--goun-forest)] text-white border-[var(--goun-forest)]"
                      : "bg-white text-[var(--goun-charcoal)] border-[var(--goun-mist)] hover:border-[var(--goun-forest)]/40"
                  }`}
                  aria-pressed={active}
                >
                  {rtl ? opt.ar : opt.fr}
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      active ? "bg-white/20" : "bg-[var(--goun-mist)]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto bg-white rounded-xl border">
          <table className="w-full text-sm goun-font-ui">
            <thead>
              <tr className="border-b text-[var(--goun-charcoal)]/50">
                <th className="p-4 text-start">{t("Produit", "المنتج")}</th>
                <th className="p-4 text-start">{t("Prix", "السعر")}</th>
                <th className="p-4 text-start">{t("Statut", "الحالة")}</th>
                <th className="p-4 text-end">{t("Actions", "إجراءات")}</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[var(--goun-charcoal)]/60">
                    {q || statusFilter !== "all"
                      ? t("Aucun produit ne correspond aux filtres.", "لا يوجد منتج يطابق الفلاتر.")
                      : t("Vous n'avez pas encore de produits.", "لا توجد منتجات بعد.")}
                  </td>
                </tr>
              )}
              {filtered.map((p) => {
                const b = badge(p);
                const displayTitle = getProductTitle(p, locale);
                return (
                  <tr key={p.id} className="border-b border-[var(--goun-mist)]/60">
                    <td className="p-4 flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[var(--goun-mist)] shrink-0">
                        <RemoteImage src={p.images?.[0]?.url} alt="" fill className="object-cover" sizes="48px" fallback={<Package className="w-5 h-5 m-auto text-[var(--goun-charcoal)]/30" />} />
                      </div>
                      <span className={`font-medium truncate max-w-[200px] ${rtl ? "goun-font-ar" : ""}`}>{displayTitle}</span>
                    </td>
                    <td className="p-4 text-[var(--goun-earth)] font-semibold">{formatPrice(Number(p.price), locale)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${b.cls}`}>{b.label}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" className="p-2 rounded-lg hover:bg-[var(--goun-mist)] min-h-tap" aria-label={t("Modifier", "تعديل")}>
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button type="button" className="p-2 rounded-lg hover:bg-red-50 text-red-600 min-h-tap" aria-label={t("Supprimer", "حذف")}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="md:hidden grid gap-4">
          {!loading && filtered.length === 0 && (
            <p className="text-center py-8 text-[var(--goun-charcoal)]/60 goun-font-ui">
              {q || statusFilter !== "all"
                ? t("Aucun produit ne correspond aux filtres.", "لا يوجد منتج يطابق الفلاتر.")
                : t("Vous n'avez pas encore de produits.", "لا توجد منتجات بعد.")}
            </p>
          )}
          {filtered.map((p) => {
            const b = badge(p);
            const displayTitle = getProductTitle(p, locale);
            return (
              <article key={p.id} className="bg-white rounded-xl border p-4 flex gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-[var(--goun-mist)]">
                  <RemoteImage src={p.images?.[0]?.url} alt="" fill className="object-cover" sizes="80px" fallback={<Package className="w-6 h-6 m-auto text-[var(--goun-charcoal)]/30" />} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${rtl ? "goun-font-ar" : ""}`}>{displayTitle}</p>
                  <p className="text-[var(--goun-earth)] font-semibold text-sm">{formatPrice(Number(p.price), locale)}</p>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs ${b.cls}`}>{b.label}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </GounFonts>
  );
}
