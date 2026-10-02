import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { ProductCard, ProductCardSkeleton } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/data/products";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { applyFilters, productService, sortProducts } from "@/services";
import { useProducts } from "@/hooks/use-api";
import type { ProductFilters, SortKey } from "@/types";

type SearchParams = {
  category?: string | undefined;
  collection?: string | undefined;
  gender?: "all" | "women" | "men" | undefined;
  query?: string | undefined;
  sort?: SortKey | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  inStock?: boolean | undefined;
  size?: string | undefined;
  color?: string | undefined;
  material?: string | undefined;
};

export const Route = createFileRoute("/store")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    collection: typeof search["collection"] === "string" ? search["collection"] : undefined,
    gender: ["all", "women", "men"].includes(search["gender"] as string)
      ? (search["gender"] as "all" | "women" | "men")
      : undefined,
    query: typeof search["query"] === "string" ? search["query"] : undefined,
    sort: typeof search["sort"] === "string" ? (search["sort"] as SortKey) : "featured",
    minPrice: typeof search["minPrice"] === "number" ? search["minPrice"] : undefined,
    maxPrice: typeof search["maxPrice"] === "number" ? search["maxPrice"] : undefined,
    inStock: search["inStock"] === true || search["inStock"] === "true",
    size: typeof search["size"] === "string" ? search["size"] : undefined,
    color: typeof search["color"] === "string" ? search["color"] : undefined,
    material: typeof search["material"] === "string" ? search["material"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Store — MAKERMAN | Feeling Happiness" },
      {
        name: "description",
        content:
          "Explore the Makerman collection of premium modern essentials, refined tailoring, knitwear, and durable shirting.",
      },
      { property: "og:title", content: "Makerman Store — Refined Modern Essentials" },
    ],
  }),
  component: StorePage,
});

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38"];
const COLORS = [
  { name: "Ecru", hex: "#EFE9DF" },
  { name: "Bone", hex: "#E3DCD1" },
  { name: "Sand", hex: "#D8C7AE" },
  { name: "Clay", hex: "#B99B7B" },
  { name: "Charcoal", hex: "#3A3A3A" },
  { name: "Black", hex: "#171717" },
  { name: "Indigo", hex: "#3D4A63" },
  { name: "Olive", hex: "#6B6A4B" },
];

