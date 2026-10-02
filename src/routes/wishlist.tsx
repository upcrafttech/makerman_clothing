import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { useShop } from "@/lib/shop-store";
import { productService } from "@/services";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — AVELOR" },
      { name: "description", content: "Your saved pieces and wardrobe aspirations." },
    ],
  }),
  component: WishlistPage,
});

export function WishlistPage() {
  const { wishlist, moveWishlistToCart, toggleWishlist } = useShop();

  const wishlistedProducts = wishlist
    .map((slug) => productService.bySlug(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const handleMoveAll = () => {
    wishlist.forEach((slug) => {
      moveWishlistToCart(slug);
    });
    toast.success("All saved pieces moved to your shopping bag.");
  };

  return (
    <div className="container-page py-10 md:py-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border pb-6 mb-8 gap-4">
        <div>
          <p className="eyebrow text-subtle">Saved Curation</p>
          <h1 className="font-display text-3xl sm:text-5xl mt-1">Wishlist</h1>
        </div>

        {wishlistedProducts.length > 0 && (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMoveAll}
              className="text-xs uppercase tracking-wider"
            >
              Move All to Bag
            </Button>
          </div>
        )}
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border p-8 max-w-md mx-auto">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-muted-foreground mx-auto mb-4">
            <Heart className="h-8 w-8" strokeWidth={1.2} />
          </div>
          <h2 className="font-display text-2xl">No saved pieces</h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Tap the heart icon on any product to curate your personal wardrobe wishlist.
          </p>
          <Button asChild className="mt-6 text-xs uppercase tracking-wider">
            <Link to="/shop">Explore New Arrivals</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
