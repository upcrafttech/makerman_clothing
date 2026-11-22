import { createFileRoute, isRedirect, Link, notFound, redirect, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Feather,
  Heart,
  Maximize2,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Ruler,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/product/product-card";
import { ProductImageLightbox } from "@/components/product/product-image-lightbox";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { getWhatsAppHref, formatPhoneDisplay } from "@/lib/contact";
import { cn } from "@/lib/utils";
import { productService, reviewService } from "@/services";
import { adaptProduct, registerProducts, getRegisteredProduct, getAllRegisteredProducts } from "@/lib/adapters";
import { getImagesForColor } from "@/lib/product-images";
import { getVariantStock, isSizeAvailable, getFirstAvailableSize } from "@/lib/product-stock";
import { apiFetch } from "@/lib/api-client";
import { useProductReviews } from "@/hooks/use-api";
import type { ApiProduct, ApiPagedProducts } from "@/types/api";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ params }) => {
    const rawParam = params.id?.trim() || "";

    // 1. Try registry by UUID or slug
    let product = getRegisteredProduct(rawParam);

    // 2. Fetch by UUID directly from backend if rawParam looks like a UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawParam);
    if (!product && isUuid) {
      try {
        const raw = await apiFetch<ApiProduct>(`/products/${rawParam}`);
        if (raw && raw.id) {
          product = adaptProduct(raw);
          registerProducts([product]);
        }
      } catch {
        /* fallback to active product list search */
      }
    }

    // 3. Fallback: Search all active products by slug, ID, or normalized product name (e.g. /product/kurtas or /product/test)
    if (!product) {
      try {
        const json = await apiFetch<ApiPagedProducts>("/products?page=0&size=100&status=ACTIVE");
        const adapted = (json.content ?? []).map(adaptProduct);
        registerProducts(adapted);

        const normalizedParam = rawParam.toLowerCase();
        const matched = adapted.find(
          (p) =>
            p.id.toLowerCase() === normalizedParam ||
            p.slug.toLowerCase() === normalizedParam ||
            p.name.toLowerCase() === normalizedParam ||
            p.name.toLowerCase().replace(/\s+/g, "-") === normalizedParam,
        );

        if (matched) {
          // If accessing via slug/name, redirect to canonical ID URL
          if (matched.id !== rawParam) {
            throw redirect({ to: "/product/$id", params: { id: matched.id } });
          }
          product = matched;
        }
      } catch (err) {
        if (isRedirect(err)) throw err;
      }
    }

    if (!product) {
      throw notFound();
    }
    return { product };
  },
  notFoundComponent: ProductNotFoundView,
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    return {
      meta: [
        { title: p ? `${p.name} — MAKERMAN | Feeling Happiness` : "Product Details — MAKERMAN" },
        {
          name: "description",
          content: p?.shortDescription ?? "Makerman garment details, materials and fit.",
        },
        { property: "og:title", content: p ? `${p.name} — MAKERMAN` : "Makerman Garment" },
      ],
    };
  },
  component: ProductDetailPage,
});

