import { Link } from "@tanstack/react-router";
import { Check, Heart, Minus, Plus, Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { productService } from "@/services";

export function QuickViewModal() {
  const { quickView, setQuickView, addToCart, toggleWishlist, isWishlisted } = useShop();

  const product = quickView ? productService.bySlug(quickView) : null;

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]?.name ?? "");
      setSelectedSize(product.sizes[0] ?? "");
      setQuantity(1);
      setActiveImageIndex(0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [product]);

  if (!product) return null;

  const wished = isWishlisted(product.slug);

  const handleAdd = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    addToCart(product.slug, selectedSize, selectedColor, quantity);
    setQuickView(null);
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6 transition-opacity duration-200",
        quickView ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!quickView}
    >
      <div
        className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={() => setQuickView(null)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Quick view: ${product.name}`}
        className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-xs shadow-lift border border-border"
      >
        <button
          type="button"
          onClick={() => setQuickView(null)}
          className="absolute right-4 top-4 z-20 grid h-10 w-10 place-items-center bg-background/80 backdrop-blur-xs text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery / Image preview */}
          <div className="bg-secondary p-6 flex flex-col justify-between">
            <div className="aspect-4/5 w-full overflow-hidden bg-background/50 relative">
              <img
                src={product.images[activeImageIndex] ?? product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              {product.badge && (
                <span className="absolute left-3 top-3 bg-ink text-ink-foreground px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium">
                  {product.badge}
                </span>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={cn(
                      "h-16 w-12 shrink-0 border overflow-hidden transition-all",
                      activeImageIndex === idx ? "border-ink ring-1 ring-ink" : "border-border opacity-70 hover:opacity-100",
                    )}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details and Actions */}
          <div className="p-6 md:p-8 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <p className="eyebrow text-subtle">{product.categoryLabel}</p>
                <h2 className="font-display text-2xl mt-1 leading-snug">{product.name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="num text-lg font-medium">{formatINR(product.price)}</span>
                    {product.compareAtPrice && (
                      <span className="num text-sm text-muted-foreground line-through">
                        {formatINR(product.compareAtPrice)}
                      </span>
                    )}
                  </div>
                  <span className="text-border">|</span>
                  <div className="flex items-center text-xs text-muted-foreground gap-1">
                    <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
                    <span className="num font-medium text-foreground">{product.rating}</span>
                    <span>({product.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {product.shortDescription}
              </p>

              {/* Color selector */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-medium text-foreground">Color</span>
                  <span className="text-muted-foreground">{selectedColor}</span>
                </div>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.name)}
                      aria-label={c.name}
                      className={cn(
                        "h-7 w-7 rounded-full border grid place-items-center transition-transform",
                        selectedColor === c.name ? "ring-2 ring-ink ring-offset-2 scale-105 border-transparent" : "border-border",
                      )}
                      style={{ backgroundColor: c.hex }}
                    >
                      {selectedColor === c.name && (
                        <Check
                          className={cn(
                            "h-3.5 w-3.5",
                            c.hex.toLowerCase() === "#ffffff" || c.hex.toLowerCase() === "#efe9df"
                              ? "text-black"
                              : "text-white",
                          )}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size selector */}
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="font-medium text-foreground">Size</span>
                  <Link
                    to="/size-guide"
                    onClick={() => setQuickView(null)}
                    className="text-muted-foreground hover:text-foreground underline"
                  >
                    Size Guide
                  </Link>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={cn(
                        "h-10 border text-xs font-medium uppercase transition-colors",
                        selectedSize === s
                          ? "border-ink bg-ink text-ink-foreground"
                          : "border-border hover:border-foreground/50",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 pt-1">
                <span className="text-xs font-medium">Quantity</span>
                <div className="flex items-center border border-border">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                    className="h-8 w-8 grid place-items-center hover:bg-secondary"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="num h-8 w-8 grid place-items-center text-xs font-medium">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="h-8 w-8 grid place-items-center hover:bg-secondary"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-6 space-y-3">
              <div className="flex gap-2">
                <Button
                  onClick={handleAdd}
                  className="flex-1 h-12 text-xs uppercase tracking-wider font-medium"
                >
                  Add to Bag — {formatINR(product.price * quantity)}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => toggleWishlist(product.slug)}
                  className="h-12 w-12 p-0 grid place-items-center"
                  aria-label="Wishlist"
                >
                  <Heart
                    className={cn("h-4 w-4", wished ? "fill-foreground text-foreground" : "")}
                  />
                </Button>
              </div>

              <Button
                asChild
                variant="ghost"
                className="w-full text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setQuickView(null)}
              >
                <Link to="/product/$slug" params={{ slug: product.slug }}>
                  View Full Product Details →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
