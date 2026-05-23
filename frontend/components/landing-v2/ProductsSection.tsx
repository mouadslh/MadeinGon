"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Heart, Plus, MapPin, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { isAuthenticated } from "@/lib/auth";
import { useCartStore } from "@/lib/cart-store";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

type Props = { locale: "fr" | "ar" };

type ApiProduct = {
  id: string;
  seller_id?: string;
  slug?: string;
  title_fr?: string;
  title_ar?: string;
  name_fr?: string;
  name_ar?: string;
  price: number | string;
  city?: string;
  rating?: number;
  review_count?: number;
  primary_image?: string;
  images?: { url: string }[];
  is_verified?: boolean;
  authenticity_badge?: string | boolean | null;
};

type FrontProduct = {
  id: string;
  sellerId?: string;
  slug: string;
  title_fr: string;
  title_ar: string;
  price: number;
  city: string;
  rating: number;
  reviews: number;
  image: string;
  verified: boolean;
};

const FALLBACK_PRODUCTS: FrontProduct[] = [
  {
    id: "demo-1", slug: "huile-argan", title_fr: "Huile d'argan bio", title_ar: "زيت الأرقان العضوي",
    price: 120, city: "Guelmim", rating: 4.8, reviews: 24,
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80",
    verified: true,
  },
  {
    id: "demo-2", slug: "miel-thym", title_fr: "Miel de thym des montagnes", title_ar: "عسل الزعتر الجبلي",
    price: 85, city: "Assa-Zag", rating: 4.7, reviews: 18,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=80",
    verified: true,
  },
  {
    id: "demo-3", slug: "dattes-draa", title_fr: "Dattes Draa premium", title_ar: "تمر درعة الفاخر",
    price: 65, city: "Guelmim", rating: 4.9, reviews: 42,
    image: "https://images.unsplash.com/photo-1574226516831-e1dff420e562?w=600&q=80",
    verified: true,
  },
  {
    id: "demo-4", slug: "tapis-hassani", title_fr: "Tapis hassani fait main", title_ar: "زربية حسانية يدوية",
    price: 750, city: "Tan-Tan", rating: 5.0, reviews: 8,
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&q=80",
    verified: true,
  },
  {
    id: "demo-5", slug: "bijoux-argent", title_fr: "Bijoux amazighs en argent", title_ar: "مجوهرات فضية أمازيغية",
    price: 280, city: "Sidi Ifni", rating: 4.6, reviews: 15,
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80",
    verified: true,
  },
  {
    id: "demo-6", slug: "karite", title_fr: "Beurre de karité naturel", title_ar: "زبدة كاريتي الطبيعية",
    price: 45, city: "Guelmim", rating: 4.3, reviews: 9,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80",
    verified: false,
  },
  {
    id: "demo-7", slug: "eau-rose", title_fr: "Eau de rose purifiante", title_ar: "ماء ورد للبشرة",
    price: 35, city: "Tan-Tan", rating: 4.5, reviews: 12,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80",
    verified: true,
  },
  {
    id: "demo-8", slug: "djellaba", title_fr: "Djellaba brodée artisanale", title_ar: "جلباب تقليدي مطرز",
    price: 450, city: "Guelmim", rating: 4.8, reviews: 6,
    image: "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600&q=80",
    verified: true,
  },
];

function normalize(p: ApiProduct): FrontProduct {
  const image =
    p.primary_image ??
    p.images?.[0]?.url ??
    "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80";
  return {
    id: p.id,
    sellerId: p.seller_id,
    slug: p.slug ?? p.id,
    title_fr: p.title_fr ?? p.name_fr ?? "Produit",
    title_ar: p.title_ar ?? p.name_ar ?? "منتج",
    price: typeof p.price === "string" ? parseFloat(p.price) : p.price,
    city: p.city ?? "Guelmim",
    rating: p.rating ?? 4.6,
    reviews: p.review_count ?? 0,
    image,
    verified: Boolean(p.is_verified ?? p.authenticity_badge),
  };
}

