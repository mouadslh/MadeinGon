"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Heart, ShoppingBag } from "lucide-react";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { formatPrice } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { isAuthenticated } from "@/lib/auth";
import { useFavorite } from "@/hooks/useFavorite";

export interface ProductCardData {
  id: string;
  seller_id?: string;
  title_fr: string;
  title_ar?: string | null;
  price: number;
  image_url?: string | null;
  authenticity_badge?: boolean;
  reason?: string;
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const tCart = useTranslations("cart");
  const addItem = useCartStore((s) => s.addItem);
  const { isFavorited, toggle: toggleFav, loading: favLoading } = useFavorite(product.id);
  const [authed, setAuthed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, [pathname]);

  const title = locale === "ar" && product.title_ar ? product.title_ar : product.title_fr;

  const ensureAuth = (message: string): boolean => {
    if (authed) return true;
    setFeedback(message);
    setTimeout(() => {
      const redirect = encodeURIComponent(pathname || `/${locale}/catalogue`);
      router.push(`/${locale}/login?redirect=${redirect}`);
    }, 900);
    return false;
  };

  const handleAddToCart = () => {
    if (!ensureAuth(tCart("loginRequired"))) return;
    addItem({
      productId: product.id,
      sellerId: product.seller_id ?? "",
      title,
      price: product.price,
      imageUrl: product.image_url ?? undefined,
    });
  };

  return (
    <article className="card-surface overflow-hidden flex flex-col h-full relative">
      <Link href={`/${locale}/product/${product.id}`} className="block relative aspect-square bg-dune">
        <RemoteImage
          src={product.image_url}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width:768px) 50vw, 25vw"
          fallback={<div className="w-full h-full flex items-center justify-center text-night/30">🏺</div>}
        />
        {product.authenticity_badge && (
          <span className="absolute top-2 start-2">
            <VerifiedBadge size="sm" />
          </span>
        )}
      </Link>
      <button
        type="button"
        disabled={favLoading}
        onClick={() => {
          if (!ensureAuth(tCart("favoriteLoginRequired"))) return;
          void toggleFav();
        }}
        aria-pressed={isFavorited ? "true" : "false"}
        aria-label={locale === "ar" ? "إضافة إلى المفضلة" : "Ajouter aux favoris"}
        className="absolute top-2 end-2 z-10 p-2 rounded-full bg-white/95 shadow-warm min-h-tap min-w-tap disabled:opacity-60"
      >
        <Heart
          className={`w-5 h-5 transition-colors ${
            isFavorited ? "fill-red-500 text-red-500" : "text-night/70"
          }`}
        />
      </button>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <Link href={`/${locale}/product/${product.id}`}>
          <h3 className="font-medium text-night line-clamp-2 hover:text-ochre">{title}</h3>
        </Link>
        {product.reason && <p className="text-xs text-night/60">{product.reason}</p>}
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="font-mono text-lg text-ochre">{formatPrice(product.price, locale)}</span>
          <button
            type="button"
            onClick={handleAddToCart}
            className="min-h-tap min-w-tap p-2 rounded-full bg-ochre text-white hover:bg-terracotta"
            aria-label={locale === "ar" ? "أضف إلى السلة" : "Ajouter au panier"}
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
      {feedback && (
        <div
          role="status"
          className="absolute inset-x-2 bottom-2 z-20 rounded-lg bg-night/90 text-white text-xs px-3 py-2 text-center shadow-warm-strong"
        >
          {feedback}
        </div>
      )}
    </article>
  );
}
