"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Grid3X3, LayoutGrid, ChevronDown, ChevronUp, MapPin, Search, Star } from "lucide-react";
import { CategoryIcon } from "@/components/categories/CategoryIcon";
import { ProductGrid } from "@/components/buyer/ProductGrid";
import { ProductCard, ProductCardData } from "@/components/buyer/ProductCard";
import { CatalogueSkeleton } from "@/components/buyer/CatalogueSkeleton";
import { GounFonts } from "@/components/goun/GounFonts";
import { api } from "@/lib/api";
import { PRODUCT_CATEGORIES, normalizeCategorySlugs, sortCategories } from "@/lib/categories";
import { getCopy, isRtl, localeToGounLang } from "@/lib/goun-copy";

const CITIES = ["Guelmim", "Tan-Tan", "Sidi Ifni", "Assa-Zag"];

type CategoryOption = { slug: string; name_fr: string; name_ar: string };

function FilterSidebar({
  rtl,
  lang,
  copy,
  categories,
  selectedCats,
  setSelectedCats,
  selectedCities,
  setSelectedCities,
  priceRange,
  setPriceRange,
  minRating,
  setMinRating,
  verifiedOnly,
  setVerifiedOnly,
  onReset,
}: {
  rtl: boolean;
  lang: ReturnType<typeof localeToGounLang>;
  copy: ReturnType<typeof getCopy>;
  categories: CategoryOption[];
  selectedCats: string[];
  setSelectedCats: (v: string[]) => void;
  selectedCities: string[];
  setSelectedCities: (v: string[]) => void;
  priceRange: [number, number];
  setPriceRange: (v: [number, number]) => void;
  minRating: number;
  setMinRating: (n: number) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (b: boolean) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    cat: true,
    city: true,
    price: true,
    rating: true,
    verified: true,
  });

  const toggle = (key: string) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  const toggleCat = (id: string) => {
    setSelectedCats(selectedCats.includes(id) ? selectedCats.filter((x) => x !== id) : [...selectedCats, id]);
  };

  const toggleCity = (city: string) => {
    setSelectedCities(
      selectedCities.includes(city) ? selectedCities.filter((x) => x !== city) : [...selectedCities, city]
    );
  };

  return (
    <aside className="w-full lg:w-[280px] shrink-0 space-y-4 goun-font-ui">
      <h2 className={`text-lg font-semibold text-[var(--goun-forest)] ${rtl ? "goun-font-ar text-end" : "goun-font-display"}`}>
        {copy.catalogue.filter as string}
      </h2>

      {[
        { key: "cat", title: rtl ? "الفئة" : "Catégorie", content: (
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <label className="flex items-center gap-2 cursor-pointer min-h-tap">
                  <input
                    type="checkbox"
                    checked={selectedCats.includes(c.slug)}
                    onChange={() => toggleCat(c.slug)}
                    className="accent-[var(--goun-forest)]"
                  />
                  <CategoryIcon slug={c.slug} className="w-4 h-4 text-[var(--goun-earth)] shrink-0" />
                  <span>{rtl ? c.name_ar : c.name_fr}</span>
                </label>
              </li>
            ))}
          </ul>
        )},
        { key: "city", title: rtl ? "المدينة" : "Ville d'origine", content: (
          <ul className="space-y-2">
            {CITIES.map((city) => (
              <li key={city}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCities.includes(city)}
                    onChange={() => toggleCity(city)}
                    className="accent-[var(--goun-forest)]"
                  />
                  <MapPin className="w-3.5 h-3.5 text-[var(--goun-earth)]" />
                  {city}
                </label>
              </li>
            ))}
          </ul>
        )},
        { key: "price", title: rtl ? "السعر (درهم)" : "Prix (MAD)", content: (
          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={2000}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full accent-[var(--goun-earth)]"
              aria-label={rtl ? "الحد الأقصى للسعر" : "Prix maximum"}
            />
            <p className="text-xs text-[var(--goun-charcoal)]/70">
              {priceRange[0]} — {priceRange[1]} MAD
            </p>
          </div>
        )},
        { key: "rating", title: rtl ? "التقييم" : "Note minimum", content: (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMinRating(n)}
                className="min-h-tap min-w-tap p-1"
                aria-label={`${n} stars`}
              >
                <Star
                  className={`w-5 h-5 ${
                    n <= minRating ? "fill-[var(--goun-gold)] text-[var(--goun-gold)]" : "text-[var(--goun-mist)]"
                  }`}
                />
              </button>
            ))}
          </div>
        )},
        { key: "verified", title: rtl ? "حرفي موثق" : "Artisan vérifié", content: (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="sr-only peer"
            />
            <span
              className={`w-11 h-6 rounded-full transition-colors relative ${
                verifiedOnly ? "bg-[var(--goun-forest)]" : "bg-[var(--goun-mist)]"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  verifiedOnly ? (rtl ? "start-0.5" : "translate-x-5") : "start-0.5"
                }`}
              />
            </span>
            <span className="text-sm">{rtl ? "موثق GON فقط" : "Vérifié GON uniquement"}</span>
          </label>
        )},
      ].map((section) => (
        <div key={section.key} className="rounded-xl border border-[var(--goun-mist)] bg-white p-4">
          <button
            type="button"
            onClick={() => toggle(section.key)}
            className="w-full flex justify-between items-center font-medium text-[var(--goun-forest)] mb-2"
          >
            {section.title}
            {open[section.key] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {open[section.key] && section.content}
        </div>
      ))}

      <button
        type="button"
        onClick={onReset}
        className="text-sm text-[var(--goun-earth)] hover:underline w-full text-start"
      >
        {copy.catalogue.reset as string}
      </button>
    </aside>
  );
}

