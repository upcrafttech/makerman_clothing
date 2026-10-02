import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { collectionService } from "@/services";
import { productService } from "@/services";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/data/products";

type NavItem = {
  label: string;
  to: string;
  search?: Record<string, string>;
  columns?: { title: string; links: { label: string; to: string; search?: Record<string, string> }[] }[];
  feature?: { image: string; title: string; caption: string; to: string };
};

const catLink = (slug: string) => ({ to: "/shop", search: { category: slug } });

const NAV: NavItem[] = [
  {
    label: "New Arrivals",
    to: "/collections/$slug",
    search: { slug: "new-arrivals" },
  },
  {
    label: "Women",
    to: "/shop",
    search: { gender: "women" },
    columns: [
      {
        title: "Clothing",
        links: [
          { label: "Dresses", ...catLink("dresses") },
          { label: "Shirts & Blouses", ...catLink("shirts") },
          { label: "Knitwear", ...catLink("knitwear") },
          { label: "Trousers", ...catLink("trousers") },
          { label: "Jeans", ...catLink("jeans") },
        ],
      },
      {
        title: "Collections",
        links: [
          { label: "Studio Tailoring", to: "/collections/studio-tailoring" },
          { label: "Winter Atelier", to: "/collections/winter-atelier" },
          { label: "Summer Neutrals", to: "/collections/summer-neutrals" },
          { label: "Essentials", to: "/collections/essentials" },
        ],
      },
    ],
    feature: {
      image: "/images/editorial-1.jpg",
      title: "Studio Tailoring",
      caption: "Soft construction, long lines.",
      to: "/collections/studio-tailoring",
    },
  },
  {
    label: "Men",
    to: "/shop",
    search: { gender: "men" },
    columns: [
      {
        title: "Clothing",
        links: [
          { label: "T-Shirts", ...catLink("t-shirts") },
          { label: "Shirts", ...catLink("shirts") },
          { label: "Overshirts", ...catLink("overshirts") },
          { label: "Hoodies", ...catLink("hoodies") },
          { label: "Jeans", ...catLink("jeans") },
        ],
      },
      {
        title: "Collections",
        links: [
          { label: "Layering", to: "/collections/layering" },
          { label: "Denim Study", to: "/collections/denim-study" },
          { label: "Essentials", to: "/collections/essentials" },
          { label: "New Arrivals", to: "/collections/new-arrivals" },
        ],
      },
    ],
    feature: {
      image: "/images/p-overshirt-1.jpg",
      title: "The Overshirt",
      caption: "Our most-worn layer, restocked.",
      to: "/product/warden-twill-overshirt",
    },
  },
  { label: "Collections", to: "/collections" },
  { label: "Essentials", to: "/collections/$slug", search: { slug: "essentials" } },
  { label: "Journal", to: "/journal" },
  { label: "About", to: "/about" },
];

const LinkAny = Link as unknown as React.ComponentType<
  Record<string, unknown> & { children?: React.ReactNode }
>;