export function ProductsSection({ locale }: Props) {
  const isRtl = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const tCart = useTranslations("cart");
  const addItem = useCartStore((s) => s.addItem);
  const [products, setProducts] = useState<FrontProduct[]>(FALLBACK_PRODUCTS);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [authed, setAuthed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, [pathname]);

  useEffect(() => {
    const url =
      (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000") +
      "/products?limit=12&featured=true";
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        const items: ApiProduct[] = d?.items ?? [];
        if (items.length > 0) setProducts(items.map(normalize));
      })
      .catch(() => undefined);
  }, []);

  const requireAuth = (msg: string): boolean => {
    if (authed) return true;
    setFeedback(msg);
    setTimeout(() => {
      const redirect = encodeURIComponent(pathname || `/${locale}`);
      router.push(`/${locale}/login?redirect=${redirect}`);
    }, 900);
    return false;
  };

  const toggleFav = (id: string) => {
    if (!requireAuth(tCart("favoriteLoginRequired"))) return;
    setFavorites((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = (p: FrontProduct) => {
    if (!requireAuth(tCart("loginRequired"))) return;
    addItem({
      productId: p.id,
      sellerId: p.sellerId ?? "",
      title: isRtl ? p.title_ar : p.title_fr,
      price: p.price,
      imageUrl: p.image,
    });
  };

  return (
    <section className="py-20 md:py-28" style={{ background: "var(--sand)" }}>
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-14">
          <div>
            <span
              className="inline-block text-xs uppercase tracking-[0.2em] mb-3 px-3 py-1 rounded-full"
              style={{
                background: "var(--warm-border)",
                color: "var(--deep-green)",
                fontFamily: "var(--font-ui)",
              }}
            >
              {isRtl ? "المختارة من الفريق" : "Sélection du moment"}
            </span>
            <h2
              className="text-3xl md:text-5xl"
              style={{
                fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-display)",
                color: "var(--deep-green)",
              }}
            >
              {isRtl ? "كنوز من جنوب المغرب" : "Trésors du sud marocain"}
            </h2>
          </div>
          <Link
            href={`/${locale}/catalogue`}
            className="btn-outline-deep self-start md:self-end"
            style={{ fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-ui)" }}
          >
            {isRtl ? "عرض كل المنتجات ←" : "Voir tout le catalogue →"}
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.slice(0, 8).map((p) => (
            <article
              key={p.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-warm hover:shadow-warm-strong transition-all hover:-translate-y-1"
              style={{ border: "1px solid var(--warm-border)" }}
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-[var(--warm-border)]">
                <Image
                  src={p.image}
                  alt={isRtl ? p.title_ar : p.title_fr}
                  fill
                  sizes="(max-width:768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {p.verified && (
                  <span className="absolute top-3 left-3">
                    <VerifiedBadge size="sm" />
                  </span>
                )}
                <button
                  type="button"
                  aria-label="Wishlist"
                  onClick={() => toggleFav(p.id)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: "white",
                    color: favorites.has(p.id) ? "var(--ocre)" : "var(--anthracite)",
                  }}
                >
                  <Heart size={18} fill={favorites.has(p.id) ? "var(--ocre)" : "none"} />
                </button>
              </div>

              <div className="p-4">
                <h3
                  className="text-base font-semibold mb-1 line-clamp-2 min-h-[2.6em]"
                  style={{
                    color: "var(--anthracite)",
                    fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-body)",
                  }}
                >
                  {isRtl ? p.title_ar : p.title_fr}
                </h3>
                <div
                  className="flex items-center text-xs gap-2 mb-2"
                  style={{ color: "var(--anthracite)", opacity: 0.7, fontFamily: "var(--font-ui)" }}
                >
                  <MapPin size={12} /> {p.city}
                  <span aria-hidden>•</span>
                  <Star size={12} fill="var(--gold-light)" stroke="var(--gold-light)" />
                  {p.rating.toFixed(1)} ({p.reviews})
                </div>
                <div
                  className="text-xl font-bold mb-3"
                  style={{ color: "var(--deep-green)", fontFamily: "var(--font-ui)" }}
                >
                  {p.price.toLocaleString(isRtl ? "ar-MA" : "fr-MA")} MAD
                </div>
                <button
                  type="button"
                  onClick={() => handleAdd(p)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm font-semibold transition-colors"
                  style={{
                    background: "var(--ocre)",
                    color: "white",
                    fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-ui)",
                  }}
                >
                  <Plus size={16} /> {isRtl ? "أضف إلى السلة" : "Ajouter au panier"}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[var(--deep-green)] text-white text-sm px-5 py-3 shadow-warm-strong"
        >
          {feedback}
        </div>
      )}
    </section>
  );
}
