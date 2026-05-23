"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, AlertTriangle } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const SHIPPING_FEE = 30;

export default function CartPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "fr";
  const isAr = locale === "ar";
  const { items, updateQuantity, removeItem, total } = useCartStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  const t = (fr: string, ar: string) => (isAr ? ar : fr);

  const sellerIds = Array.from(new Set(items.map((i) => i.sellerId).filter(Boolean)));
  const multipleSellers = sellerIds.length > 1;
  const subtotal = total();
  const grandTotal = subtotal + (items.length ? SHIPPING_FEE : 0);

  const goToCheckout = () => {
    if (!isAuthenticated()) {
      router.push(
        `/${locale}/login?redirect=${encodeURIComponent(`/${locale}/checkout`)}`
      );
      return;
    }
    router.push(`/${locale}/checkout`);
  };

  if (!hydrated) {
    return <div className="p-8 text-center text-night/50">…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" dir={isAr ? "rtl" : "ltr"}>
      <h1
        className="font-display text-3xl mb-6 flex items-center gap-3"
        style={{ color: "var(--ocre)" }}
      >
        <ShoppingBag size={28} />
        {t("Mon panier", "سلتي")}
        <span className="text-sm font-normal text-night/50">
          ({items.length} {t("article(s)", "عنصر")})
        </span>
      </h1>

      {items.length === 0 ? (
        <Card className="text-center py-12">
          <ShoppingBag size={48} className="text-night/30 mx-auto mb-3" />
          <p className="text-night/60 mb-4">
            {t("Votre panier est vide.", "سلتك فارغة.")}
          </p>
          <Link href={`/${locale}/catalogue`}>
            <Button>{t("Découvrir le catalogue", "تصفح الكتالوج")}</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.productId}>
                <Card className="flex gap-4">
                  <div className="relative w-24 h-24 shrink-0 rounded-card overflow-hidden bg-[var(--sand-dark)]">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-night/30">
                        <ShoppingBag size={28} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/${locale}/product/${item.productId}`}
                      className="font-semibold text-night hover:text-ochre line-clamp-2"
                    >
                      {item.title}
                    </Link>
                    <p className="font-mono text-sm text-ochre mt-1">
                      {formatPrice(item.price, locale)}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-card border border-[var(--warm-border)]">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="min-h-tap w-10 flex items-center justify-center hover:bg-[var(--sand-dark)] rounded-l-card"
                          aria-label={t("Diminuer la quantité", "تقليل الكمية")}
                        >
                          <Minus size={16} />
                        </button>
                        <span
                          className="w-10 text-center font-mono"
                          aria-live="polite"
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="min-h-tap w-10 flex items-center justify-center hover:bg-[var(--sand-dark)] rounded-r-card"
                          aria-label={t("Augmenter la quantité", "زيادة الكمية")}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="min-h-tap inline-flex items-center gap-1 px-2 text-sm text-red-600 hover:text-red-700"
                        aria-label={t("Retirer du panier", "حذف من السلة")}
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">
                          {t("Retirer", "حذف")}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end justify-between">
                    <span className="text-xs text-night/50">
                      {t("Sous-total", "المجموع الفرعي")}
                    </span>
                    <span className="font-mono font-semibold text-night">
                      {formatPrice(item.price * item.quantity, locale)}
                    </span>
                  </div>
                </Card>
              </li>
            ))}
          </ul>

          <aside className="lg:sticky lg:top-24 space-y-4">
            {multipleSellers && (
              <Card className="border border-amber-300 bg-amber-50">
                <div className="flex gap-2 text-amber-800">
                  <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                  <p className="text-sm">
                    {t(
                      "Votre panier contient des articles de plusieurs artisans. Pour le moment, vous devez passer commande artisan par artisan.",
                      "تحتوي سلتك على منتجات من عدة حرفيين. حالياً يجب تأكيد الطلب لكل حرفي على حدة."
                    )}
                  </p>
                </div>
              </Card>
            )}

            <Card>
              <h2 className="font-display text-lg mb-3 text-ochre">
                {t("Récapitulatif", "ملخص الطلب")}
              </h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-night/60">
                    {t("Sous-total", "المجموع الفرعي")}
                  </dt>
                  <dd className="font-mono">{formatPrice(subtotal, locale)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-night/60">
                    {t("Livraison", "التوصيل")}
                  </dt>
                  <dd className="font-mono">
                    {formatPrice(SHIPPING_FEE, locale)}
                  </dd>
                </div>
                <div className="h-px bg-[var(--warm-border)] my-1" />
                <div className="flex justify-between text-base font-semibold">
                  <dt>{t("Total", "الإجمالي")}</dt>
                  <dd className="font-mono text-ochre">
                    {formatPrice(grandTotal, locale)}
                  </dd>
                </div>
              </dl>

              <Button
                fullWidth
                className="mt-5"
                onClick={goToCheckout}
                disabled={multipleSellers}
              >
                {t("Passer à la commande", "الانتقال للدفع")}
              </Button>
              <Link
                href={`/${locale}/catalogue`}
                className="block text-center text-sm text-ochre hover:underline mt-3"
              >
                {t("Continuer mes achats", "متابعة التسوق")}
              </Link>
            </Card>
          </aside>
        </div>
      )}
    </div>
  );
}
