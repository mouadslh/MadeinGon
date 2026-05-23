"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { TopBar } from "./TopBar";
import { Header } from "./Header";
import { HeroCarousel } from "./HeroCarousel";
import { AboutSection } from "./AboutSection";
import { AIFeaturesSection } from "./AIFeaturesSection";
import { StatsSection } from "./StatsSection";
import { ProductsSection } from "./ProductsSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { CTABannerSection } from "./CTABannerSection";
import { Footer } from "./Footer";

function getLocale(path: string): "fr" | "ar" {
  const m = path.match(/^\/(fr|ar)(?=\/|$)/);
  return (m?.[1] as "fr" | "ar") ?? "fr";
}

export function LandingV2() {
  const pathname = usePathname();
  const locale = getLocale(pathname);

  useEffect(() => {
    document.documentElement.classList.add("goun-theme");
    return () => document.documentElement.classList.remove("goun-theme");
  }, []);

  return (
    <div style={{ background: "var(--sand)" }}>
      <TopBar />
      <Header />
      <main>
        <HeroCarousel locale={locale} />
        <AboutSection locale={locale} />
        <AIFeaturesSection locale={locale} />
        <StatsSection locale={locale} />
        <ProductsSection locale={locale} />
        <TestimonialsSection locale={locale} />
        <CTABannerSection locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
