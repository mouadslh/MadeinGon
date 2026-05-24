"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { Package, Plus, Pencil, Trash2, Search } from "lucide-react";
import { api, formatPrice } from "@/lib/api";
import { GounFonts } from "@/components/goun/GounFonts";

type Product = {
  id: string;
  title_fr: string;
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
  const [q, setQ] = useState("");

  useEffect(() => {
    api
      .get("/products/seller/mine", { params: { page_size: 100 } })
      .then((r) => setProducts(r.data.items || r.data || []))
      .catch(() => {});
  }, []);

  const t = (fr: string, ar: string) => (rtl ? ar : fr);
  const filtered = products.filter((p) => p.title_fr.toLowerCase().includes(q.toLowerCase()));

  const badge = (p: Product) => {
    if (!p.is_active) return { label: t("Inactif", "غير نشط"), cls: "bg-gray-200 text-gray-700" };
    if (!p.is_moderated) return { label: t("En révision", "قيد المراجعة"), cls: "bg-[var(--goun-gold)]/25 text-[var(--goun-charcoal)]" };
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

        <label className="relative block mb-6 max-w-md">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--goun-charcoal)]/40" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("Rechercher...", "بحث...")}
            className="w-full ps-10 pe-4 py-2.5 rounded-full border border-[var(--goun-mist)] bg-white goun-font-ui"
          />
        </label>

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
              {filtered.map((p) => {
                const b = badge(p);
                return (
                  <tr key={p.id} className="border-b border-[var(--goun-mist)]/60">
                    <td className="p-4 flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[var(--goun-mist)] shrink-0">
                        <RemoteImage src={p.images?.[0]?.url} alt="" fill className="object-cover" sizes="48px" fallback={<span>🏺</span>} />
                      </div>
                      <span className="font-medium truncate max-w-[200px]">{p.title_fr}</span>
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
          {filtered.map((p) => {
            const b = badge(p);
            return (
              <article key={p.id} className="bg-white rounded-xl border p-4 flex gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-[var(--goun-mist)]">
                  <RemoteImage src={p.images?.[0]?.url} alt="" fill className="object-cover" sizes="80px" fallback={<span className="flex items-center justify-center h-full">🏺</span>} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.title_fr}</p>
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