export function ProductDetailPage() {
  const { product } = Route.useLoaderData();
  const { addToCart, toggleWishlist, isWishlisted, markViewed, storeInfo, setCartOpen } = useShop();
  const navigate = useNavigate();

  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? "");
  const [selectedSize, setSelectedSize] = useState(
    () => getFirstAvailableSize(product, product.colors[0]?.name ?? "") || "",
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>("materials");
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const displayImages = useMemo(() => {
    return getImagesForColor(product, selectedColor);
  }, [product, selectedColor]);

  /** Resolve the currently selected variant by size+color match. */
  const selectedVariant = useMemo(
    () =>
      product.variants?.find(
        (v) => v.sizeLabel === selectedSize && v.colorName === selectedColor,
      ) ?? null,
    [product, selectedSize, selectedColor],
  );

  // When selectedColor changes, reset active image index and ensure selected size is available
  useEffect(() => {
    setActiveImageIndex(0);
    if (!isSizeAvailable(product, selectedSize, selectedColor)) {
      const firstAvailable = getFirstAvailableSize(product, selectedColor);
      setSelectedSize(firstAvailable ?? "");
    }
  }, [product, selectedColor, selectedSize]);

  const currentSizeStock = getVariantStock(product, selectedSize, selectedColor);
  const isCurrentSizeAvailable = Boolean(selectedSize) && currentSizeStock > 0;
  const isProductOutOfStock =
    !product.inStock ||
    (product.sizes.length > 0 &&
      product.sizes.every((s) => !isSizeAvailable(product, s, selectedColor)));

  useEffect(() => {
    markViewed(product.slug);
    window.scrollTo(0, 0);
  }, [product.slug, markViewed]);

  const wished = isWishlisted(product.slug);
  const { data: apiReviews } = useProductReviews(product.id);
  const liveReviews = apiReviews?.content;
  const productReviews = (liveReviews ?? []).map((r) => ({
    id: r.id,
    productSlug: product.slug,
    name: r.customerName || "Customer",
    city: "Verified Buyer",
    rating: r.rating,
    title: r.title || "Refined craftsmanship",
    body: r.body || "",
    date: new Date(r.createdAt || Date.now()).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    verified: true,
  }));
  const relatedProducts = productService.related(product, 4);

  /** Adds the currently selected size+color variant to cart using variant UUID. */
  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size first");
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
    addToCart(product.id, selectedVariant?.id ?? "", quantity);
  };

  /** Adds the selected variant to cart and navigates directly to checkout. */
  const handleBuyNow = () => {
    const sizeToUse =
      selectedSize || getFirstAvailableSize(product, selectedColor) || "";
    if (!sizeToUse) {
      toast.error("Please select a size first");
      return;
    }
    const availableStock = getVariantStock(product, sizeToUse, selectedColor);
    if (availableStock <= 0) {
      return;
    }
    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} item(s) available in stock`);
      return;
    }
    if (!selectedSize) {
      setSelectedSize(sizeToUse);
    }
    const variantToUse =
      product.variants?.find(
        (v) => v.sizeLabel === sizeToUse && v.colorName === selectedColor,
      ) ?? selectedVariant;
    addToCart(product.id, variantToUse?.id ?? "", quantity);
    setCartOpen(false);
    navigate({ to: "/checkout" });
  };

  /** Shares the current product page via native share or clipboard fallback. */
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${product.name} — Makerman`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28 lg:pb-16">
      <div className="container-page py-4 sm:py-8">
        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs text-muted-foreground mb-6"
        >
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <Link to="/store" className="hover:text-foreground">
            Store
          </Link>
          <span>/</span>
          <Link
            to="/store"
            search={{ category: product.category }}
            className="hover:text-foreground"
          >
            {product.categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-foreground truncate font-medium">{product.name}</span>
        </nav>

        {/* Main PDP Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Image Gallery (Mobile swipe / Large cards) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image */}
            <div
              onClick={() => {
                setLightboxIndex(activeImageIndex);
                setIsLightboxOpen(true);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setLightboxIndex(activeImageIndex);
                  setIsLightboxOpen(true);
                }
              }}
              aria-label={`Open full screen view of ${product.name}`}
              className="group relative aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden bg-secondary rounded-sm cursor-zoom-in select-none"
            >
              <img
                src={displayImages[activeImageIndex] ?? displayImages[0]}
                alt={`${product.name} - View ${activeImageIndex + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                loading="eager"
              />

              {/* Hover Overlay Prompt */}
              <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="bg-background/95 backdrop-blur-xs text-foreground text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <Maximize2 className="h-3.5 w-3.5 text-amber-600" />
                  Click for Fullscreen View
                </span>
              </div>

              {product.badge && (
                <span className="absolute top-4 left-4 bg-ink text-ink-foreground px-3 py-1 text-[0.6875rem] uppercase tracking-widest font-semibold rounded-xs shadow-xs z-10 pointer-events-none">
                  {product.badge}
                </span>
              )}

              <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(activeImageIndex);
                    setIsLightboxOpen(true);
                  }}
                  aria-label="View full screen"
                  title="View full screen"
                  className="grid h-10 w-10 place-items-center bg-background/85 backdrop-blur-xs text-foreground/80 hover:text-foreground rounded-full transition-colors shadow-xs cursor-pointer"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  aria-label="Share garment"
                  className="grid h-10 w-10 place-items-center bg-background/85 backdrop-blur-xs text-foreground/80 hover:text-foreground rounded-full transition-colors shadow-xs cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-background/85 backdrop-blur-xs px-3 py-1 text-[0.6875rem] font-medium text-foreground rounded-xs pointer-events-none z-10">
                {activeImageIndex + 1} / {displayImages.length}
              </div>
            </div>

            {/* Thumbnail Strip (Generous touch targets) */}
            {displayImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {displayImages.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => {
                      if (activeImageIndex === idx) {
                        setLightboxIndex(idx);
                        setIsLightboxOpen(true);
                      } else {
                        setActiveImageIndex(idx);
                      }
                    }}
                    onDoubleClick={() => {
                      setLightboxIndex(idx);
                      setIsLightboxOpen(true);
                    }}
                    aria-label={`View image ${idx + 1}`}
                    title={
                      activeImageIndex === idx
                        ? "Click again to open full screen"
                        : `View image ${idx + 1}`
                    }
                    className={cn(
                      "group relative h-20 w-16 sm:h-24 sm:w-20 shrink-0 overflow-hidden bg-secondary border rounded-xs transition-all cursor-pointer",
                      activeImageIndex === idx
                        ? "border-foreground ring-2 ring-foreground"
                        : "border-border opacity-70 hover:opacity-100",
                    )}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                    {activeImageIndex === idx && (
                      <span className="absolute bottom-1 right-1 grid h-5 w-5 place-items-center bg-background/90 rounded-full shadow-xs text-foreground pointer-events-none">
                        <Maximize2 className="h-3 w-3" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Editorial Highlights Box */}
            <div className="hidden lg:grid grid-cols-3 gap-4 pt-6 border-t border-border/80">
              <div className="flex items-start gap-3">
                <Feather className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Natural Fibers
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{product.material}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Ruler className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Fit Profile
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {product.fit} fit block
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Reinforced
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Double-turned seams</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Information & Purchase Controls */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div>
              <p className="eyebrow text-amber-600 font-semibold tracking-widest">
                {product.categoryLabel}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl mt-1.5 font-normal tracking-tight text-foreground leading-tight">
                {product.name}
              </h1>

              {/* Price & Rating */}
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl sm:text-3xl font-medium text-foreground">
                    {formatINR(product.price)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatINR(product.compareAtPrice)}
                    </span>
                  )}
                </div>
                <span className="text-border">|</span>
                <a
                  href="#reviews"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < Math.round(product.rating)
                            ? "fill-amber-500 text-amber-500"
                            : "text-border",
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-foreground">({product.reviewCount})</span>
                </a>
              </div>

              <p className="mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {product.description || product.shortDescription}
              </p>
            </div>

            {/* Color Selector */}
            <div className="border-t border-border/80 pt-5">
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="font-semibold uppercase tracking-wider text-foreground">
                  Color
                </span>
                <span className="text-muted-foreground">{selectedColor}</span>
              </div>
              <div className="flex gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => {
                      setSelectedColor(c.name);
                      const firstAvailable = getFirstAvailableSize(product, c.name);
                      setSelectedSize(firstAvailable ?? "");
                    }}
                    aria-label={`Select color ${c.name}`}
                    className={cn(
                      "h-9 w-9 rounded-full border grid place-items-center transition-all p-0.5",
                      selectedColor === c.name
                        ? "ring-2 ring-foreground ring-offset-2 scale-105 border-transparent"
                        : "border-border hover:scale-105",
                    )}
                    style={{ backgroundColor: c.hex }}
                  >
                    {selectedColor === c.name && (
                      <Check
                        className={cn(
                          "h-4 w-4",
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

            {/* Size Selector with min 44px touch targets */}
            <div className="border-t border-border/80 pt-5">
              <div className="flex items-center justify-between text-xs mb-2.5">
                <span className="font-semibold uppercase tracking-wider text-foreground">
                  Select Size
                </span>
                {selectedSize && isCurrentSizeAvailable && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {currentSizeStock} in stock
                  </span>
                )}
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
                      title={
                        !available
                          ? `${s} — Out of stock`
                          : `${s} (${sizeStock} in stock)`
                      }
                      className={cn(
                        "h-11 border text-xs font-semibold uppercase tracking-wider rounded-sm transition-all flex items-center justify-center relative",
                        selectedSize === s && available
                          ? "border-foreground bg-foreground text-background shadow-xs"
                          : available
                            ? "border-border/90 bg-surface text-foreground/80 hover:border-foreground/50"
                            : "border-border/60 bg-muted/40 text-muted-foreground/40 opacity-40 cursor-not-allowed line-through hover:border-border/60",
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector & Stock Status */}
            <div className="flex items-center justify-between border-t border-border/80 pt-5">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    !isCurrentSizeAvailable || isProductOutOfStock
                      ? "bg-muted-foreground/40"
                      : "bg-emerald-600 animate-pulse",
                  )}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  {!isCurrentSizeAvailable || isProductOutOfStock
                    ? "Out of Stock"
                    : "In Stock · Ready for Pan-India Dispatch"}
                </span>
              </div>

              <div className="flex items-center border border-border rounded-sm bg-surface">
                <button
                  type="button"
                  disabled={!isCurrentSizeAvailable || isProductOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                  className="h-10 w-10 grid place-items-center hover:bg-secondary text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="h-10 w-10 grid place-items-center text-xs font-semibold text-foreground">
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
                  className="h-10 w-10 grid place-items-center hover:bg-secondary text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Desktop Action Buttons: ADD TO BAG, BUY NOW, FAVORITE */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3">
                <Button
                  type="button"
                  disabled={!isCurrentSizeAvailable || isProductOutOfStock}
                  onClick={handleAddToCart}
                  className={cn(
                    "flex-1 h-13 text-xs font-semibold uppercase tracking-[0.14em] rounded-sm transition-all",
                    !isCurrentSizeAvailable || isProductOutOfStock
                      ? "bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted opacity-60"
                      : "bg-ink text-ink-foreground hover:bg-ink/90",
                  )}
                >
                  {!selectedSize
                    ? "Select Size"
                    : !isCurrentSizeAvailable || isProductOutOfStock
                      ? "Out of Stock"
                      : `Add To Bag — ${formatINR(product.price * quantity)}`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => toggleWishlist(product.slug)}
                  className="h-13 w-13 p-0 grid place-items-center shrink-0 border-border rounded-sm hover:bg-secondary"
                  aria-label={wished ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5 transition-colors",
                      wished ? "fill-amber-500 text-amber-500" : "text-foreground/80",
                    )}
                    strokeWidth={1.4}
                  />
                </Button>
              </div>

              <Button
                type="button"
                variant="outline"
                disabled={!isCurrentSizeAvailable || isProductOutOfStock}
                onClick={handleBuyNow}
                className={cn(
                  "w-full h-12 text-xs font-semibold uppercase tracking-[0.14em] rounded-sm transition-all",
                  !isCurrentSizeAvailable || isProductOutOfStock
                    ? "border-border/60 text-muted-foreground/50 cursor-not-allowed bg-muted/20 hover:bg-muted/20 hover:text-muted-foreground/50 opacity-60"
                    : "border-foreground/60 hover:bg-foreground hover:text-background",
                )}
              >
                {!isCurrentSizeAvailable || isProductOutOfStock ? "Out of Stock" : "Buy Now"}
              </Button>
            </div>

            {/* Assurance Box */}
            <div className="p-4 bg-[#FAF8F5] border border-border/80 rounded-sm space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 text-amber-600 shrink-0" strokeWidth={1.5} />
                <span>Complimentary express delivery on all orders</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Package className="h-4 w-4 text-amber-600 shrink-0" strokeWidth={1.5} />
                <span>Shipped in 100% recyclable plastic-free paper packaging</span>
              </div>
            </div>

            {/* Accordions for Materials, Care, Fit, Shipping */}
            <div className="divide-y divide-border border-y border-border">
              {[
                {
                  id: "materials",
                  title: "Materials & Care Instructions",
                  content: (
                    <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                      <p>
                        <strong className="text-foreground">Fabric Composition:</strong>{" "}
                        {product.material}
                      </p>
                      <p>
                        <strong className="text-foreground">Care Guidelines:</strong>{" "}
                        {product.care.join(". ")}
                      </p>
                      <ul className="list-disc list-inside space-y-1 pt-1">
                        {product.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>
                  ),
                },
                {
                  id: "fit",
                  title: "Fit & Silhouette Details",
                  content: (
                    <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                      <p>
                        Designed with a <strong className="text-foreground">{product.fit}</strong>{" "}
                        profile. Cut to drape cleanly without pulling at high-movement stress
                        points.
                      </p>
                      <p>
                        We recommend taking your standard size for the intended silhouette, or
                        sizing down for a closer classic fit.
                      </p>
                    </div>
                  ),
                },
                {
                  id: "shipping",
                  title: "Shipping & Pan-India Delivery",
                  content: (
                    <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                      <p>
                        Orders dispatch within 24 hours from our Mumbai studio. Metro delivery takes
                        2–3 business days; all India takes 4–6 business days.
                      </p>
                      <p>
                        Enjoy complimentary free express delivery on all orders across India.
                      </p>
                    </div>
                  ),
                },
              ].map((section) => {
                const isOpen = openAccordion === section.id;
                return (
                  <div key={section.id} className="py-3.5">
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(isOpen ? null : section.id)}
                      className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-left text-foreground"
                    >
                      <span>{section.title}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform duration-200",
                          isOpen ? "rotate-180" : "",
                        )}
                      />
                    </button>
                    {isOpen && <div className="pt-3 pb-1">{section.content}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section id="reviews" className="mt-20 pt-12 border-t border-border">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
              <div>
                <p className="eyebrow text-amber-600 font-semibold tracking-widest">
                  Client Reflections
                </p>
                <h2 className="font-display text-2xl sm:text-3xl text-foreground mt-1 font-normal">
                  Verified Reviews
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                  <span className="font-display text-2xl font-medium text-foreground">
                    {product.rating}
                  </span>
                  <span className="text-xs text-muted-foreground">/ 5.0</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.reviewCount} customer reviews)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {productReviews.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No written reviews yet for this garment.
                </p>
              ) : (
                productReviews.map((r) => (
                  <div
                    key={r.id}
                    className="p-6 bg-[#FAF8F5] border border-border rounded-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-3.5 w-3.5",
                                i < r.rating ? "fill-amber-500 text-amber-500" : "text-border",
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-muted-foreground">{r.date}</span>
                      </div>
                      <h4 className="font-display text-sm font-medium text-foreground">
                        {r.title}
                      </h4>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{r.body}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-[11px]">
                      <span className="font-medium text-foreground">
                        {r.name} · {r.city}
                      </span>
                      {r.verified && (
                        <span className="text-amber-600 font-medium">✓ Verified Buyer</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-border">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="eyebrow text-amber-600 font-semibold tracking-widest">
                  Wardrobe Complements
                </p>
                <h2 className="font-display text-2xl sm:text-3xl text-foreground mt-1 font-normal">
                  Complete The Wardrobe
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Sticky Bottom CTA Bar (Ensures Add to Bag is always reachable) */}
      <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-border p-3 z-30 lg:hidden shadow-lift flex items-center gap-3">
        <div className="min-w-0">
          <p className="text-[0.6875rem] text-muted-foreground truncate uppercase tracking-wider">
            {selectedSize ? `Size ${selectedSize}` : "Select Size"} · {selectedColor}
          </p>
          <p className="font-display text-base font-semibold text-foreground">
            {formatINR(product.price)}
          </p>
        </div>

        <Button
          type="button"
          disabled={!isCurrentSizeAvailable || isProductOutOfStock}
          onClick={handleAddToCart}
          className={cn(
            "flex-1 h-12 text-xs font-semibold uppercase tracking-wider rounded-sm",
            !isCurrentSizeAvailable || isProductOutOfStock
              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
              : "bg-ink text-ink-foreground",
          )}
        >
          <ShoppingBag className="h-4 w-4 mr-1.5" />
          {!selectedSize
            ? "Select Size"
            : !isCurrentSizeAvailable || isProductOutOfStock
              ? "Out of Stock"
              : "Add to Bag"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => toggleWishlist(product.slug)}
          className="h-12 w-12 p-0 grid place-items-center shrink-0 border-border rounded-sm"
          aria-label={wished ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={cn("h-5 w-5", wished ? "fill-amber-500 text-amber-500" : "text-foreground")}
            strokeWidth={1.4}
          />
        </Button>
      </div>

      {/* Fullscreen Product Image Lightbox */}
      <ProductImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={displayImages}
        initialIndex={lightboxIndex}
        productName={product.name}
      />
    </div>
  );
}

function ProductNotFoundView() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-secondary/80 flex items-center justify-center mb-6">
        <Package className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <p className="eyebrow text-amber-600 font-semibold tracking-widest mb-2">
        Catalogue Notice
      </p>
      <h1 className="font-display text-3xl sm:text-4xl font-normal text-foreground mb-3">
        Garment Not Found
      </h1>
      <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
        The piece you are looking for is no longer available or the link may have been updated. Explore our full seasonal collection.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/shop"
          className="inline-flex items-center justify-center px-8 h-12 bg-ink text-ink-foreground text-xs font-semibold uppercase tracking-[0.14em] rounded-sm hover:bg-ink/90 transition-all"
        >
          Explore Collection
        </Link>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-8 h-12 border border-border bg-surface text-foreground text-xs font-semibold uppercase tracking-[0.14em] rounded-sm hover:bg-secondary transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
