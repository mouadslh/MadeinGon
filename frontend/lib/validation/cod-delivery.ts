/** Client-side validation mirroring `addresses` + `orders.notes` schema constraints. */

export type CodDeliveryFormData = {
  full_name: string;
  phone: string;
  street: string;
  city: string;
  postal_code: string;
  label: string;
  is_default: boolean;
  notes: string;
};

export type FieldErrors = Partial<Record<keyof CodDeliveryFormData, string>>;

const PHONE_RE = /^(\+212|00212|0)[5-7]\d{8}$/;

export function validateCodDelivery(data: CodDeliveryFormData): FieldErrors {
  const errors: FieldErrors = {};

  const name = data.full_name.trim();
  if (!name) errors.full_name = "Nom complet requis";
  else if (name.length > 150) errors.full_name = "Maximum 150 caractères";

  const phone = data.phone.replace(/[\s\-().]/g, "");
  if (!phone) errors.phone = "Téléphone requis";
  else if (phone.length > 20) errors.phone = "Maximum 20 caractères";
  else if (!PHONE_RE.test(phone)) {
    errors.phone = "Format invalide (+2126XXXXXXXX ou 06XXXXXXXX)";
  }

  const street = data.street.trim();
  if (!street) errors.street = "Adresse requise";

  const city = data.city.trim();
  if (!city) errors.city = "Ville requise";
  else if (city.length > 100) errors.city = "Maximum 100 caractères";

  if (data.postal_code.trim() && data.postal_code.trim().length > 20) {
    errors.postal_code = "Maximum 20 caractères";
  }

  if (data.label.trim().length > 50) {
    errors.label = "Maximum 50 caractères";
  }

  if (data.notes.length > 5000) {
    errors.notes = "Maximum 5000 caractères";
  }

  return errors;
}

export function normalizeCodPayload(data: CodDeliveryFormData) {
  const phone = data.phone.replace(/[\s\-().]/g, "");
  return {
    delivery_address: {
      full_name: data.full_name.trim(),
      phone,
      street: data.street.trim(),
      city: data.city.trim(),
      postal_code: data.postal_code.trim() || null,
      label: data.label.trim() || null,
      is_default: data.is_default,
    },
    notes: data.notes.trim() || null,
  };
}