export function Header() {
  const { cartCount, setCartOpen, setSearchOpen, wishlist } = useShop();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [openMega, setOpenMega] = useState<string | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setOpenMega(null);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      {!bannerDismissed && (
        <div className="relative bg-ink text-ink-foreground">
          <div className="container-page flex h-9 items-center justify-center pr-8 sm:pr-0">
            <p className="eyebrow truncate text-center text-[0.625rem] sm:text-[0.6875rem]">
              Complimentary shipping on orders above ₹1,999
            </p>
            <button
              type="button"
              onClick={() => setBannerDismissed(true)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/60 hover:text-white transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-colors duration-300",
          scrolled ? "border-border bg-background/85 backdrop-blur-md" : "border-transparent bg-background",
        )}
      >
        <div className="container-page">
          <div className="grid h-16 grid-cols-[auto_1fr_auto] items-center gap-3 lg:h-20">
            <div className="flex items-center gap-1 lg:hidden">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="grid h-11 w-11 place-items-center"
              >
                <Menu className="h-5 w-5" strokeWidth={1.3} />
              </button>
            </div>

            <div className="flex min-w-0 items-center justify-center lg:col-start-1 lg:justify-start">
              <Link
                to="/"
                className="font-display text-xl tracking-[0.32em] uppercase lg:text-2xl"
                aria-label="AVELOR home"
              >
                Avelor
              </Link>
            </div>

            <nav
              aria-label="Primary"
              className="col-start-2 hidden items-center justify-center gap-7 lg:flex"
              onMouseLeave={() => setOpenMega(null)}
            >
              {NAV.map((item) => (
                <div key={item.label} onMouseEnter={() => setOpenMega(item.columns ? item.label : null)}>
                  <LinkAny
                    to={item.to}
                    params={item.to === "/collections/$slug" ? { slug: item.search!["slug"]! } : undefined}
                    search={item.to === "/shop" ? item.search : undefined}
                    className="link-underline py-2 text-[0.8125rem] tracking-[0.02em]"
                  >
                    {item.label}
                  </LinkAny>




                </div>
              ))}
            </nav>

            <div className="col-start-3 flex items-center justify-end gap-0.5">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="grid h-11 w-11 place-items-center transition-colors hover:text-accent"
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.3} />
              </button>
              <Link
                to="/wishlist"
                aria-label={`Wishlist, ${wishlist.length} items`}
                className="relative hidden h-11 w-11 place-items-center transition-colors hover:text-accent sm:grid"
              >
                <Heart className="h-[18px] w-[18px]" strokeWidth={1.3} />
                {wishlist.length > 0 ? (
                  <span className="num absolute right-1.5 top-1.5 min-w-4 rounded-full bg-ink px-1 text-[0.5625rem] leading-4 text-ink-foreground">
                    {wishlist.length}
                  </span>
                ) : null}
              </Link>
              <Link
                to="/account"
                aria-label="Account"
                className="hidden h-11 w-11 place-items-center transition-colors hover:text-accent sm:grid"
              >
                <User className="h-[18px] w-[18px]" strokeWidth={1.3} />
              </Link>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label={`Cart, ${cartCount} items`}
                className="relative grid h-11 w-11 place-items-center transition-colors hover:text-accent"
              >
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.3} />
                {cartCount > 0 ? (
                  <span
                    key={cartCount}
                    className="num absolute right-1 top-1.5 min-w-4 animate-in zoom-in rounded-full bg-ink px-1 text-[0.5625rem] leading-4 text-ink-foreground"
                  >
                    {cartCount}
                  </span>
                ) : null}
              </button>
            </div>
          </div>
        </div>

        {/* Mega menu */}
        {NAV.filter((n) => n.columns).map((item) => (
          <div
            key={item.label}
            onMouseEnter={() => setOpenMega(item.label)}
            onMouseLeave={() => setOpenMega(null)}
            className={cn(
              "absolute inset-x-0 top-full hidden border-b border-border bg-background lg:block",
              openMega === item.label ? "opacity-100" : "pointer-events-none opacity-0",
              "transition-opacity duration-200",
            )}
          >
            <div className="container-page grid grid-cols-[repeat(2,minmax(0,1fr))_1.2fr] gap-10 py-10">
              {item.columns!.map((col) => (
                <div key={col.title}>
                  <p className="eyebrow mb-4 text-subtle">{col.title}</p>
                  <ul className="grid gap-2.5">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <Link
                          to={l.to}
                          search={l.search as never}
                          className="link-underline text-sm text-muted-foreground hover:text-foreground"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-6">
                <Link to={item.feature!.to} className="group block">
                  <div className="aspect-4/5 overflow-hidden bg-secondary">
                    <img
                      src={item.feature!.image}
                      alt={item.feature!.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-3 text-sm">{item.feature!.title}</p>
                  <p className="text-xs text-muted-foreground">{item.feature!.caption}</p>
                </Link>
                <div>
                  <p className="eyebrow mb-4 text-subtle">Best Sellers</p>
                  <ul className="grid gap-3">
                    {productService.bestSellers(3).map((p) => (
                      <li key={p.slug}>
                        <Link
                          to="/product/$slug"
                          params={{ slug: p.slug }}
                          className="flex items-center gap-3"
                        >
                          <img
                            src={p.images[0]}
                            alt=""
                            loading="lazy"
                            className="h-14 w-11 shrink-0 object-cover"
                          />
                          <span className="min-w-0 text-xs leading-snug text-muted-foreground hover:text-foreground">
                            {p.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </header>

      {/* Mobile menu */}
      <div
        className={cn(
          "fixed inset-0 z-[70] lg:hidden",
          menuOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!menuOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-ink/40 transition-opacity duration-300",
            menuOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMenuOpen(false)}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={cn(
            "absolute inset-y-0 left-0 flex w-[min(88vw,26rem)] flex-col bg-background transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
            menuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <span className="font-display text-lg tracking-[0.32em] uppercase">Avelor</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="grid h-11 w-11 place-items-center"
            >
              <X className="h-5 w-5" strokeWidth={1.3} />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
            <ul className="grid">
              {[
                { label: "New Arrivals", to: "/collections/new-arrivals" },
                { label: "Women", to: "/shop", search: { gender: "women" } },
                { label: "Men", to: "/shop", search: { gender: "men" } },
                { label: "Collections", to: "/collections" },
                { label: "Essentials", to: "/collections/essentials" },
                { label: "Journal", to: "/journal" },
                { label: "About", to: "/about" },
                { label: "Contact", to: "/contact" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    search={l.search as never}
                    className="flex min-h-[3.25rem] items-center border-b border-border font-display text-xl"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="eyebrow mt-8 mb-3 text-subtle">Shop by category</p>
            <ul className="grid grid-cols-2 gap-x-4">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link
                    to="/shop"
                    search={{ category: c.slug } as never}
                    className="flex min-h-11 items-center text-sm text-muted-foreground"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="eyebrow mt-8 mb-3 text-subtle">Featured</p>
            <div className="grid grid-cols-2 gap-3 pb-6">
              {collectionService
                .all()
                .slice(2, 4)
                .map((c) => (
                  <Link key={c.slug} to="/collections/$slug" params={{ slug: c.slug }} className="block">
                    <div className="aspect-4/5 overflow-hidden bg-secondary">
                      <img src={c.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </div>
                    <p className="mt-2 text-xs">{c.title}</p>
                  </Link>
                ))}
            </div>
          </nav>
          <div className="safe-bottom grid gap-2 border-t border-border px-4 pt-3">
            <div className="grid grid-cols-2 gap-2">
              <Button asChild variant="subtle" size="sm" className="h-11">
                <Link to="/wishlist">Wishlist</Link>
              </Button>
              <Button asChild variant="subtle" size="sm" className="h-11">
                <Link to="/account">Account</Link>
              </Button>
            </div>
            <Button asChild size="full">
              <Link to="/shop">Shop all</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
