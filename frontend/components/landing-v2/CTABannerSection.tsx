"use client";

import Link from "next/link";

type Props = { locale: "fr" | "ar" };

export function CTABannerSection({ locale }: Props) {
  const isRtl = locale === "ar";

  const buyer = {
    title: isRtl ? "أريد الشراء محلياً" : "Je veux acheter local",
    sub: isRtl
      ? "اكتشف 500+ منتج أصيل يُسلَّم إلى منزلك."
      : "Découvrez 500+ produits authentiques livrés chez vous.",
    cta: isRtl ? "استكشف المنتجات ←" : "Explorer le catalogue →",
    href: `/${locale}/catalogue`,
  };
  const seller = {
    title: isRtl ? "أريد بيع منتجاتي" : "Je veux vendre mes produits",
    sub: isRtl
      ? "انضم إلى 100 حرفي وصل إلى المنطقة بأكملها."
      : "Rejoignez 100 artisans et atteignez toute la région.",
    cta: isRtl ? "أنشئ مساحتي ←" : "Créer mon espace vendeur →",
    href: `/${locale}/seller-apply`,
  };

  return (
    <section className="relative" aria-label="CTA banner">
      <div className="relative grid grid-cols-1 md:grid-cols-2 min-h-[420px]">
        <div
          className="relative flex items-center justify-center p-10 md:p-16"
          style={{
            background: "var(--deep-green)",
            color: "white",
            clipPath: "none",
          }}
        >
          <div className="atmosphere-grain absolute inset-0" aria-hidden />
          <div className={`relative max-w-md ${isRtl ? "text-right" : ""}`}>
            <h3
              className="text-3xl md:text-5xl mb-4"
              style={{ fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-display)" }}
            >
              {buyer.title}
            </h3>
            <p
              className="text-base md:text-lg mb-7 opacity-90"
              style={{
                fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-body)",
                lineHeight: 1.6,
              }}
            >
              {buyer.sub}
            </p>
            <Link
              href={buyer.href}
              className="inline-flex items-center px-7 py-3.5 rounded-full font-semibold transition-transform hover:-translate-y-0.5"
              style={{
                background: "white",
                color: "var(--deep-green)",
                fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-ui)",
              }}
            >
              {buyer.cta}
            </Link>
          </div>
        </div>

        <div
          className="relative flex items-center justify-center p-10 md:p-16"
          style={{
            background: "var(--ocre)",
            color: "white",
          }}
        >
          <div className="atmosphere-grain absolute inset-0" aria-hidden />
          <div className={`relative max-w-md ${isRtl ? "text-right" : ""}`}>
            <h3
              className="text-3xl md:text-5xl mb-4"
              style={{ fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-display)" }}
            >
              {seller.title}
            </h3>
            <p
              className="text-base md:text-lg mb-7 opacity-95"
              style={{
                fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-body)",
                lineHeight: 1.6,
              }}
            >
              {seller.sub}
            </p>
            <Link
              href={seller.href}
              className="inline-flex items-center px-7 py-3.5 rounded-full font-semibold transition-transform hover:-translate-y-0.5"
              style={{
                background: "white",
                color: "var(--ocre)",
                fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-ui)",
              }}
            >
              {seller.cta}
            </Link>
          </div>
        </div>

        {/* Diagonal separator — visible on md+, hidden on mobile */}
        <div
          aria-hidden
          className="hidden md:block absolute top-0 bottom-0"
          style={{
            insetInlineStart: "50%",
            width: 60,
            transform: "translateX(-50%)",
            background:
              "linear-gradient(115deg, var(--deep-green) 0%, var(--deep-green) 50%, var(--ocre) 50%, var(--ocre) 100%)",
            clipPath: "polygon(50% 0, 100% 0, 50% 100%, 0 100%)",
            pointerEvents: "none",
          }}
        />
      </div>
    </section>
  );
}
