"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

type AuthMode = "login" | "register";

interface AuthLayoutProps {
  mode: AuthMode;
  children: React.ReactNode;
}

const IMAGES: Record<AuthMode, { src: string; alt_fr: string; alt_ar: string }> = {
  login: {
    src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80",
    alt_fr: "Artisanat marocain — tapis, poterie et bijoux berbères",
    alt_ar: "حرف يدوية مغربية — زرابي وفخار ومجوهرات أمازيغية",
  },
  register: {
    src: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=1400&q=80",
    alt_fr: "Artisan au travail dans un atelier de Guelmim",
    alt_ar: "حرفي يعمل في ورشة بكلميم",
  },
};

/**
 * Split-screen Login / Register avec effet de "page qui tourne" lorsqu'on
 * navigue entre les deux modes (sens du slide inversé selon le mode).
 *
 * Mobile : formulaire plein-écran, image masquée.
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

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={`form-${mode}`}
          initial={{
            opacity: 0,
            x: formSide === "left" ? -120 : 120,
            rotateY: formSide === "left" ? -8 : 8,
          }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          exit={{
            opacity: 0,
            x: formSide === "left" ? 120 : -120,
            rotateY: formSide === "left" ? 8 : -8,
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ perspective: 1400 }}
          className={`w-full md:w-1/2 flex items-center justify-center px-5 py-10 md:py-16 ${
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
        </motion.section>
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <motion.aside
          key={`img-${mode}`}
          initial={{
            opacity: 0,
            x: imageSide === "right" ? 120 : -120,
          }}
          animate={{ opacity: 1, x: 0 }}
          exit={{
            opacity: 0,
            x: imageSide === "right" ? -120 : 120,
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`relative hidden md:block md:w-1/2 ${
            imageSide === "right" ? "md:order-2" : "md:order-1"
          }`}
        >
          <Image
            src={img.src}
            alt={isAr ? img.alt_ar : img.alt_fr}
            fill
            sizes="(min-width: 768px) 50vw, 0"
            priority
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
        </motion.aside>
      </AnimatePresence>
    </div>
  );
}
