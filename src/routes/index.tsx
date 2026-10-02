import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Compass,
  Feather,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ProductCard, ProductCardSkeleton } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { productService } from "@/services";
import { useProducts } from "@/hooks/use-api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MAKERMAN — Feeling Happiness | Premium Clothing" },
      {
        name: "description",
        content:
          "Makerman crafts refined modern essentials, tailored silhouettes, and premium fabrics. Designed for genuine comfort and everyday distinction. Feeling Happiness.",
      },
      { property: "og:title", content: "MAKERMAN — Feeling Happiness" },
    ],
  }),
  component: HomePage,
});

export function HomePage() {
  const { addToCart, setQuickView } = useShop();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const { data: arrivalsData, isLoading: arrivalsLoading } = useProducts({ sort: "newest", size: 6 });
  const newArrivals = arrivalsData?.content ?? [];

  // Look pieces for "Shop The Look"
  const lookHotspots = [
    {
      id: "h1",
      slug: "warden-twill-overshirt",
      title: "Warden Twill Overshirt",
      price: 3890,
      x: "54%",
      y: "35%",
    },
    {
      id: "h2",
      slug: "atlas-heavyweight-tee",
      title: "Atlas Heavyweight Tee",
      price: 1799,
      x: "48%",
      y: "48%",
    },
    {
      id: "h3",
      slug: "column-selvedge-jean",
      title: "Column Selvedge Jean",
      price: 4990,
      x: "52%",
      y: "75%",
    },
  ];

  const handleShopCompleteLook = () => {
    let addedCount = 0;
    lookHotspots.forEach((item) => {
      const p = productService.bySlug(item.slug);
      if (p) {
        addToCart(p.slug, p.sizes[0] ?? "M", p.colors[0]?.name ?? "Natural", 1);
        addedCount++;
      }
    });
    if (addedCount > 0) {
      toast.success("Complete look added to your bag", {
        description: `${addedCount} garments added to your shopping bag.`,
      });
    } else if (newArrivals.length > 0) {
      const first = newArrivals[0];
      addToCart(first.slug, first.sizes[0] ?? "M", first.colors[0]?.name ?? "Natural", 1);
      toast.success("Garment added to your bag", {
        description: `${first.name} added to your shopping bag.`,
      });
    } else {
      toast.info("Please browse the store to add items to your bag.");
    }
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(newsletterEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Welcome to Makerman World", {
      description: "You are now registered for private drops and new arrivals.",
    });
    setNewsletterEmail("");
  };

  return (
    <div className="flex flex-col bg-background selection:bg-ink selection:text-white">
      {/* ==========================================================
          SECTION 1 — CINEMATIC EDITORIAL HERO
          ========================================================== */}
      <section className="relative min-h-[90vh] sm:min-h-[94vh] flex items-end justify-start overflow-hidden bg-[#161616]">
        {/* Hero Background Image with subtle scale */}
        <img
          src="/images/hero.jpg"
          alt="Makerman Autumn / Winter Campaign"
          className="absolute inset-0 h-full w-full object-cover object-[center_28%] brightness-[0.84] contrast-[1.05] transition-transform duration-1000 ease-out hover:scale-105"
          loading="eager"
          decoding="async"
        />
        {/* Refined gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />

        <div className="container-page relative z-10 pb-14 pt-32 sm:pb-24 text-white">
          <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Small golden bird highlight dot */}
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2 w-2 rounded-full bg-amber-500 inline-block animate-pulse" />
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.24em] text-white/90">
                MAKERMAN ATELIER
              </p>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.08] tracking-tight text-white drop-shadow-xs">
              Feeling Happiness.
            </h1>

            <p className="mt-4 text-xs sm:text-base text-white/85 max-w-lg font-light leading-relaxed">
              Refined clothing crafted with durable Indian fabrics, architectural cuts, and timeless proportions. Made to feel as good as it looks.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Button
                asChild
                className="h-12 sm:h-13 px-8 text-xs font-semibold uppercase tracking-[0.16em] bg-white text-[#171717] hover:bg-white/90 rounded-sm shadow-md"
              >
                <Link to="/store" search={{ gender: "men" }}>
                  Shop Men
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 sm:h-13 px-8 text-xs font-semibold uppercase tracking-[0.16em] text-white border-white/50 hover:bg-white/15 hover:border-white rounded-sm"
              >
                <Link to="/store" search={{ gender: "women" }}>
                  Shop Women
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          SECTION 2 — BRAND STATEMENT
          ========================================================== */}
      <section className="border-b border-border/80 bg-[#FAF8F5] py-16 sm:py-24 text-center">
        <div className="container-page max-w-3xl mx-auto">
          {/* Subtle logo accent line */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="h-[1px] w-8 bg-amber-500/80" />
            <span className="text-[0.625rem] uppercase tracking-[0.24em] font-semibold text-muted-foreground">
              OUR PHILOSOPHY
            </span>
            <span className="h-[1px] w-8 bg-amber-500/80" />
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-normal text-foreground leading-[1.2] tracking-tight">
            “Clothing that feels as good as it looks.”
          </h2>

          <p className="mt-6 text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed font-light max-w-xl mx-auto">
            At Makerman, we reject fleeting trends. We focus on heavy long-staple cottons, balanced drapes, and precise tailoring so every garment brings lasting ease, confidence, and genuine everyday happiness.
          </p>
        </div>
      </section>

      {/* ==========================================================
          SECTION 3 — NEW ARRIVALS
          ========================================================== */}
      <section className="section-y bg-background">
        <div className="container-page">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-12 gap-4 border-b border-border/60 pb-5">
            <div>
              <p className="eyebrow text-amber-600 font-semibold tracking-widest">
                Fresh From Studio
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-4xl text-foreground font-normal">
                New Arrivals
              </h2>
            </div>
            <div>
              <Link
                to="/store"
                search={{ collection: "new-arrivals" }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground hover:text-amber-600 transition-colors"
              >
                <span>Explore All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Product Grid: 2 columns on mobile, 4 columns on desktop */}
          {arrivalsLoading ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : newArrivals.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
              {newArrivals.map((product, idx) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  priority={idx < 4}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground text-xs sm:text-sm">
              Explore our full collection in the store.
            </div>
          )}

          {/* Mobile view all CTA button */}
          <div className="mt-8 text-center sm:hidden">
            <Button
              asChild
              variant="outline"
              className="w-full h-12 text-xs font-semibold uppercase tracking-wider border-border"
            >
              <Link to="/store" search={{ collection: "new-arrivals" }}>
                View All New Arrivals ({newArrivals.length})
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ==========================================================
          SECTION 4 — CATEGORY EDIT (MEN & WOMEN)
          ========================================================== */}
      <section className="bg-[#FAF8F5] border-y border-border/80 py-14 sm:py-20">
        <div className="container-page">
          <div className="text-center max-w-xl mx-auto mb-10">
            <p className="eyebrow text-amber-600 font-semibold tracking-widest">
              Curated Wardrobes
            </p>
            <h2 className="mt-1 font-display text-2xl sm:text-4xl text-foreground font-normal">
              Category Edit
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Distinct cuts and tailored blocks built for everyday wear.
            </p>
          </div>

          {/* 2-Column Desktop, Stacked Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Men's Category */}
            <div className="group relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-secondary rounded-sm">
              <img
                src="/images/p-shirt-1.jpg"
                alt="Makerman Men's Wardrobe"
                className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 text-white">
                <p className="text-[0.6875rem] uppercase tracking-widest text-white/80 font-medium mb-1">
                  Tailored & Relaxed
                </p>
                <h3 className="font-display text-2xl sm:text-4xl text-white font-normal mb-4">
                  Men's Collection
                </h3>
                <Button
                  asChild
                  className="h-11 px-6 text-xs font-semibold uppercase tracking-[0.14em] bg-white text-ink hover:bg-white/90 rounded-sm shadow-sm"
                >
                  <Link to="/store" search={{ gender: "men" }}>
                    Shop Men
                  </Link>
                </Button>
              </div>
            </div>

            {/* Women's Category */}
            <div className="group relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-secondary rounded-sm">
              <img
                src="/images/p-dress-1.jpg"
                alt="Makerman Women's Wardrobe"
                className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 text-white">
                <p className="text-[0.6875rem] uppercase tracking-widest text-white/80 font-medium mb-1">
                  Fluid & Considered
                </p>
                <h3 className="font-display text-2xl sm:text-4xl text-white font-normal mb-4">
                  Women's Collection
                </h3>
                <Button
                  asChild
                  className="h-11 px-6 text-xs font-semibold uppercase tracking-[0.14em] bg-white text-ink hover:bg-white/90 rounded-sm shadow-sm"
                >
                  <Link to="/store" search={{ gender: "women" }}>
                    Shop Women
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          SECTION 5 — CAMPAIGN / STORY (THE MAKERMAN WAY)
          ========================================================== */}
      <section className="section-y bg-background">
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Story Images Composition */}
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-sm bg-secondary">
                <img
                  src="/images/campaign.jpg"
                  alt="The Makerman Way campaign"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="hidden sm:block absolute -bottom-6 -right-6 w-1/2 aspect-square overflow-hidden rounded-sm border-4 border-background shadow-lift">
                <img
                  src="/images/detail-fabric.jpg"
                  alt="Makerman fabric weave detail"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Story Text */}
            <div className="space-y-6 max-w-lg">
              <div className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <p className="eyebrow text-amber-600 font-semibold tracking-widest">
                  Atelier Craftsmanship
                </p>
              </div>

              <h2 className="font-display text-3xl sm:text-5xl font-normal leading-tight text-foreground">
                The Makerman Way
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                We believe true elegance lies in garments that feel effortless to live in. Every piece begins with premium long-staple Indian cottons, dry wools, and dense twills. We test each weave through multiple washes before it ever touches a pattern block.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/90">
                    <strong>240–320 GSM Weights:</strong> Structured lines that hold their drape after daily wear.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/90">
                    <strong>Double-Turned French Seams:</strong> Clean finishes inside and out with zero rough edges.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-foreground/90">
                    <strong>Designed in Mumbai:</strong> Rooted in modern Indian lifestyle and climate demands.
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button asChild className="h-12 px-7 text-xs font-semibold uppercase tracking-[0.14em] bg-ink text-ink-foreground hover:bg-ink/90">
                  <Link to="/store">Explore The Store</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          SECTION 6 — SHOP THE LOOK
          ========================================================== */}
      <section className="bg-[#FAF8F5] border-y border-border/80 py-14 sm:py-20">
        <div className="container-page">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
            <div>
              <p className="eyebrow text-amber-600 font-semibold tracking-widest">
                Cohesive Styling
              </p>
              <h2 className="mt-1 font-display text-2xl sm:text-4xl text-foreground font-normal">
                Shop The Look
              </h2>
            </div>
            <Button
              type="button"
              onClick={handleShopCompleteLook}
              className="h-11 px-6 text-xs font-semibold uppercase tracking-wider bg-ink text-ink-foreground hover:bg-ink/90"
            >
              <ShoppingBag className="h-3.5 w-3.5 mr-1.5" />
              Add Complete Look to Bag
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Look Image with Hotspots on Desktop */}
            <div className="lg:col-span-7 relative aspect-[3/4] sm:aspect-[4/5] overflow-hidden rounded-sm bg-secondary">
              <img
                src="/images/look-1.jpg"
                alt="Makerman styled look"
                className="h-full w-full object-cover object-center"
                loading="lazy"
              />

              {/* Desktop Interactive Hotspots */}
              <div className="hidden sm:block">
                {lookHotspots.map((spot) => (
                  <div
                    key={spot.id}
                    className="absolute"
                    style={{ left: spot.x, top: spot.y }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                      className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink shadow-md transition-transform hover:scale-110 active:scale-95"
                      aria-label={`View ${spot.title}`}
                    >
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="absolute -inset-1 rounded-full border border-white/60 animate-ping" />
                    </button>

                    {/* Popover Card */}
                    {activeHotspot === spot.id && (
                      <div className="absolute left-10 top-0 z-20 w-48 rounded-sm bg-background p-3 shadow-lift border border-border animate-in fade-in-50 zoom-in-95">
                        <p className="text-xs font-semibold text-foreground line-clamp-1">{spot.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatINR(spot.price)}</p>
                        <button
                          type="button"
                          onClick={() => setQuickView(spot.slug)}
                          className="mt-2 text-[0.6875rem] uppercase tracking-wider font-semibold text-amber-600 hover:underline"
                        >
                          Quick Add →
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Items in the Look */}
            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Garments in this look:
              </p>
              
              <div className="divide-y divide-border/60 border border-border/80 rounded-sm bg-background">
                {lookHotspots.map((item) => {
                  const product = productService.bySlug(item.slug);
                  if (!product) return null;

                  return (
                    <div key={item.id} className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-16 w-12 object-cover rounded-xs bg-secondary shrink-0"
                          loading="lazy"
                        />
                        <div className="truncate">
                          <Link
                            to="/product/$slug"
                            params={{ slug: product.slug }}
                            className="text-xs font-semibold text-foreground hover:underline truncate block"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatINR(product.price)}
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => addToCart(product.slug, product.sizes[0] ?? "M", product.colors[0]?.name ?? "Natural", 1)}
                        className="h-9 px-3 text-[0.6875rem] font-semibold uppercase tracking-wider shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          SECTION 7 — TRUST / SERVICE STRIP
          ========================================================== */}
      <section className="border-b border-border bg-background py-10 sm:py-14">
        <div className="container-page">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8">
            <div className="flex flex-col items-start text-left">
              <Feather className="h-5 w-5 text-amber-600 mb-2" strokeWidth={1.5} />
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Premium Fabrics
              </p>
              <p className="text-[0.75rem] text-muted-foreground mt-1 leading-relaxed">
                Long-staple Indian cottons and durable twills.
              </p>
            </div>

            <div className="flex flex-col items-start text-left">
              <Truck className="h-5 w-5 text-amber-600 mb-2" strokeWidth={1.5} />
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Pan-India Delivery
              </p>
              <p className="text-[0.75rem] text-muted-foreground mt-1 leading-relaxed">
                Complimentary shipping on orders above ₹1,999.
              </p>
            </div>

            <div className="flex flex-col items-start text-left">
              <RotateCcw className="h-5 w-5 text-amber-600 mb-2" strokeWidth={1.5} />
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                15-Day Easy Returns
              </p>
              <p className="text-[0.75rem] text-muted-foreground mt-1 leading-relaxed">
                Doorstep pickup and free size exchange.
              </p>
            </div>

            <div className="flex flex-col items-start text-left">
              <ShieldCheck className="h-5 w-5 text-amber-600 mb-2" strokeWidth={1.5} />
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Secure Payments
              </p>
              <p className="text-[0.75rem] text-muted-foreground mt-1 leading-relaxed">
                UPI, Cards, Net Banking & Cash on Delivery.
              </p>
            </div>

            <div className="flex flex-col items-start text-left col-span-2 lg:col-span-1">
              <Clock className="h-5 w-5 text-amber-600 mb-2" strokeWidth={1.5} />
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Client Concierge
              </p>
              <p className="text-[0.75rem] text-muted-foreground mt-1 leading-relaxed">
                Direct studio support via WhatsApp & phone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================
          SECTION 8 — NEWSLETTER
          ========================================================== */}
      <section className="bg-[#FAF8F5] py-16 sm:py-20 text-center">
        <div className="container-page max-w-xl mx-auto">
          <p className="eyebrow text-amber-600 font-semibold tracking-widest mb-2">
            The Makerman Register
          </p>
          <h2 className="font-display text-2xl sm:text-4xl text-foreground font-normal">
            Join The Makerman World
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
            Be the first to know about new arrivals, private studio drops, and special releases.
          </p>

          <form onSubmit={handleNewsletter} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address"
              className="h-12 flex-1 px-4 text-xs bg-background border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-ring"
              required
            />
            <Button
              type="submit"
              className="h-12 px-7 text-xs font-semibold uppercase tracking-wider bg-ink text-ink-foreground hover:bg-ink/90 rounded-sm"
            >
              Subscribe
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
