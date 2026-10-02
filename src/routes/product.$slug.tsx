import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Feather,
  Heart,
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
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { sizeGuide } from "@/data/content";
import { formatINR } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { productService, reviewService } from "@/services";
import { adaptProduct, registerProducts } from "@/lib/adapters";
import { useProductReviews } from "@/hooks/use-api";
import type { ApiPagedProducts } from "@/types/api";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    let product = productService.bySlug(params.slug);
    if (!product) {
      try {
        const baseUrl =
          (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8080/api";
        const businessId =
          (import.meta.env.VITE_BUSINESS_ID as string) ||
          "7febea53-02ed-4996-ae3a-1fc69d74292e";
        const res = await fetch(`${baseUrl}/products?page=0&size=100&status=ACTIVE`, {
          headers: { "X-Business-Id": businessId },
        });
        if (res.ok) {
          const json = (await res.json()) as ApiPagedProducts;
          const adapted = (json.content ?? []).map(adaptProduct);
          registerProducts(adapted);
          product = adapted.find((p) => p.slug === params.slug || p.id === params.slug);
        }
      } catch {
        /* fallback to null */
      }
    }

    if (!product) {
      throw notFound();
    }
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    return {
      meta: [
        { title: p ? `${p.name} — MAKERMAN | Feeling Happiness` : "Product Details — MAKERMAN" },
        { name: "description", content: p?.shortDescription ?? "Makerman garment details, materials and fit." },
        { property: "og:title", content: p ? `${p.name} — MAKERMAN` : "Makerman Garment" },
      ],
    };
  },
  component: ProductDetailPage,
});

