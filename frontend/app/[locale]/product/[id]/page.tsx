"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, formatPrice } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RemoteImage } from "@/components/ui/RemoteImage";

export default function ProductDetailPage() {
  const params = useParams();
  const locale = params.locale as string;
  const id = params.id as string;
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    api.get(`/products/${id}`).then((r) => setProduct(r.data)).catch(() => {});
  }, [id]);

  if (!product) {
    return <p className="p-8">{locale === "ar" ? "جاري التحميل..." : "Chargement..."}</p>;
  }

  const title = locale === "ar" && product.title_ar ? String(product.title_ar) : String(product.title_fr);
  const images = (product.images as { url: string }[]) || [];
  const description =
    locale === "ar" && product.description_ar
      ? String(product.description_ar)
      : String(product.description_fr || "");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      <div className="relative aspect-square bg-dune rounded-card overflow-hidden">
        <RemoteImage
          src={images[0]?.url}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width:768px) 100vw, 50vw"
          fallback={<div className="absolute inset-0 flex items-center justify-center text-4xl text-night/30">🏺</div>}
        />
      </div>
      <div>
        {Boolean(product.authenticity_badge) && (
          <Badge variant="verified">{locale === "ar" ? "موثق GOUN" : "Vérifié Authentique GOUN"}</Badge>
        )}
        <h1 className="font-display text-3xl text-night mt-2">{title}</h1>
        <p className="font-mono text-2xl text-ochre my-4">{formatPrice(Number(product.price), locale)}</p>
        <p className="text-night/80 mb-6 whitespace-pre-wrap">{description}</p>
        <Button
          onClick={() =>
            addItem({
              productId: id,
              sellerId: String(product.seller_id),
              title,
              price: Number(product.price),
              imageUrl: images[0]?.url,
            })
          }
        >
          {locale === "ar" ? "أضف إلى السلة" : "Ajouter au panier"}
        </Button>
      </div>
    </div>
  );
}
