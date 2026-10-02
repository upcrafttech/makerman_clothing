import { Link } from "@tanstack/react-router";
import { ArrowRight, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { CATEGORIES } from "@/data/products";
import { formatINR } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { productService } from "@/services";

const POPULAR_SEARCHES = [
  "Raw Denim",
  "Overshirt",
  "Heavyweight Tee",
  "Studio Blazer",
  "Poplin Shirt",
  "Merino Wool",
];

export function SearchModal() {
  const { searchOpen, setSearchOpen } = useShop();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
      setQuery("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return productService.all().filter((p) => {
      const q = query.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[85] transition-opacity duration-200",
        searchOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!searchOpen}
    >
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
        onClick={() => setSearchOpen(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search catalog"
        className={cn(
          "relative mx-auto mt-4 sm:mt-16 w-full max-w-2xl bg-background rounded-xs shadow-lift border border-border transition-all duration-300",
          searchOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
        )}
      >
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-border px-4 py-3 sm:px-6">
          <Search className="h-5 w-5 text-muted-foreground shrink-0 mr-3" strokeWidth={1.4} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clothing, materials, silhouettes..."
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 text-muted-foreground hover:text-foreground mr-1"
              aria-label="Clear query"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-xs"
            aria-label="Close search"
          >
            <span className="text-xs uppercase tracking-wider font-medium">Close</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="max-h-[65vh] overflow-y-auto p-4 sm:p-6 space-y-6">
          {query.trim() === "" ? (
            <div className="space-y-6">
              {/* Popular Searches */}
              <div>
                <p className="eyebrow text-subtle mb-3">Trending Searches</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setQuery(term)}
                      className="px-3 py-1.5 text-xs bg-secondary hover:bg-border transition-colors border border-border/50"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div>
                <p className="eyebrow text-subtle mb-3">Browse Categories</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.slice(0, 9).map((cat) => (
                    <Link
                      key={cat.slug}
                      to="/store"
                      search={{ category: cat.slug }}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between p-2.5 text-xs bg-secondary/40 hover:bg-secondary border border-border/40 transition-colors"
                    >
                      <span>{cat.label}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-display text-lg">No results found for "{query}"</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try searching for broader keywords like "shirt", "denim", "knitwear", or "wool".
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="eyebrow text-subtle">{results.length} Products Found</p>
                <Link
                  to="/store"
                  search={{ query }}
                  onClick={() => setSearchOpen(false)}
                  className="text-xs font-medium text-accent hover:underline flex items-center gap-1"
                >
                  View all in store <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {results.slice(0, 8).map((product) => (
                  <Link
                    key={product.slug}
                    to="/product/$slug"
                    params={{ slug: product.slug }}
                    onClick={() => setSearchOpen(false)}
                    className="flex gap-3 p-2 border border-border/60 hover:border-foreground/40 bg-secondary/20 hover:bg-secondary/50 transition-colors"
                  >
                    <img
                      src={product.images[0]}
                      alt=""
                      className="h-16 w-13 shrink-0 object-cover bg-secondary"
                    />
                    <div className="flex flex-col justify-center min-w-0">
                      <p className="eyebrow text-[10px] text-muted-foreground">{product.categoryLabel}</p>
                      <p className="text-xs font-medium truncate leading-tight mt-0.5">{product.name}</p>
                      <p className="num text-xs font-medium mt-1">{formatINR(product.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
