"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Search } from "lucide-react";
import { api, formatPrice } from "@/lib/api";

interface SearchProduct {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
  seller_name?: string | null;
}

interface SearchSeller {
  id: string;
  shop_name: string;
  city: string;
  avatar_url?: string | null;
}

export function NavbarSearch() {
  const t = useTranslations("search");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [sellers, setSellers] = useState<SearchSeller[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  const runSearch = useCallback(
    async (q: string) => {
      if (q.trim().length < 2) {
        setProducts([]);
        setSellers([]);
        return;
      }
      setLoading(true);
      try {
        const { data } = await api.get<{ products: SearchProduct[]; sellers: SearchSeller[] }>("/search", {
          params: { q: q.trim(), locale },
        });
        setProducts(data.products || []);
        setSellers(data.sellers || []);
      } catch {
        setProducts([]);
        setSellers([]);
      } finally {
        setLoading(false);
      }
    },
    [locale]
  );

  useEffect(() => {
    const timer = setTimeout(() => runSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, runSearch]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const hasResults = products.length > 0 || sellers.length > 0;
  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={wrapRef} className="relative w-full" dir={isRtl ? "rtl" : "ltr"}>
      <Search
        className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-night/50 pointer-events-none ${isRtl ? "right-3" : "left-3"}`}
        aria-hidden
      />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={t("placeholder")}
        className={`w-full py-3 rounded-card bg-mist border border-dune focus:outline-none focus:ring-2 focus:ring-ochre min-h-tap ${
          isRtl ? "pr-10 pl-4" : "pl-10 pr-4"
        }`}
        aria-label={t("placeholder")}
        aria-expanded={showDropdown ? "true" : "false"}
      />
      {showDropdown && (
        <div className="absolute top-full mt-1 w-full min-w-[280px] card-surface shadow-xl z-[60] max-h-80 overflow-y-auto rounded-card border border-dune">
          {loading ? (
            <p className="p-4 text-sm text-night/60">{locale === "ar" ? "..." : "Recherche..."}</p>
          ) : !hasResults ? (
            <p className="p-4 text-sm text-night/60">{t("noResults")}</p>
          ) : (
            <>
              {products.length > 0 && (
                <div className="p-2 border-b border-dune/50">
                  <p className="px-2 py-1 text-xs font-medium text-ochre">{t("products")}</p>
                  {products.map((p) => (
                    <Link
                      key={p.id}
                      href={`/${locale}/product/${p.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-2 py-2 rounded-card hover:bg-sand text-sm"
                    >
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                      ) : (
                        <span className="w-10 h-10 rounded bg-dune shrink-0" />
                      )}
                      <span className="flex-1 min-w-0">
                        <span className="block truncate font-medium">{p.name}</span>
                        <span className="text-ochre font-mono text-xs">{formatPrice(p.price, locale)}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              {sellers.length > 0 && (
                <div className="p-2">
                  <p className="px-2 py-1 text-xs font-medium text-ochre">{t("sellers")}</p>
                  {sellers.map((s) => (
                    <Link
                      key={s.id}
                      href={`/${locale}/seller/${s.id}`}
                      onClick={() => setOpen(false)}
                      className="block px-2 py-2 rounded-card hover:bg-sand text-sm"
                    >
                      <span className="font-medium">{s.shop_name}</span>
                      <span className="text-night/60 text-xs block">{s.city}</span>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
