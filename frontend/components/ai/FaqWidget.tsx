"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { HelpCircle, X } from "lucide-react";
import faqFr from "@/messages/faq.fr.json";
import faqAr from "@/messages/faq.ar.json";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_BY_LOCALE: Record<string, FaqItem[]> = {
  fr: faqFr as FaqItem[],
  ar: faqAr as FaqItem[],
};

const CATEGORY_KEYS = ["all", "acheteur", "vendeur", "commande", "paiement", "livraison"] as const;

export function FaqWidget() {
  const params = useParams();
  const locale = (params.locale as string) === "ar" ? "ar" : "fr";
  const t = useTranslations("faq");
  const isRtl = locale === "ar";

  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const items = FAQ_BY_LOCALE[locale] ?? FAQ_BY_LOCALE.fr;

  const filtered = useMemo(() => {
    if (activeCategory === "all") return items;
    return items.filter((item) => item.category === activeCategory);
  }, [items, activeCategory]);

  const selected = items.find((item) => item.id === selectedId) ?? null;

  const categoryLabel = (key: string) => {
    if (key === "all") return t("tabAll");
    return t(`tab_${key}` as "tab_acheteur");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`fixed bottom-6 z-50 w-14 h-14 rounded-full bg-ochre text-white shadow-lg flex items-center justify-center hover:bg-terracotta min-h-tap min-w-tap ${isRtl ? "left-6" : "right-6"}`}
        aria-label={t("title")}
      >
        {open ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
      </button>

      {open && (
        <div
          dir={isRtl ? "rtl" : "ltr"}
          className={`fixed bottom-24 z-50 w-[360px] max-w-[calc(100vw-2rem)] max-h-[min(520px,70vh)] card-surface flex flex-col shadow-xl ${isRtl ? "left-6" : "right-6"}`}
        >
          <div className="p-4 border-b border-dune bg-sand rounded-t-card shrink-0">
            <h3 className="font-display text-lg text-ochre">{t("title")}</h3>
            <p className="text-xs text-night/60 mt-1">{t("subtitle")}</p>
          </div>

          <div className="flex gap-1 p-2 overflow-x-auto border-b border-dune/50 shrink-0">
            {CATEGORY_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveCategory(key);
                  setSelectedId(null);
                }}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs min-h-tap ${
                  activeCategory === key ? "bg-ochre text-white" : "bg-mist text-night hover:bg-dune"
                }`}
              >
                {categoryLabel(key)}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                className={`w-full text-start px-3 py-2 rounded-card text-sm border transition-colors min-h-tap ${
                  selectedId === item.id
                    ? "bg-terracotta text-white border-terracotta"
                    : "bg-sand text-night border-dune hover:border-ochre"
                }`}
              >
                {item.question}
              </button>
            ))}
          </div>

          {selected && (
            <div className="p-4 border-t border-dune bg-[var(--surface-card)] rounded-b-card shrink-0">
              <p className="text-sm font-medium text-ochre mb-2">{selected.question}</p>
              <p className="text-sm text-night/85 leading-relaxed">{selected.answer}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
