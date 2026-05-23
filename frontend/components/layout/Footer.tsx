"use client";

import { useTranslations } from "next-intl";
import { Logo } from "@/components/layout/Logo";

export function Footer() {
  const t = useTranslations("home");
  return (
    <footer className="bg-sand mt-16 py-10 px-4">
      <div className="max-w-7xl mx-auto text-center text-night/80 flex flex-col items-center gap-2">
        <Logo size="md" />
        <p className="text-sm">Guelmim-Oued Noun · Maroc</p>
        <p className="mt-2 text-xs">
          {t("trustDelivery")} · {t("trustAuth")} · {t("trustPay")}
        </p>
      </div>
    </footer>
  );
}