export function ProductDetailPage() {
  const { product } = Route.useLoaderData();
  const { addToCart, toggleWishlist, isWishlisted, markViewed } = useShop();
  const navigate = useNavigate();

  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name ?? "");
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [openAccordion, setOpenAccordion] = useState<string | null>("materials");
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    markViewed(product.slug);
    window.scrollTo(0, 0);
  }, [product.slug, markViewed]);

  const wished = isWishlisted(product.slug);
  const { data: apiReviews } = useProductReviews(product.id);
  const liveReviews = apiReviews?.content;
  const productReviews =
    liveReviews && liveReviews.length > 0
      ? liveReviews.map((r) => ({
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
        }))
      : reviewService.forProduct(product.slug);
  const relatedProducts = productService.related(product, 4);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size first");
      return;
    }
    addToCart(product.slug, selectedSize, selectedColor, quantity);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error("Please select a size first");
      return;
    }
    addToCart(product.slug, selectedSize, selectedColor, quantity);
    navigate({ to: "/checkout" });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${product.name} — Makerman`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28 lg:pb-16">
      <div className="container-page py-4 sm:py-8">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/store" className="hover:text-foreground">Store</Link>
          <span>/</span>
          <Link to="/store" search={{ category: product.category }} className="hover:text-foreground">
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
            <div className="relative aspect-[3/4] sm:aspect-[4/5] w-full overflow-hidden bg-secondary rounded-sm">
              <img
                src={product.images[activeImageIndex] ?? product.images[0]}
                alt={`${product.name} - View ${activeImageIndex + 1}`}
                className="h-full w-full object-cover transition-opacity duration-300"
                loading="eager"
              />

              {product.badge && (
                <span className="absolute top-4 left-4 bg-ink text-ink-foreground px-3 py-1 text-[0.6875rem] uppercase tracking-widest font-semibold rounded-xs shadow-xs">
                  {product.badge}
                </span>
              )}

              <button
                type="button"
                onClick={handleShare}
                aria-label="Share garment"
                className="absolute top-4 right-4 grid h-11 w-11 place-items-center bg-background/80 backdrop-blur-xs text-foreground/80 hover:text-foreground rounded-full transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-background/85 backdrop-blur-xs px-3 py-1 text-[0.6875rem] font-medium text-foreground rounded-xs">
                {activeImageIndex + 1} / {product.images.length}
              </div>
            </div>

            {/* Thumbnail Strip (Generous touch targets) */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                    className={cn(
                      "relative h-20 w-16 sm:h-24 sm:w-20 shrink-0 overflow-hidden bg-secondary border rounded-xs transition-all",
                      activeImageIndex === idx
                        ? "border-foreground ring-2 ring-foreground"
                        : "border-border opacity-70 hover:opacity-100",
                    )}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Editorial Highlights Box */}
            <div className="hidden lg:grid grid-cols-3 gap-4 pt-6 border-t border-border/80">
              <div className="flex items-start gap-3">
                <Feather className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Natural Fibers</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{product.material}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Ruler className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Fit Profile</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{product.fit} fit block</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">Reinforced</p>
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
                          i < Math.round(product.rating) ? "fill-amber-500 text-amber-500" : "text-border",
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
                <span className="font-semibold uppercase tracking-wider text-foreground">Color</span>
                <span className="text-muted-foreground">{selectedColor}</span>
              </div>
              <div className="flex gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
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
                <span className="font-semibold uppercase tracking-wider text-foreground">Select Size</span>
                <button
                  type="button"
                  onClick={() => setShowSizeGuide(true)}
                  className="text-xs text-amber-600 underline underline-offset-2 hover:text-amber-700 flex items-center gap-1 font-medium"
                >
                  <Ruler className="h-3.5 w-3.5" /> Size Guide
                </button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSize(s)}
                    className={cn(
                      "h-11 border text-xs font-semibold uppercase tracking-wider rounded-sm transition-all flex items-center justify-center",
                      selectedSize === s
                        ? "border-foreground bg-foreground text-background shadow-xs"
                        : "border-border/90 bg-surface text-foreground/80 hover:border-foreground/50",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector & Stock Status */}
            <div className="flex items-center justify-between border-t border-border/80 pt-5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-xs text-muted-foreground font-medium">
                  In Stock · Ready for Pan-India Dispatch
                </span>
              </div>

              <div className="flex items-center border border-border rounded-sm bg-surface">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                  className="h-10 w-10 grid place-items-center hover:bg-secondary text-foreground transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="h-10 w-10 grid place-items-center text-xs font-semibold text-foreground">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="h-10 w-10 grid place-items-center hover:bg-secondary text-foreground transition-colors"
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
                  onClick={handleAddToCart}
                  className="flex-1 h-13 text-xs font-semibold uppercase tracking-[0.14em] bg-ink text-ink-foreground hover:bg-ink/90 rounded-sm"
                >
                  Add To Bag — {formatINR(product.price * quantity)}
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
                onClick={handleBuyNow}
                className="w-full h-12 text-xs font-semibold uppercase tracking-[0.14em] border-foreground/60 hover:bg-foreground hover:text-background rounded-sm transition-all"
              >
                Buy Now with Express Checkout
              </Button>
            </div>

            {/* Assurance Box */}
            <div className="p-4 bg-[#FAF8F5] border border-border/80 rounded-sm space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <Truck className="h-4 w-4 text-amber-600 shrink-0" strokeWidth={1.5} />
                <span>Complimentary express delivery on orders over ₹1,999</span>
              </div>
              <div className="flex items-center gap-2.5">
                <RotateCcw className="h-4 w-4 text-amber-600 shrink-0" strokeWidth={1.5} />
                <span>15-day return window with complimentary doorstep pickup</span>
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
                      <p><strong className="text-foreground">Fabric Composition:</strong> {product.material}</p>
                      <p><strong className="text-foreground">Care Guidelines:</strong> {product.care.join(". ")}</p>
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
                        Designed with a <strong className="text-foreground">{product.fit}</strong> profile. Cut to drape cleanly without pulling at high-movement stress points.
                      </p>
                      <p>
                        We recommend taking your standard size for the intended silhouette, or sizing down for a closer classic fit.
                      </p>
                    </div>
                  ),
                },
                {
                  id: "shipping",
                  title: "Shipping & Free Exchanges",
                  content: (
                    <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                      <p>Orders dispatch within 24 hours from our Mumbai studio. Metro delivery takes 2–3 business days; all India takes 4–6 business days.</p>
                      <p>First size exchange is completely complimentary with doorstep courier pickup.</p>
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
                  <span className="font-display text-2xl font-medium text-foreground">{product.rating}</span>
                  <span className="text-xs text-muted-foreground">/ 5.0</span>
                </div>
                <span className="text-xs text-muted-foreground">({product.reviewCount} customer reviews)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {productReviews.length === 0 ? (
                <p className="text-xs text-muted-foreground">No written reviews yet for this garment.</p>
              ) : (
                productReviews.map((r) => (
                  <div key={r.id} className="p-6 bg-[#FAF8F5] border border-border rounded-sm flex flex-col justify-between">
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
                      <h4 className="font-display text-sm font-medium text-foreground">{r.title}</h4>
                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{r.body}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-[11px]">
                      <span className="font-medium text-foreground">{r.name} · {r.city}</span>
                      {r.verified && <span className="text-amber-600 font-medium">✓ Verified Buyer</span>}
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
          onClick={handleAddToCart}
          className="flex-1 h-12 text-xs font-semibold uppercase tracking-wider bg-ink text-ink-foreground rounded-sm"
        >
          <ShoppingBag className="h-4 w-4 mr-1.5" />
          Add to Bag
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => toggleWishlist(product.slug)}
          className="h-12 w-12 p-0 grid place-items-center shrink-0 border-border rounded-sm"
          aria-label={wished ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={cn(
              "h-5 w-5",
              wished ? "fill-amber-500 text-amber-500" : "text-foreground",
            )}
            strokeWidth={1.4}
          />
        </Button>
      </div>

      {/* Interactive Size Guide Dialog */}
      <Dialog open={showSizeGuide} onOpenChange={setShowSizeGuide}>
        <DialogContent className="max-w-xl p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-normal">
              Makerman Size & Measurement Guide
            </DialogTitle>
            <DialogDescription>
              Accurate measurements in centimeters to ensure your perfect fit.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground mb-2">
                Men's Tops & Overshirts (cm)
              </p>
              <div className="overflow-x-auto border border-border rounded-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF8F5] border-b border-border text-foreground font-semibold">
                    <tr>
                      {sizeGuide.Men.Tops.columns.map((col, i) => (
                        <th key={i} className="p-2.5">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {sizeGuide.Men.Tops.rows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-[#FAF8F5]/50"}>
                        {row.map((cell, j) => (
                          <td key={j} className="p-2.5 text-muted-foreground">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground mb-2">
                Men's Trousers & Denim (Inches / cm)
              </p>
              <div className="overflow-x-auto border border-border rounded-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF8F5] border-b border-border text-foreground font-semibold">
                    <tr>
                      {sizeGuide.Men.Bottoms.columns.map((col, i) => (
                        <th key={i} className="p-2.5">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {sizeGuide.Men.Bottoms.rows.map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-background" : "bg-[#FAF8F5]/50"}>
                        {row.map((cell, j) => (
                          <td key={j} className="p-2.5 text-muted-foreground">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-3 bg-[#FAF8F5] border border-border rounded-sm text-xs text-muted-foreground">
              <p><strong>Concierge Fitting Advice:</strong> If you are between sizes, we recommend sizing down for tailoring or sizing up for a relaxed streetwear silhouette. Need advice? WhatsApp us at +91 98204 41120.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
