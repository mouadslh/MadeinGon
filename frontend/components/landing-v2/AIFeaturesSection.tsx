"use client";

import { AI_FEATURES } from "./copy";

type Props = { locale: "fr" | "ar" };

export function AIFeaturesSection({ locale }: Props) {
  const isRtl = locale === "ar";
  const heading = isRtl ? "ذكاء اصطناعي يتكلم الدارجة" : "L'IA qui parle Darija";
  const sub = isRtl
    ? "خمس قدرات مدمجة لتسهيل البيع والشراء — مصممة للمنتجين والمشترين في كلميم واد نون."
    : "Cinq capacités intégrées pour simplifier la vente et l'achat — pensées pour les producteurs et acheteurs de Guelmim-Oued Noun.";

  return (
    <section
      className="relative py-20 md:py-28 overflow-hidden diagonal-cut-top diagonal-cut-bottom"
      style={{ background: "var(--deep-green)", color: "var(--sand)" }}
    >
      <div className="atmosphere-grain absolute inset-0 opacity-100" aria-hidden />

      <div className="relative max-w-7xl mx-auto px-6 md:px-10">
        <div className="max-w-3xl mb-12 md:mb-16">
          <span
            className="inline-block text-xs uppercase tracking-[0.25em] mb-4 px-3 py-1 rounded-full"
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "var(--gold-light)",
              fontFamily: "var(--font-ui)",
            }}
          >
            ◆ {isRtl ? "ذكاء مدمج" : "Intelligence intégrée"}
          </span>
          <h2
            className="text-3xl md:text-5xl leading-tight mb-4"
            style={{
              fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-display)",
              color: "white",
            }}
          >
            {heading}
          </h2>
          <p
            className="text-base md:text-lg"
            style={{
              color: "rgba(248,244,235,0.8)",
              fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-body)",
              lineHeight: 1.7,
            }}
          >
            {sub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {AI_FEATURES.map((f) => (
            <article
              key={f.title_fr}
              className="group p-6 md:p-7 rounded-2xl transition-all hover:-translate-y-1.5"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(6px)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl mb-5 flex items-center justify-center text-2xl"
                style={{ background: "rgba(212,168,83,0.18)" }}
                aria-hidden
              >
                {f.icon}
              </div>
              <h3
                className="text-xl md:text-2xl mb-3"
                style={{
                  fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-display)",
                  color: "white",
                }}
              >
                {isRtl ? f.title_ar : f.title_fr}
              </h3>
              <p
                className="text-sm md:text-base mb-5"
                style={{
                  color: "rgba(248,244,235,0.75)",
                  fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-body)",
                  lineHeight: 1.6,
                }}
              >
                {isRtl ? f.desc_ar : f.desc_fr}
              </p>
              <span
                className="inline-block text-xs px-2.5 py-1 rounded-full"
                style={{
                  background: "var(--gold-light)",
                  color: "var(--deep-green)",
                  fontFamily: "var(--font-ui)",
                  fontWeight: 600,
                }}
              >
                {isRtl ? f.tag_ar : f.tag_fr}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
