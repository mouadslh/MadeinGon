"use client";

import { useLayoutEffect } from "react";

export function LocaleHtmlAttributes({ locale }: { locale: string }) {
  useLayoutEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);
  return null;
}
