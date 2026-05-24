"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { SITE_IMAGES } from "@/lib/site-images";

type AuthMode = "login" | "register";

interface AuthLayoutProps {
  mode: AuthMode;
  children: React.ReactNode;
}

const IMAGES: Record<AuthMode, { src: string; alt_fr: string; alt_ar: string }> = {
  login: {
    src: SITE_IMAGES.auth.login,
    alt_fr: "Artisanat marocain — tapis, poterie et bijoux berbères",
    alt_ar: "حرف يدوية مغربية — زرابي وفخار ومجوهرات أمازيغية",
  },
  register: {
    src: SITE_IMAGES.auth.register,
    alt_fr: "Artisan au travail dans un atelier de Guelmim",
    alt_ar: "حرفي يعمل في ورشة بكلميم",
  },
};

/**
 * Split-screen Login / Register.
 * Images : public/images/auth/login.jpg et register.jpg
 */
export function AuthLayout({ mode, children }: AuthLayoutProps) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const img = IMAGES[mode];

  const formSide = mode === "login" ? "left" : "right";
  const imageSide = mode === "login" ? "right" : "left";

  return (
    <div
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-screen w-full flex flex-col md:flex-row overflow-hidden"
      style={{ background: "var(--sand)" }}
    >
      <Link
        href={`/${locale}`}
        className="absolute top-4 left-4 z-30 inline-flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-full bg-white/90 backdrop-blur shadow-warm hover:bg-white"
        style={{ color: "var(--deep-green)", fontFamily: isAr ? "var(--font-arabic)" : "var(--font-ui)" }}
      >
        <ArrowLeft size={14} aria-hidden className={isAr ? "rotate-180" : ""} />
        {isAr ? "العودة إلى الصفحة الرئيسية" : "Retour à l'accueil"}
      </Link>

      <section
        key={`form-${mode}`}
        className={`auth-panel-enter w-full md:w-1/2 flex items-center justify-center px-5 py-10 md:py-16 ${
          formSide === "right" ? "md:order-2" : "md:order-1"
        }`}
      >
        <div className="w-full max-w-md">
          <div className="mb-8 hidden md:flex">
            <Logo size="lg" href={`/${locale}`} />
          </div>
          <div className="md:hidden flex justify-center mb-6">
            <Logo size="md" href={`/${locale}`} />
          </div>
          {children}
        </div>
      </section>

      <aside
        key={`img-${mode}`}
        className={`auth-panel-enter relative hidden md:block md:w-1/2 min-h-screen ${
          imageSide === "right" ? "md:order-2" : "md:order-1"
        }`}
      >
        <Image
          src={img.src}
          alt={isAr ? img.alt_ar : img.alt_fr}
          fill
          sizes="(min-width: 768px) 50vw, 0"
          priority
          unoptimized
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(31,77,58,0.45) 0%, rgba(201,121,58,0.25) 60%, rgba(31,77,58,0.65) 100%)",
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-end p-10 text-white">
          <span
            className="text-[10px] uppercase tracking-[0.25em] mb-3 opacity-90"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            {isAr ? "كلميم واد نون · المغرب" : "Guelmim-Oued Noun · Maroc"}
          </span>
          <h2
            className="text-3xl lg:text-4xl font-bold leading-tight max-w-md"
            style={{ fontFamily: isAr ? "var(--font-arabic)" : "var(--font-display)" }}
          >
            {mode === "login"
              ? isAr
                ? "مرحباً بعودتك إلى Made in GON"
                : "Heureux de vous revoir sur Made in GON"
              : isAr
              ? "انضم إلى مجتمع الحرفيين المغاربة"
              : "Rejoignez la communauté des artisans du Sud"}
          </h2>
          <p
            className="mt-3 text-sm opacity-90 max-w-md"
            style={{ fontFamily: isAr ? "var(--font-arabic)" : "var(--font-body)" }}
          >
            {mode === "login"
              ? isAr
                ? "تجد طلباتك، مفضّلاتك وكل ما يخص حسابك."
                : "Retrouvez vos commandes, vos favoris et tout votre univers Made in GON."
              : isAr
              ? "احفظ المفضّلة، اطلب بسهولة، وتابع شحناتك مباشرة."
              : "Sauvegardez vos favoris, commandez en un clic et suivez vos colis."}
          </p>
        </div>
      </aside>
    </div>
  );
}
