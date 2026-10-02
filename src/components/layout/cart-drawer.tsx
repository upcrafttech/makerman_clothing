import { Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { formatINR, FREE_SHIPPING_THRESHOLD } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { productService } from "@/services";
import { useProducts } from "@/hooks/use-api";

export function CartDrawer() {
  const { data: _catalog } = useProducts();
  const {
    cart,
    cartCount,
    subtotal,
    cartOpen,
    setCartOpen,
    updateQuantity,
    removeLine,
    toggleSaveForLater,
  } = useShop();

  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartOpen]);

  const activeLines = cart.filter((l) => !l.savedForLater);
  const savedLines = cart.filter((l) => l.savedForLater);

  const amountNeeded = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
  const progressPercent = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[80] transition-opacity duration-300",
        cartOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
      aria-hidden={!cartOpen}
    >
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-xs transition-opacity"
        onClick={() => setCartOpen(false)}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-background shadow-lift transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]",
          cartOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg tracking-[0.12em] uppercase">Your Bag</h2>
            <span className="num text-xs text-muted-foreground">({cartCount})</span>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="grid h-11 w-11 place-items-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close bag"
          >
            <X className="h-5 w-5" strokeWidth={1.4} />
          </button>
        </div>

        {/* Free Shipping Progress */}
        <div className="border-b border-border bg-secondary/50 px-6 py-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">
              {amountNeeded === 0 ? (
                <span className="font-medium text-foreground">You have unlocked complimentary shipping!</span>
              ) : (
                <>
                  <span className="num font-semibold text-foreground">{formatINR(amountNeeded)}</span> away from complimentary shipping
                </>
              )}
            </span>
            <span className="num text-[11px] text-muted-foreground">{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden bg-border rounded-full">
            <div
              className="h-full bg-ink transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {activeLines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/50 stroke-[1.2]" />
              <p className="mt-4 font-display text-lg">Your bag is empty</p>
              <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">
                Explore our curated essentials and add your favorite pieces.
              </p>
              <Button
                asChild
                className="mt-6 h-11 px-6 text-xs uppercase tracking-wider bg-ink text-ink-foreground hover:bg-ink/90"
                onClick={() => setCartOpen(false)}
              >
                <Link to="/store">Explore Store</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {activeLines.map((line) => {
                const product = productService.bySlug(line.productSlug);
                if (!product) return null;
                return (
                  <div key={line.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <Link
                      to="/product/$slug"
                      params={{ slug: product.slug }}
                      onClick={() => setCartOpen(false)}
                      className="block h-24 w-18 shrink-0 overflow-hidden bg-secondary"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </Link>

                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to="/product/$slug"
                            params={{ slug: product.slug }}
                            onClick={() => setCartOpen(false)}
                            className="text-sm font-medium leading-snug line-clamp-1 hover:underline"
                          >
                            {product.name}
                          </Link>
                          <span className="num text-sm font-medium shrink-0">
                            {formatINR(product.price * line.quantity)}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {line.color} / {line.size}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-border bg-background">
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.id, line.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="num grid h-7 w-7 place-items-center text-xs font-medium">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.id, line.quantity + 1)}
                            aria-label="Increase quantity"
                            className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleSaveForLater(line.id)}
                            className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2"
                          >
                            Save for later
                          </button>
                          <button
                            type="button"
                            onClick={() => removeLine(line.id)}
                            aria-label="Remove item"
                            className="text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Saved for Later */}
          {savedLines.length > 0 && (
            <div className="border-t border-border pt-4">
              <h3 className="eyebrow text-subtle mb-3">Saved For Later ({savedLines.length})</h3>
              <div className="divide-y divide-border/40">
                {savedLines.map((line) => {
                  const product = productService.bySlug(line.productSlug);
                  if (!product) return null;
                  return (
                    <div key={line.id} className="flex items-center justify-between py-2.5 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={product.images[0]}
                          alt=""
                          className="h-10 w-8 shrink-0 object-cover bg-secondary"
                        />
                        <div className="truncate">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {line.size} · {formatINR(product.price)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleSaveForLater(line.id)}
                          className="text-xs font-medium text-accent hover:underline"
                        >
                          Move to Bag
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLine(line.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {activeLines.length > 0 && (
          <div className="border-t border-border bg-background p-6 space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="num font-medium text-foreground text-sm">{formatINR(subtotal)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Taxes, shipping and promotion codes calculated at checkout.
              </p>
            </div>

            <div className="grid gap-2">
              <Button
                asChild
                className="w-full h-12 text-xs uppercase tracking-[0.1em]"
                onClick={() => setCartOpen(false)}
              >
                <Link to="/checkout" className="flex items-center justify-center gap-2">
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="w-full h-11 text-xs uppercase tracking-[0.08em]"
                onClick={() => setCartOpen(false)}
              >
                <Link to="/cart">View Full Bag</Link>
              </Button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
