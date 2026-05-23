"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HERO_SLIDES } from "./copy";

const SLIDE_MS = 6000;

type Props = { locale: "fr" | "ar" };

export function HeroCarousel({ locale }: Props) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRtl = locale === "ar";

  useEffect(() => {
    const tick = 50;
    const stepProgress = (tick / SLIDE_MS) * 100;
    timer.current = setInterval(() => {
      setProgress((p) => {
        const next = p + stepProgress;
        if (next >= 100) {
          setIndex((i) => (i + 1) % HERO_SLIDES.length);
          return 0;
        }
        return next;
      });
    }, tick);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const go = (n: number) => {
    setIndex((n + HERO_SLIDES.length) % HERO_SLIDES.length);
    setProgress(0);
  };

  const ArrowLeft = isRtl ? ChevronRight : ChevronLeft;
  const ArrowRight = isRtl ? ChevronLeft : ChevronRight;

  return (
    <section
      className="relative w-full overflow-hidden atmosphere-grain diagonal-cut-bottom"
      style={{ height: "min(86vh, 760px)", minHeight: 540 }}
      aria-roledescription="carousel"
    >
      {HERO_SLIDES.map((slide, i) => {
        const active = i === index;
        const headline = isRtl ? slide.headline_ar : slide.headline_fr;
        const sub = isRtl ? slide.sub_ar : slide.sub_fr;
        const cta = isRtl ? slide.cta_ar : slide.cta_fr;
        const animClass =
          slide.align === "left"
            ? isRtl ? "anim-slide-in-rtl" : "anim-slide-in-ltr"
            : slide.align === "right"
            ? isRtl ? "anim-slide-in-ltr" : "anim-slide-in-rtl"
            : "anim-fade-up";
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              active ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={!active}
            role="group"
          >
            <div
              className="absolute inset-0 parallax-hero-bg"
              style={{
                backgroundImage: `linear-gradient(${
                  slide.align === "left" ? "90deg" : slide.align === "right" ? "270deg" : "180deg"
                }, rgba(13,31,24,0.78) 0%, rgba(13,31,24,0.35) 60%, rgba(13,31,24,0.15) 100%), url("${slide.image}")`,
                transform: active ? "scale(1.04)" : "scale(1)",
                transition: "transform 8s ease-out",
              }}
            />

            <div className="relative max-w-7xl mx-auto h-full px-6 md:px-10 flex items-center">
              <div
                className={`max-w-2xl ${
                  slide.align === "right"
                    ? isRtl ? "mr-auto" : "ml-auto"
                    : slide.align === "center"
                    ? "mx-auto text-center"
                    : ""
                }`}
              >
                {active && (
                  <>
                    <h1
                      key={`h-${slide.id}-${index}`}
                      className={`text-4xl md:text-6xl lg:text-7xl leading-tight ${animClass}`}
                      style={{
                        fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-display)",
                        color: "white",
                        textShadow: "0 4px 24px rgba(0,0,0,0.4)",
                        animationDelay: "0.1s",
                      }}
                    >
                      {headline}
                    </h1>
                    <p
                      key={`p-${slide.id}-${index}`}
                      className={`mt-5 md:mt-7 text-base md:text-xl ${animClass}`}
                      style={{
                        fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-body)",
                        color: "rgba(255,255,255,0.92)",
                        maxWidth: "560px",
                        animationDelay: "0.3s",
                      }}
                    >
                      {sub}
                    </p>
                    <div
                      key={`c-${slide.id}-${index}`}
                      className={`mt-7 md:mt-9 ${animClass}`}
                      style={{ animationDelay: "0.5s" }}
                    >
                      <Link
                        href={`/${locale}${slide.cta_href}`}
                        className="inline-flex items-center gap-2 px-7 py-4 rounded-full font-semibold shadow-warm-strong transition-transform hover:-translate-y-0.5"
                        style={{
                          background: "var(--ocre)",
                          color: "white",
                          fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-ui)",
                        }}
                      >
                        {cta}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        aria-label="Previous"
        onClick={() => go(index - 1)}
        className="absolute top-1/2 -translate-y-1/2 left-3 md:left-6 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: "rgba(0,0,0,0.35)", color: "white", backdropFilter: "blur(8px)" }}
      >
        <ArrowLeft size={22} />
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={() => go(index + 1)}
        className="absolute top-1/2 -translate-y-1/2 right-3 md:right-6 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: "rgba(0,0,0,0.35)", color: "white", backdropFilter: "blur(8px)" }}
      >
        <ArrowRight size={22} />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        {HERO_SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
            className="h-1 rounded-full overflow-hidden transition-all"
            style={{
              width: i === index ? 64 : 24,
              background: "rgba(255,255,255,0.3)",
            }}
          >
            {i === index && (
              <span
                className="block h-full"
                style={{ width: `${progress}%`, background: "var(--ocre)" }}
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
