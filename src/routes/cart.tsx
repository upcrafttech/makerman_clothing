import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cartTotals, formatINR, FREE_SHIPPING_THRESHOLD } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { productService } from "@/services";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Shopping Bag — AVELOR" },
      { name: "description", content: "Review items in your shopping bag and proceed to checkout." },
    ],
  }),
  component: CartPage,
});

export function CartPage() {
  const {
    cart,
    cartCount,
    subtotal,
    updateQuantity,
    removeLine,
    toggleSaveForLater,
    clearCart,
  } = useShop();

  const [promoCode, setPromoCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");

  const activeLines = cart.filter((l) => !l.savedForLater);
  const savedLines = cart.filter((l) => l.savedForLater);

  const { shipping, tax, total } = cartTotals(subtotal, discountAmount);
  const amountNeeded = Math.max(FREE_SHIPPING_THRESHOLD - (subtotal - discountAmount), 0);
  const progressPercent = Math.min(((subtotal - discountAmount) / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === "WELCOME10") {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      setAppliedCode("WELCOME10 (10% Off)");
      toast.success("Promo code applied: 10% discount.");
    } else if (code === "AVELOR15") {
      const discount = Math.round(subtotal * 0.15);
      setDiscountAmount(discount);
      setAppliedCode("AVELOR15 (15% Off)");
      toast.success("Promo code applied: 15% discount.");
    } else {
      toast.error("Invalid promotion code. Try WELCOME10");
    }
  };

  const handleRemovePromo = () => {
    setDiscountAmount(0);
    setAppliedCode("");
    setPromoCode("");
  };

  return (
    <div className="container-page py-10 md:py-16">
      <div className="border-b border-border pb-6 mb-8">
        <h1 className="font-display text-3xl sm:text-5xl">Shopping Bag</h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
          Review your selected pieces, adjust sizes or save items for later.
        </p>
      </div>

      {activeLines.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border p-8 max-w-lg mx-auto">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-muted-foreground mx-auto mb-4">
            <ShoppingBag className="h-8 w-8" strokeWidth={1.2} />
          </div>
          <h2 className="font-display text-2xl">Your bag is currently empty</h2>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Explore our curated catalog of modern essentials, tailoring, and denim.
          </p>
          <Button asChild className="mt-6 text-xs uppercase tracking-wider">
            <Link to="/shop">Explore Collection</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Main items column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Free shipping banner */}
            <div className="border border-border bg-secondary/40 p-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="flex items-center gap-2 font-medium">
                  <Truck className="h-4 w-4 text-accent" />
                  {amountNeeded === 0 ? (
                    <span>Complimentary Express Shipping Unlocked!</span>
                  ) : (
                    <>Add <span className="num font-semibold">{formatINR(amountNeeded)}</span> more for free delivery</>
                  )}
                </span>
                <span className="num text-muted-foreground">{Math.round(progressPercent)}%</span>
              </div>
              <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-ink transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="divide-y divide-border border-y border-border">
              {activeLines.map((line) => {
                const product = productService.bySlug(line.productSlug);
                if (!product) return null;
                return (
                  <div key={line.id} className="py-6 flex flex-col sm:flex-row gap-5 items-start">
                    <Link
                      to="/product/$slug"
                      params={{ slug: product.slug }}
                      className="h-32 w-24 shrink-0 overflow-hidden bg-secondary"
                    >
                      <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <p className="eyebrow text-subtle text-[10px]">{product.categoryLabel}</p>
                          <Link
                            to="/product/$slug"
                            params={{ slug: product.slug }}
                            className="font-display text-lg hover:underline block mt-0.5"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Color: <span className="text-foreground">{line.color}</span> · Size: <span className="text-foreground">{line.size}</span>
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <p className="num text-base font-medium">{formatINR(product.price * line.quantity)}</p>
                          {line.quantity > 1 && (
                            <p className="num text-[11px] text-muted-foreground">
                              {formatINR(product.price)} each
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-auto">
                        <div className="flex items-center border border-border">
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.id, line.quantity - 1)}
                            className="h-8 w-8 grid place-items-center hover:bg-secondary"
                            aria-label="Decrease"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="num h-8 w-8 grid place-items-center text-xs font-medium">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.id, line.quantity + 1)}
                            className="h-8 w-8 grid place-items-center hover:bg-secondary"
                            aria-label="Increase"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                          <button
                            type="button"
                            onClick={() => toggleSaveForLater(line.id)}
                            className="text-muted-foreground hover:text-foreground underline underline-offset-2"
                          >
                            Save for later
                          </button>
                          <button
                            type="button"
                            onClick={() => removeLine(line.id)}
                            className="text-muted-foreground hover:text-destructive flex items-center gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Saved For Later items */}
            {savedLines.length > 0 && (
              <div className="border border-border p-6 bg-secondary/20">
                <h3 className="font-display text-xl mb-4">Saved For Later ({savedLines.length})</h3>
                <div className="divide-y divide-border">
                  {savedLines.map((line) => {
                    const product = productService.bySlug(line.productSlug);
                    if (!product) return null;
                    return (
                      <div key={line.id} className="py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img src={product.images[0]} alt="" className="h-14 w-11 object-cover bg-secondary" />
                          <div>
                            <p className="text-xs font-medium">{product.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {line.size} · {line.color} · <span className="num font-medium text-foreground">{formatINR(product.price)}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSaveForLater(line.id)}
                            className="h-8 text-xs"
                          >
                            Move to Bag
                          </Button>
                          <button
                            onClick={() => removeLine(line.id)}
                            className="text-muted-foreground hover:text-destructive p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="border border-border p-6 bg-background space-y-6">
              <h2 className="font-display text-xl">Order Summary</h2>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <label className="text-xs text-muted-foreground font-medium">Promotional Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="e.g. WELCOME10"
                    className="flex-1 h-10 border border-border px-3 text-xs uppercase outline-none focus:border-ink"
                  />
                  <Button type="submit" variant="secondary" className="h-10 text-xs uppercase tracking-wider">
                    Apply
                  </Button>
                </div>
                {appliedCode && (
                  <div className="flex items-center justify-between text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 border border-emerald-200">
                    <span>{appliedCode}</span>
                    <button type="button" onClick={handleRemovePromo} className="text-muted-foreground hover:text-foreground">✕</button>
                  </div>
                )}
              </form>

              {/* Totals breakdown */}
              <div className="space-y-3 text-xs divide-y divide-border border-y border-border py-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bag Subtotal</span>
                  <span className="num font-medium">{formatINR(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between pt-3 text-emerald-700">
                    <span>Discount</span>
                    <span className="num font-medium">-{formatINR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3">
                  <span className="text-muted-foreground">Estimated Delivery</span>
                  <span className="num font-medium">
                    {shipping === 0 ? "Free" : formatINR(shipping)}
                  </span>
                </div>
                <div className="flex justify-between pt-3">
                  <span className="text-muted-foreground">Estimated GST (5%)</span>
                  <span className="num font-medium">{formatINR(tax)}</span>
                </div>
                <div className="flex justify-between pt-3 text-sm font-medium">
                  <span>Total Amount</span>
                  <span className="num text-base font-semibold">{formatINR(total)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <div className="space-y-3">
                <Button asChild className="w-full h-13 text-xs uppercase tracking-[0.14em] font-medium">
                  <Link to="/checkout" className="flex items-center justify-center gap-2">
                    Proceed to Checkout <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <p className="text-[11px] text-center text-muted-foreground">
                  Complimentary carbon-neutral express courier.
                </p>
              </div>
            </div>

            {/* Assurance Box */}
            <div className="p-4 border border-border bg-secondary/30 text-xs text-muted-foreground space-y-2">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <span>Guaranteed Atelier Quality</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                If the fit or fabric doesn't meet expectations, return it within 14 days for a full refund or exchange.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
