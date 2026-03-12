"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";

interface FilterableProduct {
  slug: string;
  name: string;
  price: string;
  type: "pom" | "supplement";
  imageUrl?: string;
  hasMultipleVariants: boolean;
  categories: string[];
}

interface CollectionFilterProps {
  categories: { slug: string; name: string; count: number }[];
  products: FilterableProduct[];
}

export function CollectionFilter({ categories, products }: CollectionFilterProps) {
  const [active, setActive] = useState<string>("all");

  const filtered =
    active === "all"
      ? products
      : products.filter((p) => p.categories.includes(active));

  return (
    <>
      {/* Filter tags */}
      <div className="mb-10 flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => setActive("all")}
          className={cn(
            "rounded-full border px-5 py-2 text-sm font-medium transition-all duration-200",
            active === "all"
              ? "border-roots-green bg-roots-green text-roots-cream shadow-sm"
              : "border-roots-green/20 bg-white text-roots-green hover:border-roots-green/40 hover:bg-roots-green/5"
          )}
        >
          All Products
          <span className={cn(
            "ml-1.5 text-xs",
            active === "all" ? "text-roots-cream/70" : "text-roots-green/40"
          )}>
            {products.length}
          </span>
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setActive(cat.slug)}
            className={cn(
              "rounded-full border px-5 py-2 text-sm font-medium transition-all duration-200",
              active === cat.slug
                ? "border-roots-green bg-roots-green text-roots-cream shadow-sm"
                : "border-roots-green/20 bg-white text-roots-green hover:border-roots-green/40 hover:bg-roots-green/5"
            )}
          >
            {cat.name}
            <span className={cn(
              "ml-1.5 text-xs",
              active === cat.slug ? "text-roots-cream/70" : "text-roots-green/40"
            )}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Product count */}
      <p className="mb-6 text-sm text-roots-green/50">
        {filtered.length} {filtered.length === 1 ? "product" : "products"}
      </p>

      {/* Product grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard
            key={product.slug}
            name={product.name}
            slug={product.slug}
            price={product.price}
            type={product.type}
            imageUrl={product.imageUrl}
            hasMultipleVariants={product.hasMultipleVariants}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-16 text-center text-roots-green/40">
          No products found in this category.
        </p>
      )}
    </>
  );
}
