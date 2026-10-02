import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { useShop } from "@/lib/shop-store";
import { productService } from "@/services";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favorites — MAKERMAN | Feeling Happiness" },
      { name: "description", content: "Your curated Makerman favorites and wardrobe selections." },
      { property: "og:title", content: "Favorites — Makerman Clothing" },
    ],
  }),
  component: FavoritesPage,
});

export function FavoritesPage() {
  const { wishlist, moveWishlistToCart } = useShop();

  const favoriteProducts = wishlist
    .map((slug) => productService.bySlug(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const handleMoveAllToBag = () => {
    if (wishlist.length === 0) return;
    wishlist.forEach((slug) => {
      moveWishlistToCart(slug);
    });
    toast.success("All favorites moved to your bag");
  };

  return (
    <div className="min-h-[70vh] bg-background py-10 md:py-16">
      <div className="container-page">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border/80 pb-6 mb-8 gap-4">
          <div>
            <p className="eyebrow text-amber-600 font-semibold tracking-widest">
              Curated Selection
            </p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal tracking-tight text-foreground mt-1">
              Favorites
            </h1>
          </div>

          {favoriteProducts.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wider hidden sm:inline">
                {favoriteProducts.length} {favoriteProducts.length === 1 ? "item" : "items"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMoveAllToBag}
                className="h-10 px-4 text-xs font-semibold uppercase tracking-wider border-border hover:bg-secondary"
              >
                <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
                Move All to Bag
              </Button>
            </div>
          )}
        </div>

        {/* Empty State per Requirement: "Your favourites are waiting." CTA: "EXPLORE STORE" */}
        {favoriteProducts.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-border rounded-sm p-8 max-w-md mx-auto my-8">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-amber-500 mx-auto mb-5">
              <Heart className="h-7 w-7 fill-amber-500/20 stroke-amber-500" strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl text-foreground font-normal">
              Your favourites are waiting.
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Save the garments you love to curate your timeless personal wardrobe.
            </p>
            <Button
              asChild
              className="mt-7 h-12 px-8 text-xs font-semibold uppercase tracking-widest bg-ink text-ink-foreground hover:bg-ink/90"
            >
              <Link to="/store" className="inline-flex items-center gap-2">
                <span>Explore Store</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        ) : (
          /* Products Grid: 2 columns on mobile, 4 columns on desktop */
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
