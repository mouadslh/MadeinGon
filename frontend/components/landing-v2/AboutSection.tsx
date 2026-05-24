"use client";

import Image from "next/image";
import { ABOUT } from "./copy";
import { SITE_IMAGES } from "@/lib/site-images";

type Props = { locale: "fr" | "ar" };

const POLAROIDS = [
  {
    src: SITE_IMAGES.carousel.about1,
    label_fr: "Récolte des dattes",
    label_ar: "قطف التمور",
    rotate: -4,
  },
  {
    src: SITE_IMAGES.carousel.about2,
    label_fr: "Argan, Guelmim",
    label_ar: "أركان، كلميم",
    rotate: 2,
  },
  {
    src: SITE_IMAGES.carousel.about3,
    label_fr: "Coopérative locale",
    label_ar: "تعاونية محلية",
    rotate: -2,
  },
  {
    src: SITE_IMAGES.carousel.about4,
    label_fr: "Poterie artisanale",
    label_ar: "فخار يدوي",
    rotate: 4,
  },
];

export function AboutSection({ locale }: Props) {
  const isRtl = locale === "ar";
  const copy = ABOUT[isRtl ? "ar" : "fr"];

  return (
    <section
      id="about"
      className="relative py-20 md:py-28 atmosphere-grain"
      style={{ background: "var(--sand)" }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-center">
        <div className="md:col-span-7 order-2 md:order-1">
          <span
            className="inline-block text-xs uppercase tracking-[0.2em] mb-4 px-3 py-1 rounded-full"
            style={{
              background: "var(--warm-border)",
              color: "var(--deep-green)",
              fontFamily: "var(--font-ui)",
            }}
          >
            {copy.eyebrow}
          </span>

          <h2
            className="text-3xl md:text-5xl leading-tight mb-6"
            style={{
              fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-display)",
              color: "var(--deep-green)",
            }}
          >
            {copy.title}
          </h2>

          <blockquote
            className="relative pl-5 md:pl-7 py-2 mb-5"
            style={{
              borderInlineStart: "4px solid var(--deep-green)",
              fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-display)",
              fontSize: "clamp(1.1rem, 1.6vw, 1.4rem)",
              fontStyle: isRtl ? "normal" : "italic",
              color: "var(--anthracite)",
              lineHeight: 1.5,
            }}
          >
            « {copy.quote} »
          </blockquote>

          <p
            className="text-base md:text-lg mb-8 max-w-xl"
            style={{
              color: "var(--anthracite)",
              fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-body)",
              lineHeight: 1.7,
            }}
          >
            {copy.body}
          </p>

          <div className="flex flex-wrap gap-3">
            {copy.pills.map((pill) => (
              <span
                key={pill}
                className="px-4 py-2 rounded-full text-sm font-medium shadow-warm"
                style={{
                  background: "white",
                  color: "var(--deep-green)",
                  border: "1px solid var(--warm-border)",
                  fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-ui)",
                }}
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        <div className="md:col-span-5 order-1 md:order-2 relative h-[440px] md:h-[520px]">
          {POLAROIDS.map((p, i) => {
            const top = [0, 70, 140, 220][i];
            const left = [40, 180, 60, 200][i];
            return (
              <figure
                key={p.src}
                className="absolute shadow-warm-strong bg-white p-2 pb-4"
                style={{
                  width: 180,
                  height: 220,
                  top,
                  insetInlineStart: left,
                  transform: `rotate(${p.rotate}deg)`,
                  zIndex: i + 1,
                }}
              >
                <div className="relative w-full h-[170px] overflow-hidden">
                  <Image
                    src={p.src}
                    alt={isRtl ? p.label_ar : p.label_fr}
                    fill
                    sizes="180px"
                    className="object-cover"
                  />
                </div>
                <figcaption
                  className="text-[11px] text-center mt-2 truncate"
                  style={{
                    fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-ui)",
                    color: "var(--anthracite)",
                  }}
                >
                  {isRtl ? p.label_ar : p.label_fr}
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
