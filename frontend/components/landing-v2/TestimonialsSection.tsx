"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { TESTIMONIALS_FALLBACK } from "./copy";

type Props = { locale: "fr" | "ar" };

const AUTO_MS = 6500;

export function TestimonialsSection({ locale }: Props) {
  const isRtl = locale === "ar";
  const [index, setIndex] = useState(0);
  const items = TESTIMONIALS_FALLBACK;
  const heading = isRtl ? "ماذا يقول مستخدمونا" : "Ce qu'ils en disent";

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), AUTO_MS);
    return () => clearInterval(t);
  }, [items.length]);

  return (
    <section
      className="relative py-20 md:py-28 atmosphere-grain"
      style={{ background: "var(--sand)" }}
    >
      <div className="max-w-5xl mx-auto px-6 md:px-10 text-center">
        <h2
          className="text-3xl md:text-5xl mb-12 md:mb-16"
          style={{
            fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-display)",
            color: "var(--deep-green)",
          }}
        >
          {heading}
        </h2>

        <div className="relative">
          {items.map((t, i) => {
            const active = i === index;
            return (
              <figure
                key={t.name}
                className={`bg-white rounded-3xl p-8 md:p-14 shadow-warm-strong transition-all duration-700 ${
                  active ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
                }`}
                style={{
                  border: "1px solid var(--warm-border)",
                  backgroundImage:
                    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='200' height='200'><g fill='none' stroke='%23C9793A' stroke-width='1' opacity='0.18'><path d='M10 10 Q 100 0, 190 10 Q 200 100, 190 190 Q 100 200, 10 190 Q 0 100, 10 10 Z'/></g></svg>\")",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "100% 100%",
                }}
              >
                <div
                  aria-hidden
                  className="leading-none mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(80px, 12vw, 120px)",
                    color: "var(--ocre)",
                    opacity: 0.3,
                  }}
                >
                  &ldquo;
                </div>
                <blockquote
                  className="text-lg md:text-2xl mb-7 max-w-3xl mx-auto"
                  style={{
                    color: "var(--anthracite)",
                    fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-display)",
                    lineHeight: 1.6,
                    fontStyle: isRtl ? "normal" : "italic",
                  }}
                >
                  {isRtl ? t.quote_ar : t.quote_fr}
                </blockquote>

                <div className="flex items-center justify-center gap-1 mb-5" aria-label={`Rating ${t.rating}/5`}>
                  {Array.from({ length: 5 }).map((_, k) => (
                    <Star
                      key={k}
                      size={18}
                      fill={k < t.rating ? "var(--gold-light)" : "transparent"}
                      stroke="var(--gold-light)"
                    />
                  ))}
                </div>

                <figcaption className="flex items-center justify-center gap-3">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                    style={{ border: "2px solid var(--warm-border)" }}
                  />
                  <div
                    className="text-start"
                    style={{ color: "var(--anthracite)" }}
                  >
                    <div className="font-bold" style={{ fontFamily: "var(--font-ui)" }}>
                      {t.name}
                    </div>
                    <div className="text-xs opacity-75" style={{ fontFamily: "var(--font-ui)" }}>
                      {t.city} · {isRtl ? t.role_ar : t.role_fr}
                    </div>
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Témoignage ${i + 1}`}
              onClick={() => setIndex(i)}
              className="w-2.5 h-2.5 rounded-full transition-all"
              style={{
                background: i === index ? "var(--ocre)" : "var(--warm-border)",
                transform: i === index ? "scale(1.4)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
