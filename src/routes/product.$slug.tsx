import { createFileRoute, Link, notFound } from "@tanstack/react-router";
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
  RefreshCw,
  Ruler,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { productService, reviewService } from "@/services";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    const product = productService.bySlug(params.slug);
    if (!product) {
      throw notFound();
    }
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    return {
      meta: [
        { title: p ? `${p.name} — AVELOR` : "Product Details — AVELOR" },
        { name: "description", content: p?.shortDescription ?? "AVELOR piece details and fit." },
        { property: "og:title", content: p ? `${p.name} — AVELOR` : "AVELOR Piece" },
      ],
    };
  },
  component: ProductDetailPage,
});

export function ProductDetailPage() {
  const { product } = Route.useLoaderData();
  const { addToCart, toggleWishlist, isWishlisted, markViewed } = useShop();

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
  const productReviews = reviewService.forProduct(product.slug);
  const relatedProducts = productService.related(product, 4);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size before adding to bag.");
      return;
    }
    addToCart(product.slug, selectedSize, selectedColor, quantity);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard.");
    }
  };

  return (
    <div className="container-page py-6 md:py-12">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground mb-6 md:mb-10">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-foreground">Shop</Link>
        <span>/</span>
        <Link to="/shop" search={{ category: product.category } as never} className="hover:text-foreground">
          {product.categoryLabel}
        </Link>
        <span>/</span>
        <span className="text-foreground truncate">{product.name}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Gallery column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-4/5 w-full overflow-hidden bg-secondary">
            <img
              src={product.images[activeImageIndex] ?? product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-all duration-300"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 bg-ink text-ink-foreground px-3 py-1 text-xs uppercase tracking-widest font-medium">
                {product.badge}
              </span>
            )}
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share product"
              className="absolute top-4 right-4 grid h-10 w-10 place-items-center bg-background/80 backdrop-blur-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <div className="absolute bottom-4 right-4 bg-background/90 px-2.5 py-1 text-[11px] num text-muted-foreground">
              {activeImageIndex + 1} / {product.images.length}
            </div>
          </div>

          {/* Thumbnail Rail */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={cn(
                    "relative h-24 w-20 shrink-0 overflow-hidden bg-secondary border transition-all",
                    activeImageIndex === idx ? "border-ink ring-1 ring-ink" : "border-border opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Editorial Highlights Box */}
          <div className="hidden lg:grid grid-cols-3 gap-4 pt-6 border-t border-border">
            <div className="flex items-start gap-3">
              <Feather className="h-5 w-5 text-accent shrink-0 mt-0.5" strokeWidth={1.4} />
              <div>
                <p className="text-xs font-medium">Natural Fibers</p>
                <p className="text-[11px] text-muted-foreground">{product.material}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Ruler className="h-5 w-5 text-accent shrink-0 mt-0.5" strokeWidth={1.4} />
              <div>
                <p className="text-xs font-medium">Fit Profile</p>
                <p className="text-[11px] text-muted-foreground">{product.fit}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" strokeWidth={1.4} />
              <div>
                <p className="text-xs font-medium">Reinforced</p>
                <p className="text-[11px] text-muted-foreground">Built to endure regular washing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Panel (Sticky on Desktop) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <div>
            <p className="eyebrow text-subtle">{product.categoryLabel}</p>
            <h1 className="font-display text-3xl sm:text-4xl mt-1 leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <span className="num text-2xl font-medium text-foreground">{formatINR(product.price)}</span>
                {product.compareAtPrice && (
                  <span className="num text-base text-muted-foreground line-through">
                    {formatINR(product.compareAtPrice)}
                  </span>
                )}
              </div>
              <span className="text-border">|</span>
              <a href="#reviews" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5",
                        i < Math.round(product.rating) ? "fill-foreground text-foreground" : "text-border"
                      )}
                    />
                  ))}
                </div>
                <span className="num font-medium text-foreground">({product.reviewCount})</span>
              </a>
            </div>

            <p className="mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {product.description || product.shortDescription}
            </p>
          </div>

          {/* Color Selection */}
          <div className="border-t border-border pt-5">
            <div className="flex items-center justify-between text-xs mb-2.5">
              <span className="font-medium">Selected Color</span>
              <span className="text-muted-foreground">{selectedColor}</span>
            </div>
            <div className="flex gap-2.5">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.name)}
                  aria-label={c.name}
                  className={cn(
                    "h-8 w-8 rounded-full border grid place-items-center transition-all",
                    selectedColor === c.name ? "ring-2 ring-ink ring-offset-2 scale-105 border-transparent" : "border-border hover:scale-105"
                  )}
                  style={{ backgroundColor: c.hex }}
                >
                  {selectedColor === c.name && (
                    <Check
                      className={cn(
                        "h-4 w-4",
                        c.hex.toLowerCase() === "#ffffff" || c.hex.toLowerCase() === "#efe9df"
                          ? "text-black"
                          : "text-white"
                      )}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="border-t border-border pt-5">
            <div className="flex items-center justify-between text-xs mb-2.5">
              <span className="font-medium">Select Size</span>
              <button
                type="button"
                onClick={() => setShowSizeGuide(!showSizeGuide)}
                className="text-xs text-accent underline underline-offset-2 hover:text-foreground flex items-center gap-1"
              >
                <Ruler className="h-3 w-3" /> Size Guide
              </button>
            </div>
            <div className="grid grid-cols-6 gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={cn(
                    "h-11 border text-xs font-medium uppercase transition-colors",
                    selectedSize === s
                      ? "border-ink bg-ink text-ink-foreground"
                      : "border-border hover:border-foreground/50"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Quick Size Guide Drawer / snippet */}
            {showSizeGuide && (
              <div className="mt-3 p-4 bg-secondary/60 border border-border text-xs space-y-2">
                <div className="flex justify-between items-center font-medium">
                  <span>Garment Sizing Matrix (Inches)</span>
                  <button onClick={() => setShowSizeGuide(false)} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>
                <p className="text-[11px] text-muted-foreground">Model is 6'1" / 185cm wearing size Medium.</p>
                <div className="grid grid-cols-4 gap-1 text-[11px] pt-1">
                  <span className="font-medium">Size</span>
                  <span className="font-medium">Chest</span>
                  <span className="font-medium">Length</span>
                  <span className="font-medium">Shoulder</span>
                  <span>S</span><span>38"</span><span>27.5"</span><span>17.5"</span>
                  <span>M</span><span>40"</span><span>28.5"</span><span>18.5"</span>
                  <span>L</span><span>42"</span><span>29.5"</span><span>19.5"</span>
                  <span>XL</span><span>44"</span><span>30.5"</span><span>20.5"</span>
                </div>
              </div>
            )}
          </div>

          {/* Stock & Quantity */}
          <div className="flex items-center justify-between border-t border-border pt-5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">In Stock — Dispatches next business day</span>
            </div>

            <div className="flex items-center border border-border">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                className="h-9 w-9 grid place-items-center hover:bg-secondary"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="num h-9 w-9 grid place-items-center text-xs font-medium">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="h-9 w-9 grid place-items-center hover:bg-secondary"
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                className="flex-1 h-13 text-xs uppercase tracking-[0.14em] font-medium"
              >
                Add To Bag — {formatINR(product.price * quantity)}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => toggleWishlist(product.slug)}
                className="h-13 w-13 p-0 grid place-items-center shrink-0"
                aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart className={cn("h-5 w-5", wished ? "fill-foreground text-foreground" : "")} strokeWidth={1.3} />
              </Button>
            </div>
          </div>

          {/* Delivery & Assurance Perks */}
          <div className="p-4 bg-secondary/40 border border-border space-y-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <Truck className="h-4 w-4 text-foreground shrink-0" strokeWidth={1.4} />
              <span>Complimentary express delivery on orders over ₹1,999</span>
            </div>
            <div className="flex items-center gap-2.5">
              <RefreshCw className="h-4 w-4 text-foreground shrink-0" strokeWidth={1.4} />
              <span>14-day return window with doorstep courier pickup</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Package className="h-4 w-4 text-foreground shrink-0" strokeWidth={1.4} />
              <span>Shipped in plastic-free recycled paper packaging</span>
            </div>
          </div>

          {/* Expandable Accordions */}
          <div className="divide-y divide-border border-y border-border">
            {[
              {
                id: "materials",
                title: "Materials & Composition",
                content: (
                  <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                    <p><strong className="text-foreground">Fabric:</strong> {product.material}</p>
                    <p><strong className="text-foreground">Care:</strong> {product.care.join(". ")}</p>
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
                title: "Fit & Silhouettes",
                content: (
                  <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                    <p>Designed with a <strong className="text-foreground">{product.fit}</strong> profile. Intended to drape cleanly without pulling at high-movement stress points.</p>
                    <p>We recommend taking your standard size for the intended silhouette, or sizing down for a closer classic fit.</p>
                  </div>
                ),
              },
              {
                id: "shipping",
                title: "Shipping & Free Returns",
                content: (
                  <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
                    <p>Orders placed before 2 PM IST dispatch on the same working day from our Mumbai studio. Metro delivery takes 2–3 business days.</p>
                    <p>Returns and size exchanges are completely free within 14 days of delivery.</p>
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
                    className="flex w-full items-center justify-between text-xs font-medium uppercase tracking-wider text-left"
                  >
                    <span>{section.title}</span>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen ? "rotate-180" : "")} />
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
              <p className="eyebrow text-subtle">Client Reflections</p>
              <h2 className="font-display text-2xl sm:text-3xl mt-1">Verified Reviews</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Star className="h-5 w-5 fill-foreground text-foreground" />
                <span className="num font-display text-2xl">{product.rating}</span>
                <span className="text-xs text-muted-foreground">/ 5.0</span>
              </div>
              <span className="text-xs text-muted-foreground">({product.reviewCount} customer ratings)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {productReviews.length === 0 ? (
              <p className="text-xs text-muted-foreground">No written reviews yet for this piece.</p>
            ) : (
              productReviews.map((r) => (
                <div key={r.id} className="p-6 bg-secondary/30 border border-border flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={cn(
                              "h-3.5 w-3.5",
                              i < r.rating ? "fill-foreground text-foreground" : "text-border"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] text-muted-foreground">{r.date}</span>
                    </div>
                    <h4 className="font-display text-sm font-medium">{r.title}</h4>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{r.body}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-foreground">{r.name} · {r.city}</span>
                    {r.verified && <span className="text-accent flex items-center gap-1">✓ Verified Owner</span>}
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
              <p className="eyebrow text-subtle">Recommended Complements</p>
              <h2 className="font-display text-2xl sm:text-3xl mt-1">Complete The Look</h2>
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
  );
}
