import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { collectionService, productService, sortProducts } from "@/services";
import type { SortKey } from "@/types";

export const Route = createFileRoute("/collections/$slug")({
  loader: async ({ params }) => {
    const collection = collectionService.bySlug(params.slug);
    if (!collection) {
      throw notFound();
    }
    return { collection };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.collection;
    return {
      meta: [
        { title: c ? `${c.title} — AVELOR` : "Collection — AVELOR" },
        { name: "description", content: c?.description ?? "AVELOR curated collection pieces." },
      ],
    };
  },
  component: CollectionDetailPage,
});

export function CollectionDetailPage() {
  const { collection } = Route.useLoaderData();
  const [sort, setSort] = useState<SortKey>("featured");

  const products = useMemo(() => {
    const all = productService.all();
    let matching = all.filter((p) => p.collections.includes(collection.slug));
    if (matching.length === 0) {
      if (collection.slug === "women") {
        matching = all.filter((p) => p.gender === "women" || p.gender === "unisex");
      } else if (collection.slug === "men") {
        matching = all.filter((p) => p.gender === "men" || p.gender === "unisex");
      } else {
        matching = all.slice(0, 8);
      }
    }
    return sortProducts(matching, sort);
  }, [collection.slug, sort]);

  return (
    <div>
      {/* Editorial Collection Banner */}
      <section className="relative min-h-[50vh] sm:min-h-[60vh] flex items-end bg-secondary overflow-hidden">
        <img
          src={collection.image}
          alt={collection.title}
          className="absolute inset-0 h-full w-full object-cover brightness-[0.85]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="container-page relative z-10 pb-12 pt-24 text-white">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-white/70 mb-3">
              <Link to="/" className="hover:text-white">Home</Link>
              <span>/</span>
              <Link to="/collections" className="hover:text-white">Collections</Link>
              <span>/</span>
              <span className="text-white">{collection.title}</span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl text-white font-normal">{collection.title}</h1>
            <p className="mt-3 text-xs sm:text-base text-white/80 leading-relaxed font-light">
              {collection.description}
            </p>
          </div>
        </div>
      </section>

      {/* Catalog & Sorting */}
      <div className="container-page py-10 md:py-14">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
          <p className="num text-xs text-muted-foreground">{products.length} pieces in series</p>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-8 border border-border bg-background px-2 text-xs outline-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
