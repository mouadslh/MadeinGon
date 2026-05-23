"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("home");
  return (
    <footer className="bg-sand mt-16 py-10 px-4">
      <div className="max-w-7xl mx-auto text-center text-night/80">
        <p className="font-display text-xl text-ochre mb-2">Made in GON</p>
        <p className="text-sm">Guelmim-Oued Noun · Maroc</p>
        <p className="mt-4 text-xs">
          {t("trustDelivery")} · {t("trustAuth")} · {t("trustPay")}
        </p>
      </div>
    </footer>
  );
}
