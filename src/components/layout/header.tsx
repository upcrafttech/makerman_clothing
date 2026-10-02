import { Link, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, User, X, Phone, MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";

import { MakermanLogo } from "@/components/layout/makerman-logo";
import { BRAND } from "@/data/content";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  to: "/store";
  search?: {
    gender?: "all" | "women" | "men";
    collection?: string;
  };
};

const NAV_ITEMS: NavItem[] = [
  { label: "STORE", to: "/store" },
  { label: "MEN", to: "/store", search: { gender: "men" } },
  { label: "WOMEN", to: "/store", search: { gender: "women" } },
  { label: "NEW ARRIVALS", to: "/store", search: { collection: "new-arrivals" } },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, wishlist, setCartOpen, setSearchOpen } = useShop();
  const currentPath = useRouterState({ select: (s) => s.location.pathname });

  // Close mobile drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [currentPath]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Editorial Announcement Bar */}
      <div className="bg-[#171717] text-[#FAF8F5] py-2 px-4 text-center text-[0.6875rem] font-medium tracking-[0.18em] uppercase border-b border-[#282828] select-none">
        <span>Complimentary Pan-India Shipping on orders above ₹1,999 · Feeling Happiness</span>
      </div>

      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          scrolled
            ? "bg-background/95 backdrop-blur-md border-b border-border shadow-soft"
            : "bg-background border-b border-border/40",
        )}
      >
        <div className="container-page">
          {/* Desktop & Tablet Header Layout */}
          <div className="grid h-16 sm:h-20 grid-cols-[1fr_auto_1fr] items-center gap-4">
            
            {/* Desktop Left: Navigation */}
            <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-8">
              {NAV_ITEMS.map((item) =>
                item.search ? (
                  <Link
                    key={item.label}
                    to={item.to}
                    search={item.search}
                    className={cn(
                      "text-xs uppercase font-medium tracking-[0.16em] text-foreground/80 hover:text-foreground transition-colors relative py-1.5",
                      "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-foreground after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left",
                    )}
                    activeProps={{
                      className: "text-foreground font-semibold after:scale-x-100",
                    }}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <Link
                    key={item.label}
                    to={item.to}
                    className={cn(
                      "text-xs uppercase font-medium tracking-[0.16em] text-foreground/80 hover:text-foreground transition-colors relative py-1.5",
                      "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-foreground after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left",
                    )}
                    activeProps={{
                      className: "text-foreground font-semibold after:scale-x-100",
                    }}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>

            {/* Mobile Left: Menu Toggle Button (Min 44x44px touch target) */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={menuOpen}
                className="inline-flex h-11 w-11 items-center justify-center rounded-sm text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search Makerman"
                className="inline-flex h-11 w-11 items-center justify-center rounded-sm text-foreground hover:bg-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Search className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Center: Official Makerman Logo */}
            <div className="flex items-center justify-center text-center">
              <MakermanLogo size="md" className="py-1" />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end gap-1 sm:gap-2">
              {/* Desktop Search Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="hidden lg:inline-flex h-11 w-11 items-center justify-center rounded-sm text-foreground/80 hover:text-foreground hover:bg-secondary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Search className="h-[18px] w-[18px]" strokeWidth={1.4} />
              </button>

              {/* Favorites (Wishlist) Link */}
              <Link
                to="/favorites"
                aria-label={`Favorites, ${wishlist.length} saved items`}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-sm text-foreground/80 hover:text-foreground hover:bg-secondary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Heart
                  className={cn(
                    "h-[18px] w-[18px] transition-colors",
                    wishlist.length > 0 ? "fill-amber-500 text-amber-500" : "",
                  )}
                  strokeWidth={1.4}
                />
                {wishlist.length > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#171717] px-1 text-[0.5625rem] font-medium text-white shadow-xs">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* Account Link */}
              <Link
                to="/account"
                aria-label="Account"
                className="hidden sm:inline-flex h-11 w-11 items-center justify-center rounded-sm text-foreground/80 hover:text-foreground hover:bg-secondary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <User className="h-[18px] w-[18px]" strokeWidth={1.4} />
              </Link>

              {/* Bag (Cart) Button */}
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                aria-label={`Shopping bag, ${cartCount} items`}
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-sm text-foreground/80 hover:text-foreground hover:bg-secondary/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.4} />
                {cartCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#171717] px-1 text-[0.5625rem] font-medium text-white shadow-xs animate-in zoom-in-50">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Navigation Drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 transition-opacity duration-300 lg:hidden",
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer Panel */}
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex w-full max-w-xs flex-col bg-background shadow-2xl transition-transform duration-300 ease-out",
            menuOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {/* Drawer Header */}
          <div className="flex h-16 items-center justify-between border-b border-border px-5">
            <MakermanLogo size="sm" />
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm text-foreground/70 hover:bg-secondary hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Drawer Navigation Links */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
            <div className="space-y-1">
              <p className="px-3 text-[0.625rem] uppercase font-semibold tracking-widest text-muted-foreground mb-2">
                Navigation
              </p>
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center h-11 px-3 text-sm font-medium tracking-wider text-foreground hover:bg-secondary rounded-sm transition-colors"
              >
                HOME
              </Link>
              {NAV_ITEMS.map((item) =>
                item.search ? (
                  <Link
                    key={item.label}
                    to={item.to}
                    search={item.search}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center h-11 px-3 text-sm font-medium tracking-wider text-foreground hover:bg-secondary rounded-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center h-11 px-3 text-sm font-medium tracking-wider text-foreground hover:bg-secondary rounded-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </div>

            <div className="border-t border-border pt-4 space-y-1">
              <p className="px-3 text-[0.625rem] uppercase font-semibold tracking-widest text-muted-foreground mb-2">
                Personal
              </p>
              <Link
                to="/favorites"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between h-11 px-3 text-sm font-medium text-foreground hover:bg-secondary rounded-sm transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  FAVORITES
                </span>
                {wishlist.length > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 bg-secondary text-foreground rounded-full">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <Link
                to="/cart"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between h-11 px-3 text-sm font-medium text-foreground hover:bg-secondary rounded-sm transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  SHOPPING BAG
                </span>
                {cartCount > 0 && (
                  <span className="text-xs font-semibold px-2 py-0.5 bg-ink text-ink-foreground rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link
                to="/account"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 h-11 px-3 text-sm font-medium text-foreground hover:bg-secondary rounded-sm transition-colors"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                ACCOUNT & ORDERS
              </Link>
            </div>

            <div className="border-t border-border pt-4 space-y-1">
              <p className="px-3 text-[0.625rem] uppercase font-semibold tracking-widest text-muted-foreground mb-2">
                Assistance
              </p>
              <Link
                to="/contact"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 h-11 px-3 text-sm font-medium text-foreground hover:bg-secondary rounded-sm transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                CONTACT US & FAQ
              </Link>
            </div>
          </div>

          {/* Concierge Info at Drawer Footer */}
          <div className="border-t border-border bg-secondary/40 p-4">
            <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-muted-foreground">
              Client Concierge
            </p>
            <div className="mt-2 flex items-center justify-between text-xs text-foreground">
              <a
                href={`tel:${BRAND.phone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-1.5 hover:underline"
              >
                <Phone className="h-3.5 w-3.5" />
                {BRAND.phone}
              </a>
              <span className="text-muted-foreground">10am–7pm IST</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
