import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { collectionService, productService } from "@/services";

export const Route = createFileRoute("/collections")({
  head: () => ({
    meta: [
      { title: "Collections — AVELOR" },
      { name: "description", content: "Curated series, seasonal studies, and foundational wardrobes by AVELOR." },
    ],
  }),
  component: CollectionsIndexPage,
});

export function CollectionsIndexPage() {
  const collections = collectionService.all();

  return (
    <div className="container-page py-10 md:py-16">
      {/* Header */}
      <div className="max-w-2xl mb-12">
        <p className="eyebrow text-subtle">The Wardrobe Series</p>
        <h1 className="font-display text-4xl sm:text-6xl mt-2">Collections</h1>
        <p className="mt-4 text-xs sm:text-base text-muted-foreground leading-relaxed">
          Each AVELOR collection is a material study in silhouette, weight, and function. Built in cohesive series to integrate seamlessly with your existing wardrobe.
        </p>
      </div>

      {/* Grid of collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {collections.map((col) => {
          const matchingCount = productService.all().filter((p) => p.collections.includes(col.slug)).length;
          return (
            <Link
              key={col.slug}
              to="/collections/$slug"
              params={{ slug: col.slug }}
              className="group block space-y-4"
            >
              <div className="aspect-4/5 overflow-hidden bg-secondary relative">
                <img
                  src={col.image}
                  alt={col.title}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl group-hover:underline underline-offset-4">
                    {col.title}
                  </h2>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {col.description}
                </p>
                {matchingCount > 0 && (
                  <p className="mt-2 text-[11px] num text-muted-foreground">
                    {matchingCount} pieces
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
