"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { LayoutGrid } from "lucide-react";
import { CategoryIcon } from "@/components/categories/CategoryIcon";

export interface CategoryItem {
  slug: string;
  name_fr: string;
  name_ar: string;
}

export function CategoryFilter({
  categories,
  activeSlug,
  basePath,
}: {
  categories: CategoryItem[];
  activeSlug: string | null;
  basePath: string;
}) {
  const locale = useLocale();

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 snap-x scrollbar-hide -mx-1 px-1">
      <FilterChip
        href={basePath}
        label={locale === "ar" ? "الكل" : "Tout"}
        icon={<LayoutGrid className="w-5 h-5" aria-hidden />}
        active={!activeSlug}
      />
      {categories.map((cat) => {
        const name = locale === "ar" ? cat.name_ar : cat.name_fr;
        return (
          <FilterChip
            key={cat.slug}
            href={`${basePath}?category=${cat.slug}`}
            label={name}
            icon={<CategoryIcon slug={cat.slug} className="w-5 h-5" />}
            active={activeSlug === cat.slug}
          />
        );
      })}
    </div>
  );
}

function FilterChip({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`snap-start relative flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-card min-h-tap transition-colors ${
        active
          ? "bg-ochre text-white shadow-md"
          : "card-surface text-night hover:ring-2 hover:ring-ochre/40"
      }`}
    >
      {icon}
      <span className="font-medium whitespace-nowrap">{label}</span>
    </Link>
  );
}
