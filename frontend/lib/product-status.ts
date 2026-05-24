/** Statuts affichés côté vendeur (filtre + badge). */
export type SellerProductStatusFilter = "all" | "active" | "pending" | "rejected" | "inactive";

export type ProductStatusFields = {
  status?: string;
  is_active: boolean;
  is_moderated?: boolean;
};

export function getSellerProductDisplayStatus(p: ProductStatusFields): Exclude<SellerProductStatusFilter, "all"> {
  if (p.status === "rejected") return "rejected";
  if (!p.is_active) return "inactive";
  if (p.status === "pending" || !p.is_moderated) return "pending";
  return "active";
}

export function matchesSellerStatusFilter(
  p: ProductStatusFields,
  filter: SellerProductStatusFilter
): boolean {
  if (filter === "all") return true;
  return getSellerProductDisplayStatus(p) === filter;
}
