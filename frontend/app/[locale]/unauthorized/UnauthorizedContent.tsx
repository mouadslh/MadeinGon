"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";

type ApplicationStatus = {
  status: string;
} | null;

export default function UnauthorizedContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params.locale as string) || "fr";
  const reason = searchParams.get("reason");
  const isAr = locale === "ar";
  const [application, setApplication] = useState<ApplicationStatus>(null);

  useEffect(() => {
    if (reason !== "seller" || !isAuthenticated()) return;
    api
      .get<ApplicationStatus>("/sellers/application/status")
      .then((r) => setApplication(r.data))
      .catch(() => setApplication(null));
  }, [reason]);

  const t = (fr: string, ar: string) => (isAr ? ar : fr);

  let title = t("Accès refusé", "الوصول مرفوض");
  let message = t("Vous n'avez pas accès à cette page.", "ليس لديك صلاحية للوصول إلى هذه الصفحة.");
  let primaryHref = `/${locale}`;
  let primaryLabel = t("Retour à l'accueil", "العودة للرئيسية");

  if (reason === "seller") {
    title = t("Espace vendeur", "مساحة البائع");
    if (application?.status === "PENDING") {
      message = t(
        "Votre demande vendeur est en cours de validation par l'administration (24–48 h).",
        "طلبك قيد المراجعة من قبل الإدارة (24–48 ساعة)."
      );
      primaryHref = `/${locale}/catalogue`;
      primaryLabel = t("Continuer mes achats", "متابعة التسوق");
    } else if (application?.status === "REJECTED") {
      message = t(
        "Votre demande vendeur a été refusée. Contactez l'administration ou soumettez une nouvelle demande.",
        "تم رفض طلب البائع. تواصل مع الإدارة أو قدّم طلباً جديداً."
      );
      primaryHref = `/${locale}/seller-apply`;
      primaryLabel = t("Nouvelle demande", "طلب جديد");
    } else {
      message = t(
        "Cet espace est réservé aux artisans approuvés. Soumettez votre demande avec votre CIN pour vendre sur Made in GOUN.",
        "هذه المساحة مخصصة للحرفيين المعتمدين. قدّم طلبك مع بطاقة الهوية للبيع على Made in GOUN."
      );
      primaryHref = `/${locale}/seller-apply`;
      primaryLabel = t("Devenir vendeur", "كن بائعاً");
    }
  } else if (reason === "admin") {
    title = t("Administration", "الإدارة");
    message = t("Cette section est réservée aux administrateurs.", "هذا القسم مخصص للمسؤولين فقط.");
  }

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="font-display text-4xl text-ochre mb-4">403</h1>
      <h2 className="text-lg font-medium mb-3">{title}</h2>
      <p className="mb-8 text-night/80">{message}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href={primaryHref} className="btn-primary">
          {primaryLabel}
        </Link>
        <Link href={`/${locale}/logout`} className="btn-secondary">
          {t("Déconnexion", "تسجيل الخروج")}
        </Link>
      </div>
      {reason === "seller" && application?.status === "PENDING" ? (
        <p className="mt-6 text-sm text-night/60">
          {t(
            "Astuce : déconnectez-vous puis reconnectez-vous après approbation pour accéder à l'espace vendeur.",
            "نصيحة: سجّل الخروج ثم الدخول مجدداً بعد الموافقة للوصول إلى مساحة البائع."
          )}
        </p>
      ) : null}
    </div>
  );
}