const SORT_TO_API: Record<number, string> = {
  0: "recent",
  1: "price_asc",
  2: "price_desc",
};
const API_TO_SORT: Record<string, number> = {
  recent: 0,
  price_asc: 1,
  price_desc: 2,
};

function CatalogueInner() {
  const locale = useLocale();
  const lang = localeToGounLang(locale);
  const rtl = isRtl(lang);
  const copy = getCopy(lang);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Hydrate les filtres depuis l'URL
  const initialCats = searchParams.get("category")
    ? normalizeCategorySlugs((searchParams.get("category") as string).split(","))
    : [];
  const initialCities = searchParams.get("region")
    ? (searchParams.get("region") as string).split(",").filter(Boolean)
    : [];
  const initialMin = Number(searchParams.get("min_price") ?? 0) || 0;
  const initialMax = Number(searchParams.get("max_price") ?? 2000) || 2000;
  const initialVerified = searchParams.get("verified") === "true";
  const initialSort = API_TO_SORT[searchParams.get("sort_by") ?? "recent"] ?? 0;

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>(
    PRODUCT_CATEGORIES.map((c) => ({ slug: c.slug, name_fr: c.name_fr, name_ar: c.name_ar }))
  );
  const [loading, setLoading] = useState(true);
  const [totalServer, setTotalServer] = useState(0);
  const [sortIdx, setSortIdx] = useState(initialSort);
  const [viewGrid, setViewGrid] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [selectedCats, setSelectedCats] = useState<string[]>(initialCats);
  const [selectedCities, setSelectedCities] = useState<string[]>(initialCities);
  const [priceRange, setPriceRange] = useState<[number, number]>([initialMin, initialMax]);
  const [minRating, setMinRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(initialVerified);

  // Synchronise les filtres dans l'URL (replace pour pas polluer l'historique)
  const syncUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedCats.length) params.set("category", selectedCats.join(","));
    if (selectedCities.length) params.set("region", selectedCities.join(","));
    if (priceRange[0] > 0) params.set("min_price", String(priceRange[0]));
    if (priceRange[1] < 2000) params.set("max_price", String(priceRange[1]));
    if (verifiedOnly) params.set("verified", "true");
    if (SORT_TO_API[sortIdx] && SORT_TO_API[sortIdx] !== "recent") {
      params.set("sort_by", SORT_TO_API[sortIdx]);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [
    selectedCats,
    selectedCities,
    priceRange,
    verifiedOnly,
    sortIdx,
    router,
    pathname,
  ]);

  useEffect(() => {
    syncUrl();
  }, [syncUrl]);

  useEffect(() => {
    api
      .get<CategoryOption[]>("/categories")
      .then((r) => {
        const fromApi = sortCategories(
          (r.data ?? []).map((c) => ({
            slug: c.slug,
            name_fr: c.name_fr,
            name_ar: c.name_ar,
            sort_order: "sort_order" in c ? (c as { sort_order?: number }).sort_order : undefined,
          }))
        ).map(({ slug, name_fr, name_ar }) => ({ slug, name_fr, name_ar }));
        if (fromApi.length) setCategories(fromApi);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number | boolean> = {
          page: 1,
          page_size: 48,
          sort_by: SORT_TO_API[sortIdx] ?? "recent",
        };
        if (selectedCats.length === 1) params.category = selectedCats[0];
        if (selectedCities.length === 1) params.region = selectedCities[0];
        if (priceRange[0] > 0) params.min_price = priceRange[0];
        if (priceRange[1] < 2000) params.max_price = priceRange[1];
        if (verifiedOnly) params.verified = true;
        const { data } = await api.get("/products", { params });
        const items = (data.items || []).map((p: Record<string, unknown>) => {
          const imgs = p.images as { url: string }[] | undefined;
          const rawUrl =
            imgs?.[0]?.url ??
            (p.image_url as string | undefined) ??
            (p.image_urls as string[] | undefined)?.[0];
          return {
            id: String(p.id),
            seller_id: p.seller_id ? String(p.seller_id) : undefined,
            title_fr: String(p.title_fr),
            title_ar: p.title_ar as string | null,
            price: Number(p.price),
            image_url: rawUrl ?? null,
            authenticity_badge: Boolean(p.authenticity_badge),
            category_slug: (p.category_slug as string | undefined) ?? null,
          };
        });
        setProducts(items.length ? items : []);
        setTotalServer(Number(data.total ?? items.length));
      } catch {
        setProducts([]);
        setTotalServer(0);
      } finally {
        setLoading(false);
      }
    };
    load();
    setPage(1);
  }, [selectedCats, selectedCities, priceRange, verifiedOnly, sortIdx]);

  const displayProducts = products;

  // Filtres client-side complémentaires (multi-catégories / multi-villes ne
  // sont pas encore supportés par l'API, on les applique en local) + rating.
  const filtered = useMemo(() => {
    let list = [...displayProducts];
    if (selectedCats.length > 1) {
      list = list.filter((p) => p.category_slug && selectedCats.includes(p.category_slug));
    }
    if (verifiedOnly) list = list.filter((p) => p.authenticity_badge);
    list = list.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    return list;
  }, [displayProducts, verifiedOnly, priceRange, selectedCats]);

  const total = products.length ? totalServer : filtered.length;
  const perPage = 12;
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const resetFilters = () => {
    setSelectedCats([]);
    setSelectedCities([]);
    setPriceRange([0, 2000]);
    setMinRating(0);
    setVerifiedOnly(false);
    setSortIdx(0);
  };

  const filterProps = {
    rtl,
    lang,
    copy,
    categories,
    selectedCats,
    setSelectedCats,
    selectedCities,
    setSelectedCities,
    priceRange,
    setPriceRange,
    minRating,
    setMinRating,
    verifiedOnly,
    setVerifiedOnly,
    onReset: resetFilters,
  };

  return (
    <GounFonts rtl={rtl}>
      <div dir={rtl ? "rtl" : "ltr"} className="min-h-screen bg-[var(--goun-sand)]">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
          <div className="hidden lg:block">
            <FilterSidebar {...filterProps} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <p className={`text-[var(--goun-forest)] font-medium ${rtl ? "goun-font-ar" : "goun-font-ui"}`}>
                {rtl ? (
                  <>
                    <span className="font-bold">{total}</span> {copy.catalogue.results as string}
                  </>
                ) : (
                  <>
                    <span className="font-bold">{total}</span> {copy.catalogue.results as string}
                  </>
                )}
              </p>
              <div className="flex items-center gap-3">
                <select
                  value={sortIdx}
                  onChange={(e) => setSortIdx(Number(e.target.value))}
                  className="rounded-lg border border-[var(--goun-mist)] bg-white px-3 py-2 text-sm goun-font-ui min-h-tap"
                  aria-label={rtl ? "ترتيب" : "Tri"}
                >
                  {copy.catalogue.sort.map((s, i) => (
                    <option key={s} value={i}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="flex rounded-lg border border-[var(--goun-mist)] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setViewGrid(true)}
                    className={`p-2 min-h-tap ${viewGrid ? "bg-[var(--goun-forest)] text-white" : "bg-white"}`}
                    aria-label="Grid"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewGrid(false)}
                    className={`p-2 min-h-tap ${!viewGrid ? "bg-[var(--goun-forest)] text-white" : "bg-white"}`}
                    aria-label="List"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <CatalogueSkeleton />
            ) : paged.length === 0 ? (
              <p
                className={`text-center py-16 text-[var(--goun-forest)]/70 ${rtl ? "goun-font-ar" : "goun-font-ui"}`}
              >
                {copy.catalogue.empty as string}
              </p>
            ) : viewGrid ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {paged.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <ProductGrid products={paged} />
            )}

            {!loading && pages > 1 && (
              <nav className="flex justify-center gap-2 mt-10 goun-font-ui" aria-label="Pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={`min-w-[40px] min-h-tap rounded-lg ${
                      page === n
                        ? "bg-[var(--goun-forest)] text-white"
                        : "bg-white border border-[var(--goun-mist)]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </nav>
            )}
          </div>
        </div>

        {/* Mobile filter bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/95 border-t border-[var(--goun-mist)] backdrop-blur-md">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="w-full py-3 rounded-full bg-[var(--goun-forest)] text-white goun-font-ui font-medium min-h-tap"
          >
            <Search className="w-4 h-4 inline-block me-2" aria-hidden />
            {copy.catalogue.filterBtn as string}
          </button>
        </div>

        {drawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
            <button
              type="button"
              className="absolute inset-0 bg-black/40"
              onClick={() => setDrawerOpen(false)}
              aria-label={copy.catalogue.close as string}
            />
            <div
              className="relative bg-[var(--goun-sand)] rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto animate-[fadeInUp_0.35s_ease-out]"
              style={{ animation: "goun-scroll-up 0.35s ease forwards" }}
            >
              <div className="w-12 h-1 rounded-full bg-[var(--goun-mist)] mx-auto mb-4" />
              <FilterSidebar {...filterProps} />
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex-1 py-3 rounded-full bg-[var(--goun-forest)] text-white min-h-tap"
                >
                  {copy.catalogue.apply as string}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetFilters();
                    setDrawerOpen(false);
                  }}
                  className="flex-1 py-3 rounded-full border border-[var(--goun-mist)] min-h-tap"
                >
                  {copy.catalogue.close as string}
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="h-20 lg:hidden" aria-hidden />
      </div>
    </GounFonts>
  );
}

export function CatalogueExperience() {
  return (
    <Suspense fallback={<CatalogueSkeleton />}>
      <CatalogueInner />
    </Suspense>
  );
}
