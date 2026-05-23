"use client";

import Image from "next/image";
import { ABOUT } from "./copy";

type Props = { locale: "fr" | "ar" };

const POLAROIDS = [
  {
    src: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=500&q=80",
    label_fr: "Désert d'Assa-Zag",
    label_ar: "صحراء أسا الزاك",
    rotate: -4,
  },
  {
    src: "https://images.unsplash.com/photo-1571805529673-0f56b922b359?w=500&q=80",
    label_fr: "Argan, Guelmim",
    label_ar: "أركان، كلميم",
    rotate: 2,
  },
  {
    src: "https://images.unsplash.com/photo-1530653333484-8542d3a0cb1d?w=500&q=80",
    label_fr: "Tan-Tan, tisseuses",
    label_ar: "نساجات تان تان",
    rotate: -2,
  },
  {
    src: "https://images.unsplash.com/photo-1581922814484-0b48460b7010?w=500&q=80",
    label_fr: "Souk de Sidi Ifni",
    label_ar: "سوق سيدي إفني",
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
