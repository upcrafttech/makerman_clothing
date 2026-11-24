import { Link } from "@tanstack/react-router";
import { AlertCircle, Check, Heart, Maximize2, Minus, Plus, Star, X } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ProductImageLightbox } from "@/components/product/product-image-lightbox";
import { formatINR } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { productService } from "@/services";
import { useProductBySlug } from "@/hooks/use-api";
import { getImagesForColor } from "@/lib/product-images";
import { getVariantStock, isSizeAvailable, getFirstAvailableSize } from "@/lib/product-stock";

export function QuickViewModal() {
  const { quickView, setQuickView, addToCart, toggleWishlist, isWishlisted } = useShop();

  const { data: apiProduct } = useProductBySlug(quickView ?? undefined);
  const product = apiProduct ?? (quickView ? productService.bySlug(quickView) : null);

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const displayImages = useMemo(() => {
    if (!product) return [];
    return getImagesForColor(product, selectedColor);
  }, [product, selectedColor]);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedColor]);

  useEffect(() => {
    if (product) {
      const defaultColor = product.colors[0]?.name ?? "";
      setSelectedColor(defaultColor);
      setSelectedSize(getFirstAvailableSize(product, defaultColor) || product.sizes[0] || "");
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

  // When selectedColor changes, ensure selected size is available
  useEffect(() => {
    if (product && !isSizeAvailable(product, selectedSize, selectedColor)) {
      const firstAvailable = getFirstAvailableSize(product, selectedColor);
      setSelectedSize(firstAvailable ?? "");
    }
  }, [product, selectedColor, selectedSize]);

  if (!product) return null;

  const currentSizeStock = getVariantStock(product, selectedSize, selectedColor);
  const isCurrentSizeAvailable = Boolean(selectedSize) && currentSizeStock > 0;
  const isProductOutOfStock =
    !product.inStock ||
    (product.sizes.length > 0 &&
      product.sizes.every((s) => !isSizeAvailable(product, s, selectedColor)));

  const wished = isWishlisted(product.slug);

  const handleAdd = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    const availableStock = getVariantStock(product, selectedSize, selectedColor);
    if (availableStock <= 0) {
      return;
    }
    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} item(s) available in stock`);
      return;
    }
    const selectedVariant =
      product.variants?.find(
        (v) => v.sizeLabel === selectedSize && v.colorName === selectedColor,
      ) ?? null;
    addToCart(product.id, selectedVariant?.id ?? "", quantity);
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
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="group aspect-4/5 w-full overflow-hidden bg-background/50 relative cursor-zoom-in select-none"
            >
              <img
                src={displayImages[activeImageIndex] ?? displayImages[0]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="bg-background/95 backdrop-blur-xs text-foreground text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                  <Maximize2 className="h-3 w-3 text-amber-600" />
                  View Fullscreen
                </span>
              </div>
              {product.badge && (
                <span className="absolute left-3 top-3 bg-ink text-ink-foreground px-2 py-0.5 text-[10px] uppercase tracking-widest font-medium z-10 pointer-events-none">
                  {product.badge}
                </span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                aria-label="View full screen"
                className="absolute right-3 bottom-3 h-8 w-8 grid place-items-center bg-background/80 hover:bg-background text-foreground rounded-full shadow-xs transition-colors z-10 cursor-pointer"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {displayImages.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (activeImageIndex === idx) {
                        setIsLightboxOpen(true);
                      } else {
                        setActiveImageIndex(idx);
                      }
                    }}
                    className={cn(
                      "h-16 w-12 shrink-0 border overflow-hidden transition-all cursor-pointer",
                      activeImageIndex === idx
                        ? "border-ink ring-1 ring-ink"
                        : "border-border opacity-70 hover:opacity-100",
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

              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description || product.shortDescription}
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
                      onClick={() => {
                        setSelectedColor(c.name);
                        const firstAvailable = getFirstAvailableSize(product, c.name);
                        setSelectedSize(firstAvailable ?? "");
                      }}
                      aria-label={c.name}
                      className={cn(
                        "h-7 w-7 rounded-full border grid place-items-center transition-transform",
                        selectedColor === c.name
                          ? "ring-2 ring-ink ring-offset-2 scale-105 border-transparent"
                          : "border-border",
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
                <div className="flex justify-between items-center text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">Size</span>
                    {selectedSize && isCurrentSizeAvailable && (
                      <span className="text-[11px] text-muted-foreground">
                        ({currentSizeStock} in stock)
                      </span>
                    )}
                  </div>
                  <Link
                    to="/product/$id"
                    params={{ id: product.id }}
                    onClick={() => setQuickView(null)}
                    className="text-muted-foreground hover:text-foreground underline text-[11px]"
                  >
                    View Full Details & Sizing
                  </Link>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {product.sizes.map((s) => {
                    const sizeStock = getVariantStock(product, s, selectedColor);
                    const available = sizeStock > 0;
                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={!available}
                        onClick={() => setSelectedSize(s)}
                        title={!available ? `${s} — Out of stock` : `${s} (${sizeStock} in stock)`}
                        className={cn(
                          "h-10 border text-xs font-medium uppercase transition-colors relative",
                          selectedSize === s && available
                            ? "border-ink bg-ink text-ink-foreground"
                            : available
                              ? "border-border hover:border-foreground/50"
                              : "border-border/60 bg-muted/40 text-muted-foreground/40 opacity-40 cursor-not-allowed line-through hover:border-border/60",
                        )}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4 pt-1">
                <span className="text-xs font-medium">Quantity</span>
                <div className="flex items-center border border-border">
                  <button
                    type="button"
                    disabled={!isCurrentSizeAvailable || isProductOutOfStock}
                    onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                    className="h-8 w-8 grid place-items-center hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="num h-8 w-8 grid place-items-center text-xs font-medium">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={
                      !isCurrentSizeAvailable ||
                      isProductOutOfStock ||
                      (currentSizeStock > 0 && quantity >= currentSizeStock)
                    }
                    onClick={() =>
                      setQuantity((q) =>
                        currentSizeStock > 0 ? Math.min(q + 1, currentSizeStock) : q + 1,
                      )
                    }
                    className="h-8 w-8 grid place-items-center hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed"
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
                  disabled={!isCurrentSizeAvailable || isProductOutOfStock}
                  onClick={handleAdd}
                  className={cn(
                    "flex-1 h-12 text-xs uppercase tracking-wider font-medium transition-all",
                    !isCurrentSizeAvailable || isProductOutOfStock
                      ? "bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted opacity-60"
                      : "bg-ink text-ink-foreground hover:bg-ink/90",
                  )}
                >
                  {!selectedSize
                    ? "Select Size"
                    : !isCurrentSizeAvailable || isProductOutOfStock
                      ? "Out of Stock"
                      : `Add to Bag — ${formatINR(product.price * quantity)}`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => toggleWishlist(product.slug)}
                  className="h-12 w-12 p-0 grid place-items-center"
                  aria-label={wished ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart
                    className={cn(
                      "h-4 w-4 transition-colors",
                      wished ? "fill-amber-500 text-amber-500" : "text-foreground",
                    )}
                  />
                </Button>
              </div>

              <Button
                asChild
                variant="ghost"
                className="w-full text-xs text-muted-foreground hover:text-foreground"
                onClick={() => setQuickView(null)}
              >
                <Link to="/product/$id" params={{ id: product.id }}>
                  View Full Product Details →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ProductImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={displayImages}
        initialIndex={activeImageIndex}
        productName={product.name}
      />
    </div>
  );
}
