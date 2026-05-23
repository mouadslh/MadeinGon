"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatPrice } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { isAuthenticated } from "@/lib/auth";
import { useFavorite } from "@/hooks/useFavorite";
import { getImageUrl, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/product-image";
import { isAllowedRemoteImage } from "@/lib/remote-images";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import type { GounLang } from "@/lib/goun-copy";

const BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

export type GounProduct = {
  id: string;
  sellerId?: string;
  nameAr: string;
  nameFr: string;
  city: string;
  price: number;
  rating: number;
  image: string;
};

function ProductImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const resolved = getImageUrl(src);
  if (resolved === PRODUCT_IMAGE_PLACEHOLDER) {
    return (
      <div className={`bg-[var(--goun-mist)] flex items-center justify-center text-4xl ${className}`}>
        🏺
      </div>
    );
  }

  if (isAllowedRemoteImage(resolved)) {
    return (
      <Image
        src={resolved}
        alt={alt}
        fill
        className={className}
        sizes="(max-width:768px) 50vw, 25vw"
        placeholder="blur"
        blurDataURL={BLUR}
        onError={(e) => {
          e.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER;
        }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved}
      alt={alt}
      className={className}
      onError={(e) => {
        e.currentTarget.src = PRODUCT_IMAGE_PLACEHOLDER;
      }}
    />
  );
}

export function GounProductCard({
  product,
  lang,
  showQuickAdd = true,
}: {
  product: GounProduct;
  lang?: GounLang;
  showQuickAdd?: boolean;
}) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const tCart = useTranslations("cart");
  const displayLang = lang ?? (locale === "ar" ? "ar" : "fr");
  const rtl = displayLang === "ar";
  const title = rtl ? product.nameAr : product.nameFr;
  const addItem = useCartStore((s) => s.addItem);
  const [authed, setAuthed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { isFavorited, toggle: toggleFav, loading: favLoading } = useFavorite(product.id);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, [pathname]);

  const ensureAuth = (msg: string): boolean => {
    if (authed) return true;
    setFeedback(msg);
    setTimeout(() => {
      const redirect = encodeURIComponent(pathname || `/${locale}/catalogue`);
      router.push(`/${locale}/login?redirect=${redirect}`);
    }, 900);
    return false;
  };

  return (
    <article className="goun-card-hover group relative flex flex-col rounded-xl border border-[var(--goun-mist)] border-s-[3px] border-s-transparent bg-white overflow-hidden shadow-sm">
      <Link href={`/${locale}/product/${product.id}`} className="relative aspect-square block group">
        <ProductImage src={product.image} alt={title} className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute top-2 start-2 z-10">
          <VerifiedBadge size="sm" />
        </span>
        <button
          type="button"
          disabled={favLoading}
          onClick={(e) => {
            e.preventDefault();
            if (!ensureAuth(tCart("favoriteLoginRequired"))) return;
            void toggleFav();
          }}
          className="absolute top-2 end-2 z-10 p-2 rounded-full bg-white/90 shadow-sm min-h-tap disabled:opacity-60"
          aria-pressed={isFavorited ? "true" : "false"}
          aria-label={rtl ? "المفضلة" : "Liste de souhaits"}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? "fill-red-500 text-red-500" : "text-[var(--goun-charcoal)]"}`} />
        </button>
      </Link>
      <div className="p-4 flex flex-col flex-1 gap-1.5">
        <h3 className={`font-medium text-[var(--goun-charcoal)] line-clamp-2 ${rtl ? "goun-font-ar text-end" : "goun-font-display"}`}>
          {title}
        </h3>
        <p className="text-xs text-[var(--goun-charcoal)]/55 goun-font-ui">{product.city}</p>
        <div className="flex items-center gap-0.5" aria-label={`${product.rating} stars`}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? "fill-[var(--goun-gold)] text-[var(--goun-gold)]" : "text-[var(--goun-mist)]"}`}
            />
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="goun-font-ui font-semibold text-[var(--goun-forest)]">
            {formatPrice(product.price, locale)}
          </span>
          {showQuickAdd && (
            <button
              type="button"
              onClick={() => {
                if (!ensureAuth(tCart("loginRequired"))) return;
                addItem({
                  productId: product.id,
                  sellerId: product.sellerId ?? "",
                  title,
                  price: product.price,
                  imageUrl: getImageUrl(product.image),
                });
              }}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[var(--goun-forest)] text-white text-xs goun-font-ui hover:bg-[var(--goun-earth)] transition-colors min-h-tap"
              aria-label={rtl ? "أضف إلى السلة" : "Ajouter au panier"}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">{rtl ? "أضف" : "Ajouter"}</span>
            </button>
          )}
        </div>
      </div>
      {feedback && (
        <div
          role="status"
          className="absolute inset-x-2 bottom-2 z-20 rounded-lg bg-[var(--goun-night)]/90 text-white text-xs px-3 py-2 text-center"
        >
          {feedback}
        </div>
      )}
    </article>
  );
}
