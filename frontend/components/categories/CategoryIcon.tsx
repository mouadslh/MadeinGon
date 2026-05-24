"use client";

import {
  Diamond,
  Gem,
  Home,
  Leaf,
  Package,
  Shirt,
  Sparkles,
  Utensils,
  type LucideIcon,
} from "lucide-react";
import type { ProductCategorySlug } from "@/lib/categories";

const ICON_BY_SLUG: Record<ProductCategorySlug, LucideIcon> = {
  artisanat: Gem,
  alimentaire: Utensils,
  cosmetique: Sparkles,
  textile: Shirt,
  bijoux: Diamond,
  deco: Home,
  terroir: Leaf,
};

type Props = {
  slug: string;
  className?: string;
};

export function CategoryIcon({ slug, className = "w-4 h-4" }: Props) {
  const Icon = ICON_BY_SLUG[slug as ProductCategorySlug] ?? Package;
  return <Icon className={className} aria-hidden />;
}
