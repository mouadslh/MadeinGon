"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { BadgeCheck, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function ConfirmationInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as string;
  const ref = searchParams.get("ref") || "";
  const orderId = searchParams.get("id") || "";

  const t = (fr: string, ar: string) => (locale === "ar" ? ar : fr);

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <BadgeCheck size={56} className="text-green-600 mx-auto mb-4" />
      <h1 className="font-display text-3xl text-ochre mb-2">
        {t("Commande confirmée", "تم تأكيد الطلب")}
      </h1>
      <p className="text-night/70 mb-6">
        {t(
          "Vous paierez en espèces à la livraison. Nous vous contacterons pour la livraison.",
          "ستدفع نقداً عند الاستلام. سنتواصل معك للتوصيل."
        )}
      </p>
      <Card className="text-left mb-8">
        {ref && (
          <p className="font-mono text-sm mb-2">
            <span className="text-night/60">{t("Référence", "المرجع")}: </span>
            {ref}
          </p>
        )}
        <p className="text-sm flex items-center gap-2 text-orange-700">
          <Package size={16} />
          {t("Paiement : Cash on Delivery", "الدفع : عند الاستلام")}
        </p>
        <p className="text-xs text-night/50 mt-2">{t("Statut : en attente", "الحالة : قيد الانتظار")}</p>
      </Card>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {orderId && (
          <Link href={`/${locale}/orders`}>
            <Button variant="outline">{t("Mes commandes", "طلباتي")}</Button>
          </Link>
        )}
        <Link href={`/${locale}/catalogue`}>
          <Button>{t("Continuer mes achats", "متابعة التسوق")}</Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-night/50">…</div>}>
      <ConfirmationInner />
    </Suspense>
  );
}
