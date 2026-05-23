"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Check,
  CreditCard,
  Loader2,
  MapPin,
  PackageCheck,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { api, formatPrice } from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const SHIPPING_FEE = 30;
const STEPS = [1, 2, 3] as const;

type Address = {
  id: string;
  full_name: string;
  phone: string;
  street: string;
  city: string;
  postal_code: string | null;
  label: string | null;
  is_default: boolean;
};

type PaymentMethod = "COD" | "CARD";

const inputClass =
  "w-full mt-1 px-4 py-3 rounded-card border border-[var(--warm-border)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--ocre)] min-h-tap";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as string) || "fr";
  const isAr = locale === "ar";
  const t = (fr: string, ar: string) => (isAr ? ar : fr);

  const { items, total, clear } = useCartStore();
  const [hydrated, setHydrated] = useState(false);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [payment, setPayment] = useState<PaymentMethod>("COD");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    street: "",
    city: "",
    postal_code: "",
    label: "",
    is_default: true,
  });

  const subtotal = total();
  const grandTotal = subtotal + (items.length ? SHIPPING_FEE : 0);
  const sellerId = items[0]?.sellerId || "";
  const selected = useMemo(
    () => addresses.find((a) => a.id === selectedAddress) ?? null,
    [addresses, selectedAddress]
  );

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated()) {
      router.push(
        `/${locale}/login?redirect=${encodeURIComponent(`/${locale}/checkout`)}`
      );
      return;
    }
    if (items.length === 0) {
      router.push(`/${locale}/cart`);
      return;
    }
    fetchAddresses();
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const { data } = await api.get<Address[]>("/buyer/addresses");
      setAddresses(data);
      const def = data.find((a) => a.is_default) ?? data[0];
      if (def) setSelectedAddress(def.id);
      if (data.length === 0) setShowAddressForm(true);
    } catch {
      setShowAddressForm(true);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const submitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    setError("");
    try {
      const { data } = await api.post<Address>("/buyer/addresses", form);
      setAddresses((prev) => [data, ...prev]);
      setSelectedAddress(data.id);
      setShowAddressForm(false);
      setForm({
        full_name: "",
        phone: "",
        street: "",
        city: "",
        postal_code: "",
        label: "",
        is_default: false,
      });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ||
        t(
          "Adresse invalide. Vérifiez le numéro de téléphone (format Maroc).",
          "العنوان غير صالح. تحقق من رقم الهاتف (تنسيق المغرب)."
        );
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSavingAddress(false);
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress || items.length === 0) return;

    let resolvedSellerId = sellerId;
    if (!resolvedSellerId) {
      try {
        const { data: product } = await api.get(`/products/${items[0].productId}`);
        resolvedSellerId = String(product.seller_id ?? "");
      } catch {
        setError(
          t(
            "Impossible d'identifier le vendeur. Retirez l'article et réajoutez-le depuis le catalogue.",
            "تعذر تحديد البائع. أزل المنتج وأعد إضافته من الكتالوج."
          )
        );
        return;
      }
    }
    if (!resolvedSellerId) {
      setError(
        t(
          "Vendeur manquant pour ce panier. Videz le panier et réajoutez vos produits.",
          "البائع مفقود. أفرغ السلة وأعد إضافة المنتجات."
        )
      );
      return;
    }

    setPlacing(true);
    setError("");
    try {
      const { data } = await api.post("/orders", {
        seller_id: resolvedSellerId,
        address_id: selectedAddress,
        payment_method: payment,
        items: items.map((i) => ({
          product_id: i.productId,
          quantity: i.quantity,
        })),
      });
      clear();
      router.push(
        `/${locale}/orders/confirmation?id=${data.id}&ref=${
          data.reference || data.id.slice(0, 8)
        }`
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ||
        t(
          "Impossible de passer la commande. Réessayez.",
          "تعذر تأكيد الطلب. حاول مرة أخرى."
        );
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setPlacing(false);
    }
  };

  if (!hydrated || items.length === 0) {
    return <div className="p-8 text-center text-night/50">…</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" dir={isAr ? "rtl" : "ltr"}>
      <h1
        className="font-display text-3xl mb-6"
        style={{ color: "var(--ocre)" }}
      >
        {t("Finaliser la commande", "إتمام الطلب")}
      </h1>

      <Stepper step={step} isAr={isAr} />

      <div className="grid lg:grid-cols-[1fr_360px] gap-6 mt-8 items-start">
        <div className="space-y-5">
          {error && (
            <Card className="border border-red-200 bg-red-50 text-red-700 text-sm">
              {error}
            </Card>
          )}

          {step === 1 && (
            <Card>
              <h2 className="font-display text-xl text-ochre mb-4 flex items-center gap-2">
                <MapPin size={20} />
                {t("Adresse de livraison", "عنوان التوصيل")}
              </h2>

              {loadingAddresses ? (
                <p className="text-night/50">
                  {t("Chargement…", "جاري التحميل…")}
                </p>
              ) : (
                <>
                  {addresses.length > 0 && !showAddressForm && (
                    <ul className="space-y-3 mb-4">
                      {addresses.map((a) => (
                        <li key={a.id}>
                          <label
                            className={`flex gap-3 p-3 rounded-card border cursor-pointer transition-colors ${
                              selectedAddress === a.id
                                ? "border-ochre bg-[var(--sand-light,#FDF7EE)]"
                                : "border-[var(--warm-border)] hover:border-ochre"
                            }`}
                          >
                            <input
                              type="radio"
                              name="address"
                              value={a.id}
                              checked={selectedAddress === a.id}
                              onChange={() => setSelectedAddress(a.id)}
                              className="mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold flex items-center gap-2">
                                {a.label || a.full_name}
                                {a.is_default && (
                                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-ochre/10 text-ochre">
                                    {t("Par défaut", "افتراضي")}
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-night/70">
                                {a.full_name} · {a.phone}
                              </p>
                              <p className="text-sm text-night/70">
                                {a.street}, {a.city}
                                {a.postal_code ? ` (${a.postal_code})` : ""}
                              </p>
                            </div>
                          </label>
                        </li>
                      ))}
                    </ul>
                  )}

                  {!showAddressForm && (
                    <Button
                      variant="outline"
                      onClick={() => setShowAddressForm(true)}
                      className="inline-flex items-center gap-2"
                    >
                      <Plus size={16} />
                      {t("Ajouter une adresse", "إضافة عنوان")}
                    </Button>
                  )}

                  {showAddressForm && (
                    <form onSubmit={submitAddress} className="space-y-3">
                      <div className="grid sm:grid-cols-2 gap-3">
                        <label className="block">
                          <span className="text-sm font-medium">
                            {t("Nom complet", "الاسم الكامل")} *
                          </span>
                          <input
                            type="text"
                            required
                            value={form.full_name}
                            onChange={(e) =>
                              setForm({ ...form, full_name: e.target.value })
                            }
                            className={inputClass}
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-medium">
                            {t("Téléphone", "الهاتف")} *
                          </span>
                          <input
                            type="tel"
                            required
                            placeholder="+212 6XX XXXXXX"
                            value={form.phone}
                            onChange={(e) =>
                              setForm({ ...form, phone: e.target.value })
                            }
                            className={inputClass}
                            dir="ltr"
                          />
                        </label>
                      </div>
                      <label className="block">
                        <span className="text-sm font-medium">
                          {t("Adresse", "العنوان")} *
                        </span>
                        <input
                          type="text"
                          required
                          value={form.street}
                          onChange={(e) =>
                            setForm({ ...form, street: e.target.value })
                          }
                          className={inputClass}
                        />
                      </label>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <label className="block">
                          <span className="text-sm font-medium">
                            {t("Ville", "المدينة")} *
                          </span>
                          <input
                            type="text"
                            required
                            value={form.city}
                            onChange={(e) =>
                              setForm({ ...form, city: e.target.value })
                            }
                            className={inputClass}
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-medium">
                            {t("Code postal", "الرمز البريدي")}
                          </span>
                          <input
                            type="text"
                            value={form.postal_code}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                postal_code: e.target.value,
                              })
                            }
                            className={inputClass}
                          />
                        </label>
                      </div>
                      <label className="block">
                        <span className="text-sm font-medium">
                          {t("Libellé (Maison, Bureau…)", "التسمية (المنزل، المكتب…)")}
                        </span>
                        <input
                          type="text"
                          value={form.label}
                          onChange={(e) =>
                            setForm({ ...form, label: e.target.value })
                          }
                          className={inputClass}
                        />
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={form.is_default}
                          onChange={(e) =>
                            setForm({ ...form, is_default: e.target.checked })
                          }
                        />
                        {t(
                          "Utiliser comme adresse par défaut",
                          "استخدم كعنوان افتراضي"
                        )}
                      </label>
                      <div className="flex gap-2 pt-2">
                        <Button type="submit" disabled={savingAddress}>
                          {savingAddress
                            ? t("Enregistrement…", "جاري الحفظ…")
                            : t("Enregistrer", "حفظ")}
                        </Button>
                        {addresses.length > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowAddressForm(false)}
                          >
                            {t("Annuler", "إلغاء")}
                          </Button>
                        )}
                      </div>
                    </form>
                  )}
                </>
              )}
            </Card>
          )}

          {step === 2 && (
            <Card>
              <h2 className="font-display text-xl text-ochre mb-4 flex items-center gap-2">
                <CreditCard size={20} />
                {t("Mode de paiement", "طريقة الدفع")}
              </h2>
              <div className="space-y-3">
                <label
                  className={`flex gap-3 p-4 rounded-card border cursor-pointer transition-colors ${
                    payment === "COD"
                      ? "border-ochre bg-[var(--sand-light,#FDF7EE)]"
                      : "border-[var(--warm-border)] hover:border-ochre"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === "COD"}
                    onChange={() => setPayment("COD")}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-semibold flex items-center gap-2">
                      <Banknote size={18} className="text-green-600" />
                      {t(
                        "Paiement à la livraison (COD)",
                        "الدفع عند الاستلام (COD)"
                      )}
                    </p>
                    <p className="text-sm text-night/60 mt-1">
                      {t(
                        "Payez en espèces lorsque le livreur vous remet le colis.",
                        "ادفع نقداً عند تسليم الطرد."
                      )}
                    </p>
                  </div>
                </label>

                <label
                  className={`flex gap-3 p-4 rounded-card border cursor-pointer transition-colors ${
                    payment === "CARD"
                      ? "border-ochre bg-[var(--sand-light,#FDF7EE)]"
                      : "border-[var(--warm-border)] hover:border-ochre"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={payment === "CARD"}
                    onChange={() => setPayment("CARD")}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-semibold flex items-center gap-2">
                      <CreditCard size={18} className="text-blue-600" />
                      {t("Carte bancaire (CMI)", "بطاقة بنكية (CMI)")}
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                        {t("Bientôt", "قريباً")}
                      </span>
                    </p>
                    <p className="text-sm text-night/60 mt-1">
                      {t(
                        "Paiement sécurisé par le Centre Monétique Interbancaire.",
                        "دفع آمن عبر المركز النقدي بين البنوك."
                      )}
                    </p>
                  </div>
                </label>
              </div>
            </Card>
          )}

          {step === 3 && (
            <>
              <Card>
                <h2 className="font-display text-xl text-ochre mb-4 flex items-center gap-2">
                  <PackageCheck size={20} />
                  {t("Vérifier votre commande", "تحقق من طلبك")}
                </h2>

                <h3 className="text-sm font-semibold text-night/70 mb-2">
                  {t("Articles", "المنتجات")}
                </h3>
                <ul className="divide-y divide-[var(--warm-border)] mb-5">
                  {items.map((i) => (
                    <li
                      key={i.productId}
                      className="py-2 flex justify-between text-sm"
                    >
                      <span className="flex-1 pe-2">
                        {i.title}{" "}
                        <span className="text-night/50">× {i.quantity}</span>
                      </span>
                      <span className="font-mono">
                        {formatPrice(i.price * i.quantity, locale)}
                      </span>
                    </li>
                  ))}
                </ul>

                {selected && (
                  <>
                    <h3 className="text-sm font-semibold text-night/70 mb-2">
                      {t("Livraison à", "التوصيل إلى")}
                    </h3>
                    <p className="text-sm mb-1">
                      {selected.full_name} · {selected.phone}
                    </p>
                    <p className="text-sm text-night/70 mb-5">
                      {selected.street}, {selected.city}
                      {selected.postal_code
                        ? ` (${selected.postal_code})`
                        : ""}
                    </p>
                  </>
                )}

                <h3 className="text-sm font-semibold text-night/70 mb-2">
                  {t("Paiement", "الدفع")}
                </h3>
                <p className="text-sm flex items-center gap-2">
                  {payment === "COD" ? (
                    <>
                      <Banknote size={16} className="text-green-600" />
                      {t(
                        "Espèces à la livraison",
                        "نقداً عند الاستلام"
                      )}
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} className="text-blue-600" />
                      {t("Carte bancaire", "بطاقة بنكية")}
                    </>
                  )}
                </p>
              </Card>

              <Card className="bg-[var(--sand-light,#FDF7EE)] border border-ochre/30">
                <p className="text-sm flex items-start gap-2 text-night/80">
                  <ShieldCheck
                    size={18}
                    className="text-ochre shrink-0 mt-0.5"
                  />
                  {t(
                    "En confirmant, vous acceptez nos conditions de vente. Votre commande sera transmise à l'artisan.",
                    "بتأكيدك للطلب، فإنك توافق على شروط البيع. سيتم إرسال طلبك إلى الحرفي."
                  )}
                </p>
              </Card>
            </>
          )}

          <div className="flex justify-between gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                if (step === 1) router.push(`/${locale}/cart`);
                else setStep((step - 1) as 1 | 2 | 3);
              }}
              className="inline-flex items-center gap-2"
            >
              {isAr ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
              {step === 1
                ? t("Retour au panier", "العودة إلى السلة")
                : t("Précédent", "السابق")}
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep((step + 1) as 1 | 2 | 3)}
                disabled={step === 1 && (!selectedAddress || showAddressForm)}
                className="inline-flex items-center gap-2"
              >
                {t("Suivant", "التالي")}
                {isAr ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </Button>
            ) : (
              <Button
                onClick={placeOrder}
                disabled={placing}
                className="inline-flex items-center gap-2"
              >
                {placing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {t("Confirmation…", "جاري التأكيد…")}
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    {t("Confirmer la commande", "تأكيد الطلب")}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24">
          <Card>
            <h2 className="font-display text-lg mb-3 text-ochre">
              {t("Récapitulatif", "ملخص الطلب")}
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-night/60">
                  {t("Sous-total", "المجموع الفرعي")}
                </dt>
                <dd className="font-mono">{formatPrice(subtotal, locale)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-night/60">{t("Livraison", "التوصيل")}</dt>
                <dd className="font-mono">
                  {formatPrice(SHIPPING_FEE, locale)}
                </dd>
              </div>
              <div className="h-px bg-[var(--warm-border)] my-1" />
              <div className="flex justify-between text-base font-semibold">
                <dt>{t("Total à payer", "الإجمالي")}</dt>
                <dd className="font-mono text-ochre">
                  {formatPrice(grandTotal, locale)}
                </dd>
              </div>
            </dl>
            <Link
              href={`/${locale}/cart`}
              className="block text-center text-sm text-ochre hover:underline mt-4"
            >
              {t("Modifier le panier", "تعديل السلة")}
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Stepper({ step, isAr }: { step: 1 | 2 | 3; isAr: boolean }) {
  const labels = {
    1: { fr: "Adresse", ar: "العنوان" },
    2: { fr: "Paiement", ar: "الدفع" },
    3: { fr: "Confirmation", ar: "التأكيد" },
  } as const;
  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {STEPS.map((s, idx) => {
        const done = step > s;
        const active = step === s;
        return (
          <li key={s} className="flex-1 flex items-center gap-2 sm:gap-3">
            <span
              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0 transition-colors ${
                done
                  ? "bg-ochre text-white"
                  : active
                  ? "bg-ochre/10 text-ochre border-2 border-ochre"
                  : "bg-[var(--warm-border)] text-night/50"
              }`}
              aria-current={active ? "step" : undefined}
            >
              {done ? <Check size={16} /> : s}
            </span>
            <span
              className={`text-sm font-medium hidden sm:inline ${
                active ? "text-ochre" : done ? "text-night" : "text-night/40"
              }`}
            >
              {labels[s][isAr ? "ar" : "fr"]}
            </span>
            {idx < STEPS.length - 1 && (
              <span
                className={`flex-1 h-px ${
                  done ? "bg-ochre" : "bg-[var(--warm-border)]"
                }`}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