export function StorePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/store" });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const activeSort = search.sort ?? "featured";
  const activeCategory = search.category;
  const activeGender = search.gender ?? "all";
  const activeCollection = search.collection;
  const activeSize = search.size;
  const activeColor = search.color;
  const activeInStock = search.inStock ?? false;
  const activeQuery = search.query;

  const { data: apiData, isLoading } = useProducts({
    search: activeQuery,
    sort: activeSort === "newest" ? "newest" : undefined,
  });

  // Filter products
  const filteredProducts = useMemo(() => {
    const filters: Partial<ProductFilters> = {
      categories: activeCategory ? [activeCategory] : undefined,
      gender: activeGender,
      collections: activeCollection ? [activeCollection] : undefined,
      sizes: activeSize ? [activeSize] : undefined,
      colors: activeColor ? [activeColor] : undefined,
      inStockOnly: activeInStock,
      query: activeQuery,
    };
    const base =
      apiData?.content && apiData.content.length > 0
        ? apiData.content
        : productService.all();
    const filtered = applyFilters(base, filters);
    return sortProducts(filtered, activeSort);
  }, [
    apiData,
    activeCategory,
    activeGender,
    activeCollection,
    activeSize,
    activeColor,
    activeInStock,
    activeQuery,
    activeSort,
  ]);

  // Active filter count for badge
  const activeFilterCount = [
    activeCategory,
    activeGender !== "all" ? activeGender : null,
    activeCollection,
    activeSize,
    activeColor,
    activeInStock ? "inStock" : null,
  ].filter(Boolean).length;

  const updateParam = (key: keyof SearchParams, val: unknown) => {
    navigate({
      search: (prev) => ({
        ...prev,
        [key]: val === undefined || val === "" || val === "all" ? undefined : val,
      }),
    });
  };

  const clearAllFilters = () => {
    navigate({
      search: {
        sort: activeSort,
        query: activeQuery,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Editorial Store Header */}
      <section className="border-b border-border/70 bg-[#FAF8F5] py-10 md:py-14">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow text-amber-600 font-semibold tracking-widest">
              Makerman Collection
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-foreground">
              {activeCollection === "new-arrivals"
                ? "New Arrivals"
                : activeGender === "men"
                  ? "Men's Wardrobe"
                  : activeGender === "women"
                    ? "Women's Wardrobe"
                    : activeCategory
                      ? CATEGORIES.find((c) => c.slug === activeCategory)?.label ?? "Curated Store"
                      : "The Complete Store"}
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Quiet proportions, honest materials, and durable construction designed for everyday ease.
            </p>
          </div>

          {/* Quick Category Tabs */}
          <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-border/60 pt-6">
            {[
              { label: "All Garments", gender: "all", collection: undefined },
              { label: "New Arrivals", gender: undefined, collection: "new-arrivals" },
              { label: "Men", gender: "men", collection: undefined },
              { label: "Women", gender: "women", collection: undefined },
            ].map((tab) => {
              const isSelected =
                tab.collection
                  ? activeCollection === tab.collection
                  : tab.gender === activeGender && !activeCollection;

              return (
                <button
                  key={tab.label}
                  type="button"
                  onClick={() => {
                    navigate({
                      search: (prev) => ({
                        ...prev,
                        gender: tab.gender as "all" | "women" | "men" | undefined,
                        collection: tab.collection,
                        category: undefined,
                      }),
                    });
                  }}
                  className={cn(
                    "h-9 px-4 text-xs font-medium uppercase tracking-wider rounded-sm transition-all select-none",
                    isSelected
                      ? "bg-foreground text-background shadow-xs font-semibold"
                      : "bg-surface border border-border/80 text-foreground/80 hover:bg-secondary",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container-page pt-8">
        {/* Mobile Filter & Sort Control Strip */}
        <div className="flex items-center justify-between pb-6 lg:hidden border-b border-border/60 mb-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFilterDrawerOpen(true)}
            className="h-11 px-4 text-xs font-medium uppercase tracking-wider border-border flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[0.625rem] text-ink-foreground font-semibold">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {/* Mobile Sort Dropdown */}
          <div className="relative">
            <select
              value={activeSort}
              onChange={(e) => updateParam("sort", e.target.value as SortKey)}
              className="h-11 appearance-none rounded-sm border border-border bg-background px-3 pr-8 text-xs font-medium uppercase tracking-wider text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              aria-label="Sort products"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* Desktop Grid Layout (Filter Sidebar + Product Grid) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
          
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-7">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs uppercase font-semibold tracking-widest text-foreground">
                Filters
              </span>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 text-[0.6875rem] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                Category
              </p>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => updateParam("category", activeCategory === cat.slug ? undefined : cat.slug)}
                    className={cn(
                      "flex w-full items-center justify-between text-xs py-1 px-1.5 rounded-sm transition-colors text-left",
                      activeCategory === cat.slug
                        ? "font-semibold text-foreground bg-secondary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <span>{cat.label}</span>
                    {activeCategory === cat.slug && <Check className="h-3.5 w-3.5 text-foreground" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="border-t border-border/60 pt-5 space-y-3">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                Size
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => updateParam("size", activeSize === sz ? undefined : sz)}
                    className={cn(
                      "h-8 text-xs font-medium rounded-xs border transition-colors",
                      activeSize === sz
                        ? "border-foreground bg-foreground text-background font-semibold"
                        : "border-border/80 bg-surface text-foreground/80 hover:border-foreground/40",
                    )}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Filter */}
            <div className="border-t border-border/60 pt-5 space-y-3">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                Color
              </p>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => updateParam("color", activeColor === col.name ? undefined : col.name)}
                    title={col.name}
                    className={cn(
                      "h-6 w-6 rounded-full border transition-all p-0.5",
                      activeColor === col.name ? "ring-2 ring-foreground scale-110" : "border-border",
                    )}
                  >
                    <span
                      className="block h-full w-full rounded-full"
                      style={{ backgroundColor: col.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="border-t border-border/60 pt-5">
              <label className="flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={activeInStock}
                  onChange={(e) => updateParam("inStock", e.target.checked ? true : undefined)}
                  className="h-4 w-4 rounded-xs border-border text-foreground accent-foreground"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Product Grid Container */}
          <main className="min-w-0">
            {/* Desktop Top Toolbar (Count + Sort) */}
            <div className="hidden lg:flex items-center justify-between pb-6 border-b border-border/60 mb-8">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Showing <span className="font-semibold text-foreground">{filteredProducts.length}</span> {filteredProducts.length === 1 ? "garment" : "garments"}
              </p>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Sort by:</span>
                <div className="relative">
                  <select
                    value={activeSort}
                    onChange={(e) => updateParam("sort", e.target.value as SortKey)}
                    className="h-9 appearance-none rounded-sm border border-border bg-background px-3 pr-8 text-xs font-medium uppercase tracking-wider text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    aria-label="Sort products"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest Arrivals</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
                  Active:
                </span>
                {activeCategory && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-secondary text-foreground rounded-sm">
                    {CATEGORIES.find((c) => c.slug === activeCategory)?.label ?? activeCategory}
                    <button type="button" onClick={() => updateParam("category", undefined)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {activeGender !== "all" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-secondary text-foreground rounded-sm uppercase">
                    {activeGender}
                    <button type="button" onClick={() => updateParam("gender", undefined)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {activeSize && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-secondary text-foreground rounded-sm">
                    Size: {activeSize}
                    <button type="button" onClick={() => updateParam("size", undefined)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {activeColor && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-secondary text-foreground rounded-sm">
                    Color: {activeColor}
                    <button type="button" onClick={() => updateParam("color", undefined)}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-amber-600 hover:underline ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Products Grid: 2 cols on mobile, 3 cols tablet, 4 cols desktop */}
            {isLoading && !apiData ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <ProductCardSkeleton key={idx} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-sm p-8">
                <Filter className="h-10 w-10 text-muted-foreground/40 mb-4" />
                <h3 className="font-display text-xl font-medium text-foreground">No garments match your filters</h3>
                <p className="mt-2 text-xs text-muted-foreground max-w-sm leading-relaxed">
                  Try clearing some filter options or changing your category to view available pieces.
                </p>
                <Button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-6 h-11 px-6 text-xs uppercase tracking-wider bg-ink text-ink-foreground"
                >
                  Reset All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product, idx) => (
                  <ProductCard
                    key={product.slug}
                    product={product}
                    priority={idx < 4}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer (Bottom Sheet) */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300 lg:hidden",
          filterDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          onClick={() => setFilterDrawerOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 max-h-[85vh] flex flex-col bg-background rounded-t-lg shadow-2xl transition-transform duration-300 ease-out",
            filterDrawerOpen ? "translate-y-0" : "translate-y-full",
          )}
        >
          {/* Drawer Handle & Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <p className="font-display text-lg font-medium">Filter Garments</p>
              <p className="text-xs text-muted-foreground">{filteredProducts.length} pieces available</p>
            </div>
            <button
              type="button"
              onClick={() => setFilterDrawerOpen(false)}
              className="h-11 w-11 grid place-items-center rounded-sm text-foreground/70"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Category */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Category
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => updateParam("category", activeCategory === cat.slug ? undefined : cat.slug)}
                    className={cn(
                      "h-9 px-3 text-xs rounded-sm border transition-colors",
                      activeCategory === cat.slug
                        ? "bg-foreground text-background font-semibold border-foreground"
                        : "bg-surface border-border text-foreground/80",
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Size
              </p>
              <div className="grid grid-cols-4 gap-2">
                {SIZES.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => updateParam("size", activeSize === sz ? undefined : sz)}
                    className={cn(
                      "h-10 text-xs font-medium rounded-sm border transition-colors",
                      activeSize === sz
                        ? "bg-foreground text-background font-semibold border-foreground"
                        : "bg-surface border-border text-foreground/80",
                    )}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Color
              </p>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => updateParam("color", activeColor === col.name ? undefined : col.name)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-sm border text-xs",
                      activeColor === col.name ? "border-foreground font-semibold" : "border-border",
                    )}
                  >
                    <span className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: col.hex }} />
                    {col.name}
                  </button>
                ))}
              </div>
            </div>

            {/* In Stock */}
            <div className="border-t border-border pt-4">
              <label className="flex items-center gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={activeInStock}
                  onChange={(e) => updateParam("inStock", e.target.checked ? true : undefined)}
                  className="h-5 w-5 rounded-xs accent-foreground"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="p-4 border-t border-border bg-background flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={clearAllFilters}
              className="flex-1 h-12 text-xs uppercase tracking-wider"
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={() => setFilterDrawerOpen(false)}
              className="flex-1 h-12 text-xs uppercase tracking-wider bg-ink text-ink-foreground"
            >
              Apply ({filteredProducts.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
