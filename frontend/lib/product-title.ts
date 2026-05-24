/** Champs titre produit (API / cartes). */
export type ProductTitleFields = {
  title_fr: string;
  title_ar?: string | null;
};

export type ProductDescriptionFields = {
  description_fr?: string | null;
  description_ar?: string | null;
};

/** Titre affiché : arabe si locale `ar` et `title_ar` renseigné, sinon français. */
export function getProductTitle(product: ProductTitleFields, locale: string): string {
  const ar = product.title_ar?.trim();
  if (locale === "ar" && ar) return ar;
  return product.title_fr;
}

/** Description affichée (même logique que le titre). */
export function getProductDescription(
  product: ProductDescriptionFields,
  locale: string
): string {
  const ar = product.description_ar?.trim();
  if (locale === "ar" && ar) return ar;
  return product.description_fr?.trim() ?? "";
}

/** Recherche sur titre FR et AR. */
export function productMatchesSearch(product: ProductTitleFields, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (product.title_fr.toLowerCase().includes(q)) return true;
  const ar = product.title_ar?.trim();
  if (ar && ar.toLowerCase().includes(q)) return true;
  return false;
}
