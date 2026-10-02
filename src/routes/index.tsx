import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Feather,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { reviews } from "@/data/content";
import { formatINR } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { collectionService, productService } from "@/services";

export const Route = createFileRoute("/")({
  component: HomePage,
});

export function HomePage() {
  const { addToCart, setQuickView } = useShop();
  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const newArrivals = productService.newArrivals(8);
  const bestSellers = productService.bestSellers(8);
  const featuredCollection = collectionService.bySlug("studio-tailoring") ?? collectionService.all()[0]!;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubscribed(true);
    toast.success("Thank you for joining the AVELOR register.");
  };

  // Hotspot definitions for Shop The Look
  const lookHotspots = [
    {
      id: "h1",
      slug: "atelier-cotton-overshirt",
      title: "Atelier Cotton Overshirt",
      price: 4290,
      x: "52%",
      y: "32%",
    },
    {
      id: "h2",
      slug: "atlas-heavyweight-tee",
      title: "Atlas Heavyweight Tee",
      price: 1890,
      x: "46%",
      y: "48%",
    },
    {
      id: "h3",
      slug: "straight-column-denim",
      title: "Straight Column Denim",
      price: 4990,
      x: "50%",
      y: "74%",
    },
  ];

  const handleShopCompleteLook = () => {
    lookHotspots.forEach((item) => {
      const p = productService.bySlug(item.slug);
      if (p) {
        addToCart(p.slug, p.sizes[0] ?? "M", p.colors[0]?.name ?? "Natural", 1);
      }
    });
    toast.success("Complete outfit added to your shopping bag.");
  };

  return (
    <div className="flex flex-col">
      {/* 1. CINEMATIC EDITORIAL HERO */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-end justify-start bg-secondary overflow-hidden">
        <img
          src="/images/hero.jpg"
          alt="AVELOR New Season Collection"
          className="absolute inset-0 h-full w-full object-cover object-center brightness-[0.88] contrast-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

        <div className="container-page relative z-10 pb-12 pt-32 sm:pb-20 text-white">
          <div className="max-w-2xl">
            <span className="eyebrow tracking-[0.25em] text-white/80 uppercase mb-3 inline-block">
              Autumn / Winter 2026
            </span>
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.05] tracking-tight text-white">
              Designed for the everyday.
            </h1>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-white/85 max-w-xl font-light leading-relaxed">
              Modern essentials, refined through considered materials, architectural cuts, and timeless silhouettes.
            </p>

            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Button
                asChild
                className="h-12 sm:h-13 px-8 text-xs uppercase tracking-[0.14em] font-medium bg-white text-ink hover:bg-white/90"
              >
                <Link to="/collections/$slug" params={{ slug: "new-arrivals" }}>
                  Shop New Arrivals
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 sm:h-13 px-8 text-xs uppercase tracking-[0.14em] font-medium text-white border-white/40 hover:bg-white/10 hover:border-white"
              >
                <Link to="/collections/$slug" params={{ slug: "studio-tailoring" }}>
                  Explore Collection
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BRAND PROMISE PILLARS */}
      <section className="border-b border-border bg-background py-8 sm:py-10">
        <div className="container-page">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                icon: Feather,
                title: "Thoughtful Materials",
                desc: "Long-staple cotton, natural wool & washed linens.",
              },
              {
                icon: Compass,
                title: "Considered Design",
                desc: "Proportions tested for natural drape and movement.",
              },
              {
                icon: ShieldCheck,
                title: "Made to Last",
                desc: "Dense weights and reinforced seam construction.",
              },
              {
                icon: RefreshCw,
                title: "Easy 14-Day Returns",
                desc: "Complimentary doorstep pickup across India.",
              },
            ].map((pillar) => (
              <div key={pillar.title} className="flex flex-col items-start text-left">
                <pillar.icon className="h-5 w-5 text-accent mb-2.5" strokeWidth={1.4} />
                <h2 className="font-display text-sm font-medium text-foreground">{pillar.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS CAROUSEL */}
      <section className="section-y bg-background">
        <div className="container-page">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 md:mb-10 gap-4">
            <div>
              <p className="eyebrow text-subtle">Recent Additions</p>
              <h2 className="mt-1.5 font-display text-2xl sm:text-4xl">New Arrivals</h2>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="subtle" size="sm" className="hidden sm:inline-flex">
                <Link to="/collections/$slug" params={{ slug: "new-arrivals" }}>
                  View All ({newArrivals.length}) <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Grid layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {newArrivals.slice(0, 8).map((product, idx) => (
              <ProductCard key={product.slug} product={product} priority={idx < 4} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Button asChild variant="outline" className="w-full h-11 text-xs uppercase tracking-wider">
              <Link to="/collections/$slug" params={{ slug: "new-arrivals" }}>
                View All New Arrivals ({newArrivals.length})
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 4. FEATURED COLLECTION SPLIT BANNER */}
      <section className="bg-secondary/40 border-y border-border">
        <div className="container-page py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="relative aspect-4/5 overflow-hidden bg-secondary">
              <img
                src={featuredCollection.image}
                alt={featuredCollection.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="bg-background/90 backdrop-blur-xs px-3 py-1 text-[11px] uppercase tracking-widest font-medium">
                  Featured Series
                </span>
              </div>
            </div>

            <div className="max-w-lg space-y-6">
              <span className="eyebrow text-subtle">Collection Study 04</span>
              <h2 className="font-display text-3xl sm:text-5xl font-normal leading-tight">
                {featuredCollection.title}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                {featuredCollection.description} Designed for quiet distinction with unlined shoulders, structured drapery, and a palette rooted in chalk, sand, and charcoal.
              </p>

              <div className="pt-2 flex flex-wrap gap-4">
                <Button asChild className="h-12 px-7 text-xs uppercase tracking-[0.12em]">
                  <Link to="/collections/$slug" params={{ slug: featuredCollection.slug }}>
                    Explore Series
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 px-7 text-xs uppercase tracking-[0.12em]">
                  <Link to="/shop" search={{ collection: featuredCollection.slug } as never}>
                    View Lookbook
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SHOP THE LOOK (INTERACTIVE HOTSPOTS) */}
      <section className="section-y bg-background">
        <div className="container-page">
          <div className="text-center max-w-xl mx-auto mb-10 md:mb-14">
            <p className="eyebrow text-subtle">Editorial Curation</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">Shop The Look</h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              A balanced uniform cut for daily versatility. Tap any hotspot to inspect or add to your bag.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
            {/* Interactive Image */}
            <div className="lg:col-span-7 relative aspect-4/5 overflow-hidden bg-secondary">
              <img
                src="/images/look-1.jpg"
                alt="Editorial outfit composition"
                className="h-full w-full object-cover"
              />

              {/* Hotspot Markers */}
              {lookHotspots.map((spot, idx) => (
                <div
                  key={spot.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group/spot"
                  style={{ left: spot.x, top: spot.y }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveLookIndex(idx)}
                    aria-label={`Inspect ${spot.title}`}
                    className={cn(
                      "relative grid h-8 w-8 place-items-center rounded-full bg-background text-foreground shadow-lift transition-transform",
                      activeLookIndex === idx ? "scale-110 ring-2 ring-ink" : "hover:scale-110",
                    )}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="absolute inset-0 rounded-full animate-ping bg-background/50 pointer-events-none -z-10" />
                  </button>

                  {/* Desktop Hover Tooltip */}
                  <div className="hidden sm:block pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 w-48 bg-background/95 backdrop-blur-xs p-3 text-left shadow-lift border border-border opacity-0 group-hover/spot:opacity-100 transition-opacity z-20">
                    <p className="text-xs font-medium truncate">{spot.title}</p>
                    <p className="num text-xs text-muted-foreground mt-0.5">{formatINR(spot.price)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Look Details Sidebar */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <span className="eyebrow text-subtle">Look 01 / Studio Casual</span>
                <h3 className="font-display text-2xl mt-1">Overshirt & Column Denim</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Layered heavy cotton overshirt paired with an organic jersey tee and dry selvedge denim.
                </p>
              </div>

              {/* Hotspot Item list */}
              <div className="divide-y divide-border border-y border-border">
                {lookHotspots.map((item, idx) => {
                  const product = productService.bySlug(item.slug);
                  const isSelected = activeLookIndex === idx;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveLookIndex(idx)}
                      className={cn(
                        "flex items-center justify-between py-3.5 cursor-pointer transition-colors px-2",
                        isSelected ? "bg-secondary/60" : "hover:bg-secondary/30",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="num text-xs text-muted-foreground">0{idx + 1}</span>
                        <div>
                          <p className="text-xs font-medium">{item.title}</p>
                          <p className="num text-[11px] text-muted-foreground">{formatINR(item.price)}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuickView(item.slug);
                        }}
                        className="text-xs text-accent font-medium hover:underline"
                      >
                        Quick Add
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2.5 pt-2">
                <Button
                  onClick={handleShopCompleteLook}
                  className="w-full h-12 text-xs uppercase tracking-[0.12em]"
                >
                  Shop The Complete Look — {formatINR(lookHotspots.reduce((sum, i) => sum + i.price, 0))}
                </Button>
                <p className="text-[11px] text-center text-muted-foreground">
                  Individual pieces can be adjusted or removed in your bag.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BEST SELLERS GRID */}
      <section className="section-y bg-secondary/30 border-y border-border">
        <div className="container-page">
          <div className="flex items-end justify-between mb-8 md:mb-10">
            <div>
              <p className="eyebrow text-subtle">Proven Staples</p>
              <h2 className="mt-1.5 font-display text-2xl sm:text-4xl">Best Sellers</h2>
            </div>
            <Button asChild variant="subtle" size="sm" className="hidden sm:inline-flex">
              <Link to="/shop" search={{ sort: "rating" } as never}>
                View All <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.slice(0, 8).map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. BRAND STORY EDITORIAL */}
      <section className="section-y bg-background">
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            <div className="lg:col-span-5 space-y-6">
              <span className="eyebrow text-subtle">The Atelier</span>
              <h2 className="font-display text-3xl sm:text-5xl font-normal leading-tight">
                Less noise. Better pieces.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                AVELOR was founded on a simple dissatisfaction with fleeting fashion cycles and overdesigned garments. We build honest, understated clothing that wears easily and lasts through years of regular use.
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Every fabric is sourced from certified family-run mills, garment washed for soft structure, and finished with meticulous seam allowances.
              </p>
              <div className="pt-2">
                <Button asChild variant="outline" className="h-11 px-6 text-xs uppercase tracking-wider">
                  <Link to="/about">Read Our Full Story</Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 gap-4">
              <div className="aspect-3/4 overflow-hidden bg-secondary">
                <img
                  src="/images/story-1.jpg"
                  alt="Fabric cutting in studio"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="aspect-3/4 overflow-hidden bg-secondary mt-8">
                <img
                  src="/images/detail-fabric.jpg"
                  alt="Raw cotton texture closeup"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. EDITORIAL CAMPAIGN BANNER */}
      <section className="relative min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center bg-secondary overflow-hidden">
        <img
          src="/images/campaign.jpg"
          alt="Campaign study"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.75]"
        />
        <div className="container-page relative z-10 text-center text-white py-16">
          <span className="eyebrow tracking-[0.25em] text-white/80 uppercase mb-3 inline-block">
            Denim Study · Release 02
          </span>
          <h2 className="font-display text-3xl sm:text-6xl max-w-2xl mx-auto leading-tight text-white">
            Raw indigo woven on vintage shuttle looms.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-white/80 max-w-md mx-auto">
            13.5 oz selvedge denim crafted with authentic ring-spun yarn and custom copper hardware.
          </p>
          <div className="mt-8">
            <Button
              asChild
              className="h-12 px-8 text-xs uppercase tracking-[0.14em] font-medium bg-white text-ink hover:bg-white/90"
            >
              <Link to="/collections/$slug" params={{ slug: "denim-study" }}>
                Explore The Denim Study
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS */}
      <section className="section-y bg-background">
        <div className="container-page">
          <div className="text-center max-w-xl mx-auto mb-10 md:mb-14">
            <p className="eyebrow text-subtle">Client Reflections</p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">Wearer Notes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="flex flex-col justify-between p-6 sm:p-8 bg-secondary/30 border border-border/70"
              >
                <div>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-3.5 w-3.5",
                          i < r.rating ? "fill-foreground text-foreground" : "text-border",
                        )}
                      />
                    ))}
                  </div>
                  <h3 className="font-display text-lg mb-2 leading-snug">"{r.title}"</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {r.body}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-border/50 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-medium text-foreground">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground">{r.city}</p>
                  </div>
                  {r.verified && (
                    <span className="flex items-center gap-1 text-[11px] text-accent">
                      <CheckCircle2 className="h-3 w-3" /> Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. INSTAGRAM / SOCIAL PROOF GALLERY */}
      <section className="border-t border-border bg-background pt-12 pb-16">
        <div className="container-page mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <p className="eyebrow text-subtle">Community</p>
            <h2 className="mt-1 font-display text-xl sm:text-2xl">Worn Worldwide</h2>
          </div>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-accent hover:underline"
          >
            Follow @avelor on Instagram →
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 px-2 sm:px-4">
          {[
            { img: "/images/p-shirt-1.jpg", tag: "@siddharth.m" },
            { img: "/images/p-dress-1.jpg", tag: "@meera.atelier" },
            { img: "/images/p-overshirt-1.jpg", tag: "@arjun_k" },
            { img: "/images/p-jacket-1.jpg", tag: "@tanya.studio" },
            { img: "/images/p-jeans-1.jpg", tag: "@rohan_v" },
            { img: "/images/p-knit-1.jpg", tag: "@ananya.r" },
          ].map((item, idx) => (
            <div key={idx} className="group relative aspect-square overflow-hidden bg-secondary">
              <img
                src={item.img}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center text-white">
                <span className="text-[11px] font-medium tracking-wider">{item.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11. NEWSLETTER REGISTER */}
      <section className="bg-ink text-ink-foreground py-16 sm:py-20">
        <div className="container-page text-center max-w-xl mx-auto">
          <span className="eyebrow tracking-[0.2em] text-white/60 uppercase">The Register</span>
          <h2 className="mt-2 font-display text-3xl sm:text-5xl font-normal text-white">
            Stay in the loop.
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-white/70 font-light leading-relaxed">
            Receive private notifications for seasonal collection drops, editorial essays, and studio archival releases.
          </p>

          {subscribed ? (
            <div className="mt-8 p-4 border border-white/20 bg-white/5 text-xs text-white">
              Thank you for subscribing. A confirmation note has been dispatched.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="mt-8 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address"
                className="h-12 flex-1 bg-white/10 border border-white/20 px-4 text-xs text-white placeholder:text-white/50 outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                className="h-12 px-6 bg-white text-ink text-xs uppercase tracking-[0.12em] font-medium hover:bg-white/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          )}

          <p className="mt-4 text-[10px] text-white/40">
            We value your privacy. Unsubscribe at any time with a single click.
          </p>
        </div>
      </section>
    </div>
  );
}
