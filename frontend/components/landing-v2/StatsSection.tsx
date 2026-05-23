"use client";

import { useEffect, useRef, useState } from "react";
import { STATS_FALLBACK } from "./copy";

type Props = { locale: "fr" | "ar" };

type ApiStats = {
  sellers_count: number;
  products_count: number;
  provinces_count: number;
  verified_pct: number;
};

function CountUp({ to, suffix }: { to: number; suffix: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const duration = 1400;
            const start = performance.now();
            const animate = (now: number) => {
              const t = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - t, 3);
              setN(Math.round(to * eased));
              if (t < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.4 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

export function StatsSection({ locale }: Props) {
  const isRtl = locale === "ar";
  const [stats, setStats] = useState<ApiStats | null>(null);
  const heading = isRtl ? "أرقام تشهد على الثقة" : "Des chiffres qui inspirent confiance";
  const sub = isRtl
    ? "بيانات حقيقية، محدّثة عبر منصتنا — لأن الشفافية تأتي قبل كل شيء."
    : "Données en temps réel depuis notre plateforme — parce que la transparence vient avant tout.";

  useEffect(() => {
    const url =
      (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000") + "/api/v1/stats/public";
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStats(d))
      .catch(() => undefined);
  }, []);

  const cards = STATS_FALLBACK.map((c, i) => {
    if (!stats) return c;
    const live = [stats.sellers_count, stats.products_count, stats.provinces_count, stats.verified_pct][i];
    return { ...c, value: live ?? c.value };
  });

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div
        className="absolute inset-0 amazigh-pattern"
        style={{ opacity: 0.8 }}
        aria-hidden
      />
      <div className="relative max-w-7xl mx-auto px-6 md:px-10">
        <div className="text-center mb-12 md:mb-16">
          <h2
            className="text-3xl md:text-5xl mb-3"
            style={{
              fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-display)",
              color: "var(--deep-green)",
            }}
          >
            {heading}
          </h2>
          <p
            className="text-base md:text-lg max-w-2xl mx-auto"
            style={{
              color: "var(--anthracite)",
              fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-body)",
            }}
          >
            {sub}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {cards.map((c) => (
            <div
              key={c.label_fr}
              className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-warm transition-all hover:-translate-y-1.5 hover:shadow-warm-strong"
              style={{ border: "1px solid var(--warm-border)" }}
            >
              <div className="text-3xl md:text-4xl mb-3" aria-hidden>
                {c.icon}
              </div>
              <div
                className="text-4xl md:text-5xl font-bold mb-2"
                style={{
                  color: "var(--deep-green)",
                  fontFamily: "var(--font-ui)",
                }}
              >
                <CountUp to={c.value} suffix={c.suffix} />
              </div>
              <div
                className="text-sm leading-snug"
                style={{
                  color: "var(--anthracite)",
                  fontFamily: isRtl ? "var(--font-arabic)" : "var(--font-body)",
                }}
              >
                {isRtl ? c.label_ar : c.label_fr}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
