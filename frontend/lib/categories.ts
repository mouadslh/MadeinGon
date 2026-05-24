/**
 * Catégories produits — slugs alignés sur la table `categories` (PostgreSQL).
 * Utiliser ces slugs dans les filtres catalogue (?category=) et la navigation.
 */
export type ProductCategorySlug =
  | "artisanat"
  | "alimentaire"
  | "cosmetique"
  | "textile"
  | "bijoux"
  | "deco"
  | "terroir";

export type ProductCategoryMeta = {
  slug: ProductCategorySlug;
  name_fr: string;
  name_ar: string;
  sort_order: number;
};

/** Liste de référence (fallback si l’API /categories est indisponible). */
export const PRODUCT_CATEGORIES: ProductCategoryMeta[] = [
  { slug: "artisanat", name_fr: "Artisanat", name_ar: "الحرف اليدوية", sort_order: 1 },
  { slug: "alimentaire", name_fr: "Alimentaire", name_ar: "منتجات غذائية", sort_order: 2 },
  { slug: "cosmetique", name_fr: "Cosmétique", name_ar: "التجميل", sort_order: 3 },
  { slug: "textile", name_fr: "Textile", name_ar: "النسيج", sort_order: 4 },
  { slug: "bijoux", name_fr: "Bijoux", name_ar: "المجوهرات", sort_order: 5 },
  { slug: "deco", name_fr: "Décoration", name_ar: "الديكور", sort_order: 6 },
  { slug: "terroir", name_fr: "Terroir", name_ar: "منتجات المنطقة", sort_order: 7 },
];

export function isProductCategorySlug(slug: string): slug is ProductCategorySlug {
  return PRODUCT_CATEGORIES.some((c) => c.slug === slug);
}

export function sortCategories<T extends { slug: string; sort_order?: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99));
}

/** Anciens slugs frontend → slugs base de données. */
const LEGACY_SLUG_MAP: Record<string, ProductCategorySlug> = {
  food: "alimentaire",
  cosmetic: "cosmetique",
};

export function normalizeCategorySlug(slug: string): string {
  return LEGACY_SLUG_MAP[slug] ?? slug;
}

export function normalizeCategorySlugs(slugs: string[]): string[] {
  const out: string[] = [];
  for (const raw of slugs) {
    const s = normalizeCategorySlug(raw.trim());
    if (isProductCategorySlug(s) && !out.includes(s)) out.push(s);
  }
  return out;
}
