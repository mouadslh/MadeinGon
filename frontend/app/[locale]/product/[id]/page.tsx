"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { api, formatPrice } from "@/lib/api";
import { useCartStore } from "@/lib/cart-store";
import { isAuthenticated } from "@/lib/auth";
import { useFavorite } from "@/hooks/useFavorite";
import { Button } from "@/components/ui/Button";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { RemoteImage } from "@/components/ui/RemoteImage";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const tCart = useTranslations("cart");
  const locale = params.locale as string;
  const id = params.id as string;
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [authed, setAuthed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const { isFavorited, toggle: toggleFav, loading: favLoading } = useFavorite(id);

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, [pathname]);

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
    <div className="max-w-4xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8 relative">
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
        {Boolean(product.authenticity_badge) && <VerifiedBadge size="lg" />}
        <h1 className="font-display text-3xl text-night mt-2">{title}</h1>
        <p className="font-mono text-2xl text-ochre my-4">{formatPrice(Number(product.price), locale)}</p>
        <p className="text-night/80 mb-6 whitespace-pre-wrap">{description}</p>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              if (!ensureAuth(tCart("loginRequired"))) return;
              addItem({
                productId: id,
                sellerId: String(product.seller_id),
                title,
                price: Number(product.price),
                imageUrl: images[0]?.url,
              });
            }}
          >
            {locale === "ar" ? "أضف إلى السلة" : "Ajouter au panier"}
          </Button>
          <button
            type="button"
            disabled={favLoading}
            onClick={() => {
              if (!ensureAuth(tCart("favoriteLoginRequired"))) return;
              void toggleFav();
            }}
            aria-pressed={isFavorited ? "true" : "false"}
            className="min-h-tap min-w-tap p-3 rounded-full bg-white border border-dune shadow-warm disabled:opacity-60"
            aria-label={locale === "ar" ? "إضافة إلى المفضلة" : "Ajouter aux favoris"}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? "fill-red-500 text-red-500" : "text-night/70"}`} />
          </button>
        </div>
      </div>
      {feedback && (
        <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-full bg-night text-white text-sm px-5 py-3 shadow-warm-strong">
          {feedback}
        </div>
      )}
    </div>
  );
}
