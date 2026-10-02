import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { productService } from "@/services";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Pieces — AVELOR" },
      { name: "description", content: "Compare fabrics, silhouettes, and dimensions side by side." },
    ],
  }),
  component: ComparePage,
});

export function ComparePage() {
  const { compare, toggleCompare, addToCart } = useShop();

  const products = (compare.length > 0 ? compare : ["atlas-heavyweight-tee", "atelier-cotton-overshirt", "straight-column-denim"])
    .map((slug) => productService.bySlug(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div className="container-page py-10 md:py-16">
      <div className="max-w-2xl mb-10">
        <p className="eyebrow text-subtle">Specification Matrix</p>
        <h1 className="font-display text-4xl sm:text-5xl mt-1">Compare Pieces</h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
          Analyze materials, fits, and dimensions side by side to make an informed selection.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border p-8">
          <p className="text-xs text-muted-foreground">No pieces selected for comparison.</p>
          <Button asChild className="mt-4 text-xs uppercase tracking-wider">
            <Link to="/shop">Explore Catalog</Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto pb-6">
          <table className="w-full min-w-[640px] border-collapse border border-border text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="p-4 text-left font-medium w-48 eyebrow text-subtle">Attribute</th>
                {products.map((p) => (
                  <th key={p.slug} className="p-4 text-left font-medium">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-2">
                        <img src={p.images[0]} alt="" className="h-28 w-20 object-cover bg-secondary" />
                        <p className="font-display text-sm font-medium">{p.name}</p>
                        <p className="num text-xs font-semibold">{formatINR(p.price)}</p>
                      </div>
                      {compare.includes(p.slug) && (
                        <button
                          onClick={() => toggleCompare(p.slug)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Remove from compare"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="p-4 font-medium text-muted-foreground bg-secondary/10">Category</td>
                {products.map((p) => (
                  <td key={p.slug} className="p-4 capitalize">{p.categoryLabel}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-muted-foreground bg-secondary/10">Material Composition</td>
                {products.map((p) => (
                  <td key={p.slug} className="p-4">{p.material}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-muted-foreground bg-secondary/10">Fit Block</td>
                {products.map((p) => (
                  <td key={p.slug} className="p-4 font-medium">{p.fit}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-muted-foreground bg-secondary/10">Care Instructions</td>
                {products.map((p) => (
                  <td key={p.slug} className="p-4">{p.care.join(". ")}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-muted-foreground bg-secondary/10">Sizes Offered</td>
                {products.map((p) => (
                  <td key={p.slug} className="p-4 font-mono">{p.sizes.join(", ")}</td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-muted-foreground bg-secondary/10">Available Colors</td>
                {products.map((p) => (
                  <td key={p.slug} className="p-4">
                    <div className="flex gap-1.5">
                      {p.colors.map((c) => (
                        <span
                          key={c.name}
                          title={c.name}
                          className="h-4 w-4 rounded-full border border-border inline-block"
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium text-muted-foreground bg-secondary/10">Action</td>
                {products.map((p) => (
                  <td key={p.slug} className="p-4">
                    <Button
                      size="sm"
                      onClick={() => addToCart(p.slug, p.sizes[0] ?? "M", p.colors[0]?.name ?? "Natural", 1)}
                      className="w-full text-xs uppercase tracking-wider"
                    >
                      Add To Bag
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
