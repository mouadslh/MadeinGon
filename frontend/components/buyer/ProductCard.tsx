"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { Badge } from "@/components/ui/Badge";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { formatPrice } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { ShoppingBag } from "lucide-react";

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
  const addItem = useCartStore((s) => s.addItem);
  const title = locale === "ar" && product.title_ar ? product.title_ar : product.title_fr;
  const badgeLabel = locale === "ar" ? "موثق GOUN" : "Vérifié GOUN";

  return (
    <article className="card-surface overflow-hidden flex flex-col h-full">
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
          <Badge variant="verified" className="absolute top-2 left-2">
            {badgeLabel}
          </Badge>
        )}
      </Link>
      <div className="p-4 flex flex-col flex-1 gap-2">
        <Link href={`/${locale}/product/${product.id}`}>
          <h3 className="font-medium text-night line-clamp-2 hover:text-ochre">{title}</h3>
        </Link>
        {product.reason && <p className="text-xs text-night/60">{product.reason}</p>}
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="font-mono text-lg text-ochre">{formatPrice(product.price, locale)}</span>
          <button
            type="button"
            onClick={() =>
              addItem({
                productId: product.id,
                sellerId: product.seller_id ?? "",
                title,
                price: product.price,
                imageUrl: product.image_url ?? undefined,
              })
            }
            className="min-h-tap min-w-tap p-2 rounded-full bg-ochre text-white hover:bg-terracotta"
            aria-label={locale === "ar" ? "أضف إلى السلة" : "Ajouter au panier"}
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </article>
  );
}
