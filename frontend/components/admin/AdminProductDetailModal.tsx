"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { X } from "lucide-react";
import { RemoteImage } from "@/components/ui/RemoteImage";
import { Button } from "@/components/ui/Button";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { api, formatPrice } from "@/lib/api";
import { getImageUrl } from "@/lib/product-image";

type ProductDetail = {
  id: string;
  title_fr: string;
  title_ar?: string | null;
  description_fr?: string | null;
  description_ar?: string | null;
  price: number;
  stock: number;
  status?: string;
  created_at?: string;
  category?: { name_fr?: string; name_ar?: string };
  images?: { url: string }[];
  seller?: { shop_name?: string; city?: string; cin_verified?: boolean };
  seller_name?: string | null;
};

export function AdminProductDetailModal({
  productId,
  onClose,
  onUpdated,
}: {
  productId: string | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const locale = useLocale();
  const rtl = locale === "ar";
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [rejectMode, setRejectMode] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/products/${productId}/detail`);
      const p = data.product ?? data;
      setDetail({
        id: String(p.id),
        title_fr: p.title_fr,
        title_ar: p.title_ar,
        description_fr: p.description_fr,
        description_ar: p.description_ar,
        price: Number(p.price),
        stock: Number(p.stock ?? 0),
        status: p.status,
        created_at: p.created_at,
        category: p.category,
        images: p.images,
        seller_name: data.seller_name ?? null,
        seller: p.seller
          ? {
              shop_name: p.seller.shop_name,
              city: p.seller.city,
              cin_verified: p.seller.cin_verified,
            }
          : undefined,
      });
    } catch {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) {
      setRejectMode(false);
      setReason("");
      load();
    } else {
      setDetail(null);
    }
  }, [productId, load]);

  if (!productId) return null;

  const t = (fr: string, ar: string) => (rtl ? ar : fr);
  const imageUrl = detail?.images?.[0]?.url;

  const approve = async () => {
    if (!productId) return;
    setBusy(true);
    try {
      await api.patch(`/admin/products/${productId}/approve`);
      onUpdated();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    if (!productId || !reason.trim()) return;
    setBusy(true);
    try {
      await api.patch(`/admin/products/${productId}/reject`, { reason: reason.trim() });
      onUpdated();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-black/50" role="dialog" aria-modal>
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-[var(--goun-mist)]">
          <h2 className="font-display text-lg text-[var(--goun-forest)]">
            {t("Détail produit — En attente", "تفاصيل المنتج — قيد الانتظار")}
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-[var(--goun-mist)] min-h-tap" aria-label={t("Fermer", "إغلاق")}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <p className="p-8 text-center text-night/60">{t("Chargement...", "جاري التحميل...")}</p>
        ) : !detail ? (
          <p className="p-8 text-center text-[var(--color-danger)]">{t("Produit introuvable", "المنتج غير موجود")}</p>
        ) : (
          <div className="p-4 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[var(--goun-mist)]">
                <RemoteImage
                  src={imageUrl}
                  alt={detail.title_fr}
                  fill
                  className="object-cover"
                  sizes="400px"
                  fallback={
                    <div className="absolute inset-0 flex items-center justify-center text-4xl text-night/30">🏺</div>
                  }
                />
              </div>
              <div className="space-y-2 text-sm goun-font-ui">
                <p>
                  <span className="text-night/50">{t("Nom (AR)", "الاسم (عربي)")}:</span> {detail.title_ar || "—"}
                </p>
                <p>
                  <span className="text-night/50">{t("Nom (FR)", "الاسم (فرنسي)")}:</span> {detail.title_fr}
                </p>
                <p>
                  <span className="text-night/50">{t("Catégorie", "الفئة")}:</span>{" "}
                  {rtl ? detail.category?.name_ar ?? detail.category?.name_fr : detail.category?.name_fr ?? "—"}
                </p>
                <p>
                  <span className="text-night/50">{t("Prix", "السعر")}:</span> {formatPrice(detail.price, locale)}
                </p>
                <p>
                  <span className="text-night/50">{t("Stock", "المخزون")}:</span> {detail.stock}
                </p>
                <p>
                  <span className="text-night/50">{t("Statut", "الحالة")}:</span> {detail.status}
                </p>
              </div>
            </div>

            <div className="text-sm space-y-2">
              <p className="font-medium text-night/70">{t("Description (AR)", "الوصف (عربي)")}</p>
              <p className="text-night/80 whitespace-pre-wrap" dir="rtl">
                {detail.description_ar || "—"}
              </p>
              <p className="font-medium text-night/70 pt-2">{t("Description (FR)", "الوصف (فرنسي)")}</p>
              <p className="text-night/80 whitespace-pre-wrap">{detail.description_fr || "—"}</p>
            </div>

            <div className="rounded-xl bg-[var(--goun-sand)] p-3 text-sm">
              <p>
                <span className="font-medium">{t("Vendeur", "البائع")}:</span>{" "}
                {detail.seller?.shop_name ?? detail.seller_name ?? "—"}
              </p>
              <p>
                <span className="font-medium">{t("Ville", "المدينة")}:</span> {detail.seller?.city ?? "—"}
              </p>
              <p>
                {detail.seller?.cin_verified ? (
                  <VerifiedBadge size="sm" />
                ) : (
                  <span>⏳ {t("Vérification en attente", "في انتظار التوثيق")}</span>
                )}
              </p>
              {detail.created_at && (
                <p className="text-night/60 mt-1">
                  {t("Soumis le", "تاريخ الإرسال")}: {new Date(detail.created_at).toLocaleDateString(locale)}
                </p>
              )}
            </div>

            {rejectMode ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  {t("Raison du rejet", "سبب الرفض")} *
                  <textarea
                    className="w-full mt-1 border rounded-card p-3 min-h-[80px]"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </label>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setRejectMode(false)} disabled={busy}>
                    {t("Annuler", "إلغاء")}
                  </Button>
                  <Button variant="outline" onClick={reject} disabled={busy || !reason.trim()}>
                    {t("Confirmer le rejet", "تأكيد الرفض")}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="secondary" onClick={approve} disabled={busy}>
                  ✅ {t("Approuver", "موافقة")}
                </Button>
                <Button variant="outline" onClick={() => setRejectMode(true)} disabled={busy}>
                  ❌ {t("Rejeter", "رفض")}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  {t("Fermer", "إغلاق")}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
