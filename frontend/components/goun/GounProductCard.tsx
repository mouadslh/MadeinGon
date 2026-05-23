"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useLocale } from "next-intl";
import { formatPrice } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { getImageUrl, PRODUCT_IMAGE_PLACEHOLDER } from "@/lib/product-image";
import { isAllowedRemoteImage } from "@/lib/remote-images";
import type { GounLang } from "@/lib/goun-copy";

const BLUR =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

export type GounProduct = {
  id: string;
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
  const displayLang = lang ?? (locale === "ar" ? "ar" : "fr");
  const rtl = displayLang === "ar";
  const title = rtl ? product.nameAr : product.nameFr;
  const [wish, setWish] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  return (
    <article className="goun-card-hover group relative flex flex-col rounded-xl border border-[var(--goun-mist)] border-s-[3px] border-s-transparent bg-white overflow-hidden shadow-sm">
      <Link href={`/${locale}/product/${product.id}`} className="relative aspect-square block group">
        <ProductImage src={product.image} alt={title} className="object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute top-2 start-2 z-10 px-2 py-0.5 rounded-full text-[10px] goun-font-ui bg-[var(--goun-gold)] text-[var(--goun-night)] font-medium">
          {rtl ? "✅ أصيل GON" : "✅ Authentique GON"}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setWish(!wish);
          }}
          className="absolute top-2 end-2 z-10 p-2 rounded-full bg-white/90 shadow-sm min-h-tap"
          aria-label={rtl ? "المفضلة" : "Liste de souhaits"}
        >
          <Heart className={`w-4 h-4 ${wish ? "fill-[var(--goun-earth)] text-[var(--goun-earth)]" : "text-[var(--goun-charcoal)]"}`} />
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
              onClick={() =>
                addItem({
                  productId: product.id,
                  sellerId: "",
                  title,
                  price: product.price,
                  imageUrl: getImageUrl(product.image),
                })
              }
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[var(--goun-forest)] text-white text-xs goun-font-ui hover:bg-[var(--goun-earth)] transition-colors min-h-tap"
              aria-label={rtl ? "أضف إلى السلة" : "Ajouter au panier"}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">{rtl ? "أضف" : "Ajouter"}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
