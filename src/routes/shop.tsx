import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/data/products";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { applyFilters, productService, sortProducts } from "@/services";
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

export const Route = createFileRoute("/shop")({
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
      { title: "Shop All — AVELOR" },
      {
        name: "description",
        content: "Explore the full AVELOR range of modern essentials, tailoring, knitwear, and denim.",
      },
    ],
  }),
  component: ShopPage,
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
const MATERIALS = ["Cotton", "Wool", "Denim", "Linen", "Silk", "Cashmere"];

export function ShopPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const activeSort = search.sort ?? "featured";
  const activeCategory = search.category;
  const activeGender = search.gender ?? "all";
  const activeSize = search.size;
  const activeColor = search.color;
  const activeMaterial = search.material;
  const activeInStock = search.inStock ?? false;
  const activeQuery = search.query;

  // Filter products
  const filteredProducts = useMemo(() => {
    const filters: Partial<ProductFilters> = {
      categories: activeCategory ? [activeCategory] : undefined,
      gender: activeGender,
      sizes: activeSize ? [activeSize] : undefined,
      colors: activeColor ? [activeColor] : undefined,
      materials: activeMaterial ? [activeMaterial] : undefined,
      inStockOnly: activeInStock,
      query: activeQuery,
    };
    const list = applyFilters(productService.all(), filters);
    return sortProducts(list, activeSort);
  }, [activeCategory, activeGender, activeSize, activeColor, activeMaterial, activeInStock, activeQuery, activeSort]);

  const updateSearch = (patch: Partial<SearchParams>) => {
    navigate({
      search: (prev) => {
        const next = { ...prev, ...patch };
        // Clean undefined
        Object.keys(next).forEach((k) => {
          if ((next as Record<string, unknown>)[k] === undefined) {
            delete (next as Record<string, unknown>)[k];
          }
        });
        return next;
      },
    });
  };

  const clearAllFilters = () => {
    navigate({ search: {} });
  };

  const hasActiveFilters = Boolean(
    activeCategory ||
      (activeGender && activeGender !== "all") ||
      activeSize ||
      activeColor ||
      activeMaterial ||
      activeInStock ||
      activeQuery
  );

  return (
    <div className="container-page py-8 md:py-12">
      {/* Header & Breadcrumb */}
      <div className="border-b border-border pb-6 mb-8">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <span className="text-foreground">Shop</span>
          {activeCategory && (
            <>
              <span>/</span>
              <span className="text-foreground capitalize">{activeCategory.replace(/-/g, " ")}</span>
            </>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-5xl capitalize">
              {activeCategory
                ? CATEGORIES.find((c) => c.slug === activeCategory)?.label ?? activeCategory
                : activeGender !== "all"
                ? `${activeGender}'s Collection`
                : "All Wardrobe Pieces"}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl">
              Modern essentials crafted from organic cottons, natural wools, and dense selvedge denim.
            </p>
          </div>
          <p className="num text-xs text-muted-foreground shrink-0">
            {filteredProducts.length} pieces
          </p>
        </div>
      </div>

      {/* Filter Bar & Controls */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-xs py-3 border-b border-border mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Gender toggle */}
          <div className="flex items-center gap-1 border border-border p-0.5 bg-secondary/30">
            {(["all", "women", "men"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => updateSearch({ gender: g === "all" ? undefined : g })}
                className={cn(
                  "px-3 py-1.5 text-xs uppercase tracking-wider font-medium transition-colors",
                  activeGender === g ? "bg-background shadow-xs text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilterDrawerOpen(true)}
              className="lg:hidden h-9 text-xs"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
              Filters {hasActiveFilters && "•"}
            </Button>

            {/* Sort dropdown */}
            <div className="relative flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-muted-foreground">Sort:</span>
              <select
                value={activeSort}
                onChange={(e) => updateSearch({ sort: e.target.value as SortKey })}
                className="h-9 border border-border bg-background px-3 pr-8 text-xs outline-none cursor-pointer focus:border-ink"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active filter pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-3">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Active:</span>
            {activeCategory && (
              <span className="inline-flex items-center gap-1 bg-secondary px-2.5 py-1 text-xs border border-border">
                {activeCategory}
                <button onClick={() => updateSearch({ category: undefined })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {activeSize && (
              <span className="inline-flex items-center gap-1 bg-secondary px-2.5 py-1 text-xs border border-border">
                Size: {activeSize}
                <button onClick={() => updateSearch({ size: undefined })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {activeColor && (
              <span className="inline-flex items-center gap-1 bg-secondary px-2.5 py-1 text-xs border border-border">
                Color: {activeColor}
                <button onClick={() => updateSearch({ color: undefined })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {activeMaterial && (
              <span className="inline-flex items-center gap-1 bg-secondary px-2.5 py-1 text-xs border border-border">
                {activeMaterial}
                <button onClick={() => updateSearch({ material: undefined })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {activeInStock && (
              <span className="inline-flex items-center gap-1 bg-secondary px-2.5 py-1 text-xs border border-border">
                In Stock Only
                <button onClick={() => updateSearch({ inStock: undefined })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {activeQuery && (
              <span className="inline-flex items-center gap-1 bg-secondary px-2.5 py-1 text-xs border border-border">
                "{activeQuery}"
                <button onClick={() => updateSearch({ query: undefined })}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-accent underline ml-2 hover:text-foreground"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main Grid + Desktop Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-10 items-start">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block space-y-8 pr-6 border-r border-border sticky top-36">
          {/* Categories */}
          <div>
            <p className="eyebrow text-subtle mb-3">Category</p>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => updateSearch({ category: undefined })}
                  className={cn(
                    "w-full text-left py-1 hover:text-foreground transition-colors",
                    !activeCategory ? "font-medium text-foreground underline underline-offset-4" : "text-muted-foreground"
                  )}
                >
                  All Categories
                </button>
              </li>
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <button
                    type="button"
                    onClick={() => updateSearch({ category: activeCategory === cat.slug ? undefined : cat.slug })}
                    className={cn(
                      "w-full text-left py-1 hover:text-foreground transition-colors",
                      activeCategory === cat.slug ? "font-medium text-foreground underline underline-offset-4" : "text-muted-foreground"
                    )}
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Sizes */}
          <div>
            <p className="eyebrow text-subtle mb-3">Size</p>
            <div className="grid grid-cols-4 gap-1.5">
              {SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => updateSearch({ size: activeSize === s ? undefined : s })}
                  className={cn(
                    "h-8 border text-xs font-medium uppercase transition-colors",
                    activeSize === s ? "border-ink bg-ink text-ink-foreground" : "border-border hover:border-foreground/40"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <p className="eyebrow text-subtle mb-3">Color</p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  title={c.name}
                  onClick={() => updateSearch({ color: activeColor === c.name ? undefined : c.name })}
                  className={cn(
                    "h-6 w-6 rounded-full border grid place-items-center transition-transform",
                    activeColor === c.name ? "ring-2 ring-ink ring-offset-2 scale-110" : "border-border"
                  )}
                  style={{ backgroundColor: c.hex }}
                >
                  {activeColor === c.name && (
                    <Check
                      className={cn(
                        "h-3 w-3",
                        c.hex.toLowerCase() === "#ffffff" || c.hex.toLowerCase() === "#efe9df"
                          ? "text-black"
                          : "text-white"
                      )}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Material */}
          <div>
            <p className="eyebrow text-subtle mb-3">Material</p>
            <div className="flex flex-wrap gap-1.5">
              {MATERIALS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => updateSearch({ material: activeMaterial === m ? undefined : m })}
                  className={cn(
                    "px-2.5 py-1 border text-xs transition-colors",
                    activeMaterial === m ? "border-ink bg-ink text-ink-foreground" : "border-border hover:border-foreground/40"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
              <input
                type="checkbox"
                checked={activeInStock}
                onChange={(e) => updateSearch({ inStock: e.target.checked ? true : undefined })}
                className="h-4 w-4 border-border rounded-xs accent-ink"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Catalog Grid */}
        <div>
          {filteredProducts.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-border p-8">
              <h3 className="font-display text-xl">No matching pieces found</h3>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                We couldn't find any items matching your active filter criteria.
              </p>
              <Button onClick={clearAllFilters} className="mt-6 text-xs uppercase tracking-wider">
                Reset All Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[85] transition-opacity duration-300 lg:hidden",
          filterDrawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        <div
          className="absolute inset-0 bg-ink/60 backdrop-blur-xs"
          onClick={() => setFilterDrawerOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 right-0 w-full max-w-sm bg-background p-6 flex flex-col justify-between shadow-lift transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
            filterDrawerOpen ? "translate-x-0" : "translate-x-full"
          )}
        >
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="font-display text-lg">Filters</h3>
            <button onClick={() => setFilterDrawerOpen(false)} className="p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            {/* Category */}
            <div>
              <p className="eyebrow text-subtle mb-3">Category</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => updateSearch({ category: activeCategory === c.slug ? undefined : c.slug })}
                    className={cn(
                      "px-3 py-1.5 text-xs border",
                      activeCategory === c.slug ? "bg-ink text-ink-foreground border-ink" : "border-border"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <p className="eyebrow text-subtle mb-3">Size</p>
              <div className="grid grid-cols-4 gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateSearch({ size: activeSize === s ? undefined : s })}
                    className={cn(
                      "h-9 border text-xs font-medium uppercase",
                      activeSize === s ? "bg-ink text-ink-foreground border-ink" : "border-border"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <p className="eyebrow text-subtle mb-3">Color</p>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => updateSearch({ color: activeColor === c.name ? undefined : c.name })}
                    className={cn(
                      "h-8 w-8 rounded-full border grid place-items-center",
                      activeColor === c.name ? "ring-2 ring-ink ring-offset-2 scale-105" : "border-border"
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-4 grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => {
                clearAllFilters();
                setFilterDrawerOpen(false);
              }}
              className="h-11 text-xs uppercase tracking-wider"
            >
              Clear All
            </Button>
            <Button
              onClick={() => setFilterDrawerOpen(false)}
              className="h-11 text-xs uppercase tracking-wider"
            >
              Show ({filteredProducts.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
