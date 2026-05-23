"use client";

import { ProductCard, ProductCardData } from "@/components/buyer/ProductCard";
import { StaggerGrid, StaggerItem } from "@/components/ui/Motion";

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  return (
    <StaggerGrid className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {products.map((p) => (
        <StaggerItem key={p.id}>
          <ProductCard product={p} />
        </StaggerItem>
      ))}
    </StaggerGrid>
  );
}
