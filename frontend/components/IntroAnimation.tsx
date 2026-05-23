"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const SESSION_KEY = "intro_shown";
const TOTAL_DURATION_MS = 4800;

interface IntroAnimationProps {
  locale: "fr" | "ar" | string;
}

/**
 * Cinématique d'arrivée Made in GON.
 *
 * - S'affiche une seule fois par session (sessionStorage).
 * - Durée totale ~4.8 s puis transition fondu vers la landing page.
 * - Désactivée pour `prefers-reduced-motion`.
 */
export function IntroAnimation({ locale }: IntroAnimationProps) {
  const reduceMotion = useReducedMotion();
  const [show, setShow] = useState(false);
  const isAr = locale === "ar";

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    if (reduceMotion) {
      sessionStorage.setItem(SESSION_KEY, "1");
      return;
    }
    setShow(true);
    const t = setTimeout(() => {
      sessionStorage.setItem(SESSION_KEY, "1");
      setShow(false);
    }, TOTAL_DURATION_MS);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  if (reduceMotion) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] overflow-hidden"
          style={{ background: "#1B4332" }}
        >
          {/* Motifs berbères en fond */}
          <BerberPattern />

          {/* Voile dégradé chaud */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, rgba(212,168,83,0.18) 0%, transparent 60%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0.8] }}
            transition={{ duration: TOTAL_DURATION_MS / 1000, times: [0, 0.25, 0.7, 1] }}
          />

          {/* Logo + brand */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <DropLogo />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.3, ease: "easeOut" }}
              className="text-3xl md:text-5xl font-bold"
              style={{
                color: "#F8F4EB",
                fontFamily: isAr ? "var(--font-arabic)" : "var(--font-display)",
                letterSpacing: isAr ? "0" : "0.02em",
              }}
            >
              {isAr ? "مصنوع في قون" : "Made in GON"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              transition={{ duration: 0.6, delay: 1.8 }}
              className="text-sm md:text-base"
              style={{
                color: "#D4A853",
                fontFamily: isAr ? "var(--font-arabic)" : "var(--font-ui)",
                letterSpacing: "0.18em",
                textTransform: isAr ? undefined : "uppercase",
              }}
            >
              {isAr ? "كلميم واد نون · المغرب" : "Guelmim-Oued Noun · Maroc"}
            </motion.p>
          </div>

          {/* Wipe vertical de sortie */}
          <motion.div
            className="absolute inset-x-0 bottom-0"
            initial={{ height: "0%" }}
            animate={{ height: ["0%", "0%", "100%"] }}
            transition={{ duration: TOTAL_DURATION_MS / 1000, times: [0, 0.65, 0.95], ease: "easeInOut" }}
            style={{
              background: "linear-gradient(to top, #F8F4EB 0%, rgba(248,244,235,0) 100%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DropLogo() {
  return (
    <svg width={120} height={120} viewBox="0 0 64 64" aria-hidden role="img">
      <defs>
        <linearGradient id="introDrop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4A853" />
          <stop offset="100%" stopColor="#C9793A" />
        </linearGradient>
      </defs>
      <path
        d="M32 6c-9 14-14 24-14 34 0 9 6 16 14 16s14-7 14-16C46 30 41 20 32 6z"
        fill="url(#introDrop)"
        stroke="#F8F4EB"
        strokeWidth="1.2"
      />
      <path d="M32 14v40" stroke="#1B4332" strokeWidth="1.8" />
    </svg>
  );
}

function BerberPattern() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.12 }}
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 800 600"
    >
      <defs>
        <pattern id="amazigh" width="80" height="80" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="#D4A853" strokeWidth="0.8">
            <path d="M40 6 L74 40 L40 74 L6 40 Z" />
            <path d="M40 22 L58 40 L40 58 L22 40 Z" />
            <circle cx="40" cy="40" r="2.5" />
            <path d="M0 40 L80 40 M40 0 L40 80" />
          </g>
        </pattern>
      </defs>
      <rect width="800" height="600" fill="url(#amazigh)" />
    </svg>
  );
}
