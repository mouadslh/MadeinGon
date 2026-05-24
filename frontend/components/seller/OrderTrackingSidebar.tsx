"use client";

import { useEffect, useState } from "react";
import {
  ExternalLink,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  User,
  Phone,
  FileDown,
  Banknote,
  CreditCard,
} from "lucide-react";
import { api, formatPrice } from "@/lib/api";
import { getProductTitle } from "@/lib/product-title";

type DeliveryInfo = {
  provider?: string;
  tracking_number?: string;
  tracking_url?: string;
  status?: string;
  estimated_delivery?: string;
};

export type OrderDetail = {
  id: string;
  reference: string;
  buyer_name: string;
  buyer_phone: string;
  buyer_address?: { city?: string; address?: string; zip?: string };
  items: {
    product_name: string;
    product_name_ar?: string | null;
    quantity: number;
    unit_price?: number;
  }[];
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  delivery?: DeliveryInfo;
  created_at: string;
};

type TrackingEvent = {
  status: string;
  label?: string;
  at?: string;
};

type Props = {
  order: OrderDetail | null;
  open: boolean;
  onClose: () => void;
  locale: string;
  rtl?: boolean;
};

const STEPS = [
  { key: "confirmed", icon: Package },
  { key: "shipped", icon: Truck },
  { key: "delivered", icon: CheckCircle2 },
] as const;

function stepIndex(status: string): number {
  if (status === "delivered") return 3;
  if (status === "shipped") return 2;
  if (status === "confirmed" || status === "pending") return 1;
  return 0;
}

