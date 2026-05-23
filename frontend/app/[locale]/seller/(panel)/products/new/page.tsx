"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AddProductWizard } from "@/components/seller/AddProductWizard";
import { SellerTabNav } from "@/components/seller/SellerTabNav";

export default function SellerNewProductPage() {
  const params = useParams();
  const locale = params.locale as string;
  const rtl = locale === "ar";

  return (
    <div className="max-w-4xl mx-auto">
      <SellerTabNav />
      <Link
        href={`/${locale}/seller/products`}
        className="inline-flex items-center gap-2 text-[var(--goun-forest)] hover:text-[var(--goun-earth)] mb-6 min-h-tap goun-font-ui text-sm"
      >
        <ArrowLeft className={`w-5 h-5 ${rtl ? "rotate-180" : ""}`} />
        {rtl ? "العودة إلى منتجاتي" : "Retour à mes produits"}
      </Link>
      <h1 className={`text-2xl text-[var(--goun-forest)] mb-6 ${rtl ? "goun-font-ar" : "goun-font-display"}`}>
        {rtl ? "إضافة منتج بالذكاء الاصطناعي" : "Ajouter un produit — assisté par IA"}
      </h1>
      <AddProductWizard />
    </div>
  );
}
