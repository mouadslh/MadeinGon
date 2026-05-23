"use client";

import { useParams } from "next/navigation";
import { Star } from "lucide-react";

export default function SellerReviewsPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = (fr: string, ar: string) => (locale === "ar" ? ar : fr);

  return (
    <div className="max-w-3xl mx-auto text-center py-16">
      <Star size={48} className="text-night/30 mx-auto mb-4" />
      <h1 className="font-display text-2xl text-ochre mb-2">{t("Avis clients", "تقييمات العملاء")}</h1>
      <p className="text-night/60">{t("Bientôt disponible.", "قريباً.")}</p>
    </div>
  );
}