export function OrderTrackingSidebar({ order, open, onClose, locale, rtl = false }: Props) {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    if (!open || !order?.id) {
      setEvents([]);
      return;
    }
    setLoading(true);
    api
      .get(`/seller/orders/${order.id}/tracking`)
      .then((r) => setEvents(r.data?.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [open, order?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const t = (fr: string, ar: string) => (rtl ? ar : fr);

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      pending: t("Préparation", "قيد التحضير"),
      confirmed: t("Confirmée", "مؤكدة"),
      shipped: t("En transit", "في الطريق"),
      delivered: t("Livrée", "مُسلّمة"),
      cancelled: t("Annulée", "ملغاة"),
      in_transit: t("En transit", "في الطريق"),
      out_for_delivery: t("En livraison", "قيد التوصيل"),
    };
    return map[s] ?? s;
  };

  const downloadLabel = async () => {
    if (!order) return;
    setDownloading(true);
    setDownloadError("");
    try {
      const res = await api.get(`/seller/orders/${order.id}/label`, { responseType: "blob" });
      const blob = res.data as Blob;

      if (blob.type === "application/json") {
        const text = await blob.text();
        const err = JSON.parse(text);
        throw new Error(typeof err.detail === "string" ? err.detail : t("Bon indisponible", "الوصل غير متاح"));
      }

      const pdfBlob = blob.type === "application/pdf" ? blob : new Blob([blob], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bon-${order.reference}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: Blob } };
        const data = axiosErr.response?.data;
        if (data instanceof Blob) {
          try {
            const text = await data.text();
            const parsed = JSON.parse(text);
            setDownloadError(typeof parsed.detail === "string" ? parsed.detail : t("Échec du téléchargement", "فشل التحميل"));
            return;
          } catch {
            /* fall through */
          }
        }
      }
      setDownloadError(err instanceof Error ? err.message : t("Échec du téléchargement", "فشل التحميل"));
    } finally {
      setDownloading(false);
    }
  };

  if (!open || !order) return null;

  const current = stepIndex(order.order_status);
  const delivery = order.delivery;
  const side = rtl ? "left-0" : "right-0";
  const slideFrom = rtl ? "-translate-x-full" : "translate-x-full";

  return (
    <>
      <div
        className="fixed inset-0 bg-night/40 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className={`fixed top-0 ${side} h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ${
          open ? "translate-x-0" : slideFrom
        }`}
        role="dialog"
        aria-label={t("Détails de livraison", "تفاصيل التوصيل")}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-dune/70 shrink-0">
          <div className="flex items-center gap-2">
            <Truck size={20} className="text-ochre" />
            <div>
              <h2 className="font-display text-lg text-ochre">Amana</h2>
              <p className="font-mono text-xs text-night/60">{order.reference}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-dune/50 text-night/60"
            aria-label={t("Fermer", "إغلاق")}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
          {/* Status timeline */}
          <section>
            <p className="text-xs uppercase tracking-wider text-night/50 mb-3">
              {t("Statut de livraison", "حالة التوصيل")}
            </p>
            <div className="space-y-0">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                const done = current > i + 1;
                const active = current === i + 1;
                const labels = [
                  t("Commande reçue", "تم استلام الطلب"),
                  t("Expédiée", "تم الشحن"),
                  t("Livrée", "تم التسليم"),
                ];
                return (
                  <div key={step.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          done
                            ? "bg-green-500 text-white"
                            : active
                              ? "bg-ochre text-white"
                              : "bg-dune/50 text-night/40"
                        }`}
                      >
                        <Icon size={14} />
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`w-0.5 h-8 ${done ? "bg-green-500" : "bg-dune/50"}`} />
                      )}
                    </div>
                    <div className="pb-4">
                      <p
                        className={`text-sm font-medium ${active || done ? "text-night" : "text-night/40"}`}
                      >
                        {labels[i]}
                      </p>
                      {active && (
                        <p className="text-xs text-ochre mt-0.5">{statusLabel(order.order_status)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Buyer & address */}
          <section className="border-t border-dune/50 pt-4">
            <p className="text-xs uppercase tracking-wider text-night/50 mb-3">
              {t("Destinataire", "المستلم")}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-night/80">
                <User size={14} className="text-night/40 shrink-0" />
                <span>{order.buyer_name}</span>
              </div>
              {order.buyer_phone && (
                <div className="flex items-center gap-2 text-night/80">
                  <Phone size={14} className="text-night/40 shrink-0" />
                  <span dir="ltr">{order.buyer_phone}</span>
                </div>
              )}
              {order.buyer_address?.city && (
                <div className="flex items-start gap-2 text-night/80">
                  <MapPin size={14} className="text-night/40 mt-0.5 shrink-0" />
                  <span>
                    {order.buyer_address.address}
                    {order.buyer_address.zip ? `, ${order.buyer_address.zip}` : ""}
                    <br />
                    {order.buyer_address.city}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Order items */}
          <section className="border-t border-dune/50 pt-4">
            <p className="text-xs uppercase tracking-wider text-night/50 mb-3">
              {t("Articles", "المنتجات")}
            </p>
            <ul className="space-y-2">
              {order.items.map((item, i) => {
                const itemTitle = getProductTitle(
                  { title_fr: item.product_name, title_ar: item.product_name_ar },
                  locale
                );
                return (
                <li key={i} className="flex justify-between text-sm">
                  <span className={`text-night/80 ${rtl ? "goun-font-ar" : ""}`}>
                    {itemTitle} × {item.quantity}
                  </span>
                  {item.unit_price != null && (
                    <span className="font-mono text-night/60">
                      {formatPrice(item.unit_price * item.quantity, locale)}
                    </span>
                  )}
                </li>
              );
              })}
            </ul>
            <div className="flex justify-between mt-3 pt-3 border-t border-dune/30 text-sm font-semibold">
              <span className="flex items-center gap-1 text-night/70">
                {order.payment_method === "cod" ? (
                  <>
                    <Banknote size={14} /> {t("Cash à la livraison", "نقداً عند الاستلام")}
                  </>
                ) : (
                  <>
                    <CreditCard size={14} /> {t("Carte bancaire", "بطاقة بنكية")}
                  </>
                )}
              </span>
              <span className="font-mono text-ochre">{formatPrice(order.total_amount, locale)}</span>
            </div>
          </section>

          {/* Tracking details */}
          {delivery?.tracking_number && (
            <section className="border-t border-dune/50 pt-4 space-y-3">
              <p className="text-xs uppercase tracking-wider text-night/50">
                {t("Suivi Amana", "تتبع أمانة")}
              </p>
              <div>
                <p className="text-xs text-night/50 mb-1">{t("N° de suivi", "رقم التتبع")}</p>
                <p className="font-mono text-sm">{delivery.tracking_number}</p>
              </div>
              {delivery.estimated_delivery && (
                <div className="flex items-center gap-2 text-sm text-night/70">
                  <Clock size={14} />
                  <span>
                    {t("Livraison estimée", "التسليم المتوقع")}:{" "}
                    {new Date(delivery.estimated_delivery).toLocaleDateString(locale)}
                  </span>
                </div>
              )}
              {delivery.tracking_url && (
                <a
                  href={delivery.tracking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-ochre hover:underline"
                >
                  {t("Suivre sur Amana.ma", "تتبع على أمانة")}
                  <ExternalLink size={12} />
                </a>
              )}
            </section>
          )}

          {/* Events history */}
          {loading ? (
            <p className="text-xs text-night/40">{t("Chargement…", "جاري التحميل…")}</p>
          ) : events.length > 0 ? (
            <section className="border-t border-dune/50 pt-4">
              <p className="text-xs uppercase tracking-wider text-night/50 mb-2">
                {t("Historique", "السجل")}
              </p>
              <ul className="space-y-2">
                {events.map((ev, i) => (
                  <li key={i} className="text-xs text-night/70 flex gap-2">
                    <span className="text-ochre">•</span>
                    <span>{ev.label || statusLabel(ev.status)}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        {/* Footer — bon de livraison */}
        <div className="shrink-0 px-5 py-4 border-t border-dune/70 bg-sand/30">
          <button
            onClick={downloadLabel}
            disabled={downloading || order.order_status === "cancelled"}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-card bg-ochre text-white text-sm font-medium hover:bg-ochre/90 disabled:opacity-50 disabled:cursor-not-allowed min-h-tap"
          >
            <FileDown size={18} />
            {downloading
              ? t("Téléchargement…", "جاري التحميل…")
              : t("Télécharger le bon de livraison", "تحميل وصل التسليم")}
          </button>
          {downloadError && (
            <p className="text-xs text-red-600 text-center mt-2">{downloadError}</p>
          )}
          <p className="text-xs text-night/40 text-center mt-2">
            {t("PDF Amana — à coller sur le colis", "PDF أمانة — للصق على الطرد")}
          </p>
        </div>
      </aside>
    </>
  );
}
