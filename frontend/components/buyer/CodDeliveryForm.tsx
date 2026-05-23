"use client";

import { Banknote, MapPin, Phone, User } from "lucide-react";
import {
  CodDeliveryFormData,
  FieldErrors,
} from "@/lib/validation/cod-delivery";

type Props = {
  value: CodDeliveryFormData;
  onChange: (next: CodDeliveryFormData) => void;
  errors: FieldErrors;
  locale: string;
};

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-night mb-1">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-[var(--color-danger)] mt-1">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 border border-dune rounded-card text-sm focus:outline-none focus:ring-2 focus:ring-ochre/40";

export function CodDeliveryForm({ value, onChange, errors, locale }: Props) {
  const t = (fr: string, ar: string) => (locale === "ar" ? ar : fr);
  const set = (key: keyof CodDeliveryFormData, v: string | boolean) =>
    onChange({ ...value, [key]: v });

  return (
    <div className="space-y-4 border border-dune rounded-card p-4 bg-sand/30">
      <h2 className="font-medium text-night flex items-center gap-2">
        <Banknote size={18} className="text-orange-600" />
        {t("Livraison — paiement à la livraison", "التوصيل — الدفع عند الاستلام")}
      </h2>

      <Field
        id="full_name"
        label={t("Nom complet *", "الاسم الكامل *")}
        error={errors.full_name}
      >
        <div className="relative">
          <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-night/40" />
          <input
            id="full_name"
            className={`${inputClass} pl-9`}
            value={value.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            maxLength={150}
            required
            autoComplete="name"
          />
        </div>
      </Field>

      <Field
        id="phone"
        label={t("Téléphone *", "الهاتف *")}
        error={errors.phone}
      >
        <div className="relative">
          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-night/40" />
          <input
            id="phone"
            type="tel"
            className={`${inputClass} pl-9`}
            value={value.phone}
            onChange={(e) => set("phone", e.target.value)}
            maxLength={20}
            placeholder="+212612345678"
            required
            autoComplete="tel"
          />
        </div>
      </Field>

      <Field
        id="street"
        label={t("Adresse (rue, quartier) *", "العنوان *")}
        error={errors.street}
      >
        <div className="relative">
          <MapPin size={16} className="absolute left-3 top-3 text-night/40" />
          <textarea
            id="street"
            className={`${inputClass} pl-9 min-h-[80px] resize-y`}
            value={value.street}
            onChange={(e) => set("street", e.target.value)}
            required
            autoComplete="street-address"
          />
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="city" label={t("Ville *", "المدينة *")} error={errors.city}>
          <input
            id="city"
            className={inputClass}
            value={value.city}
            onChange={(e) => set("city", e.target.value)}
            maxLength={100}
            required
            autoComplete="address-level2"
          />
        </Field>
        <Field
          id="postal_code"
          label={t("Code postal", "الرمز البريدي")}
          error={errors.postal_code}
        >
          <input
            id="postal_code"
            className={inputClass}
            value={value.postal_code}
            onChange={(e) => set("postal_code", e.target.value)}
            maxLength={20}
            autoComplete="postal-code"
          />
        </Field>
      </div>

      <Field
        id="label"
        label={t("Libellé (ex. Domicile, Bureau)", "التسمية")}
        error={errors.label}
      >
        <input
          id="label"
          className={inputClass}
          value={value.label}
          onChange={(e) => set("label", e.target.value)}
          maxLength={50}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={value.is_default}
          onChange={(e) => set("is_default", e.target.checked)}
          className="rounded border-dune"
        />
        {t("Enregistrer comme adresse par défaut", "حفظ كعنوان افتراضي")}
      </label>

      <Field
        id="notes"
        label={t("Instructions de livraison (optionnel)", "تعليمات التوصيل")}
        error={errors.notes}
      >
        <textarea
          id="notes"
          className={`${inputClass} min-h-[60px] resize-y`}
          value={value.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder={t("Étage, code porte, horaires…", "الطابق، رمز الباب…")}
        />
      </Field>
    </div>
  );
}
