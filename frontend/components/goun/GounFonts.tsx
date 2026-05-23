"use client";

import { gounFontVariables } from "@/lib/goun-fonts";

export function GounFonts({ children, rtl }: { children: React.ReactNode; rtl: boolean }) {
  return (
    <div className={`${gounFontVariables} ${rtl ? "goun-font-ar" : "goun-font-display"}`}>{children}</div>
  );
}
