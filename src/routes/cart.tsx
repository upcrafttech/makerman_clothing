import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cartTotals, formatINR, FREE_SHIPPING_THRESHOLD } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { productService } from "@/services";
import { useProducts } from "@/hooks/use-api";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — MAKERMAN | Feeling Happiness" },
      { name: "description", content: "Review items in your shopping bag and proceed to checkout." },
      { property: "og:title", content: "Your Bag — Makerman Clothing" },
    ],
  }),
  component: CartPage,
});

export function CartPage() {
  const { data: _catalog } = useProducts();
  const {
    cart,
    subtotal,
    updateQuantity,
    removeLine,
    toggleSaveForLater,
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
    if (code === "MAKERMAN10" || code === "WELCOME10") {
      const discount = Math.round(subtotal * 0.1);
      setDiscountAmount(discount);
      setAppliedCode(`${code} (10% Off)`);
      toast.success("Promo code applied: 10% discount");
    } else if (code === "MAKERMAN15") {
      const discount = Math.round(subtotal * 0.15);
      setDiscountAmount(discount);
      setAppliedCode("MAKERMAN15 (15% Off)");
      toast.success("Promo code applied: 15% discount");
    } else if (code === "FIRST500") {
      const discount = Math.min(500, subtotal);
      setDiscountAmount(discount);
      setAppliedCode("FIRST500 (₹500 Off)");
      toast.success("Promo code applied: ₹500 discount");
    } else {
      toast.error("Invalid promotion code. Try MAKERMAN10");
    }
  };

  const handleRemovePromo = () => {
    setDiscountAmount(0);
    setAppliedCode("");
    setPromoCode("");
  };

  return (
    <div className="min-h-[75vh] bg-background py-10 md:py-16 pb-28 lg:pb-16">
      <div className="container-page">
        {/* Header */}
        <div className="border-b border-border/80 pb-6 mb-8">
          <p className="eyebrow text-amber-600 font-semibold tracking-widest">
            Shopping Bag
          </p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-normal text-foreground mt-1">
            Your Bag
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            Review your selected pieces, adjust quantities, and proceed to secure checkout.
          </p>
        </div>

        {activeLines.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-border rounded-sm p-8 max-w-md mx-auto my-6">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-secondary text-muted-foreground mx-auto mb-4">
              <ShoppingBag className="h-7 w-7" strokeWidth={1.4} />
            </div>
            <h2 className="font-display text-2xl font-normal text-foreground">Your bag is empty</h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
              Explore our curated wardrobe of refined everyday essentials and comfortable silhouettes.
            </p>
            <Button
              asChild
              className="mt-7 h-12 px-8 text-xs font-semibold uppercase tracking-widest bg-ink text-ink-foreground hover:bg-ink/90 rounded-sm"
            >
              <Link to="/store" className="inline-flex items-center gap-2">
                <span>Explore Store</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* Bag Lines List */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Shipping Progress Indicator */}
              <div className="border border-border/80 bg-[#FAF8F5] p-4 rounded-sm">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="flex items-center gap-2 text-foreground font-medium">
                    <Truck className="h-4 w-4 text-amber-600 shrink-0" />
                    {amountNeeded === 0 ? (
                      <span className="text-emerald-700 font-semibold">You have unlocked complimentary express shipping!</span>
                    ) : (
                      <span>
                        <strong className="font-semibold">{formatINR(amountNeeded)}</strong> away from complimentary shipping
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground">{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden bg-border/70 rounded-full">
                  <div
                    className="h-full bg-ink transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-border border-y border-border">
                {activeLines.map((line) => {
                  const product = productService.bySlug(line.productSlug);
                  if (!product) return null;

                  return (
                    <div key={line.id} className="py-6 flex gap-4 sm:gap-6">
                      <Link
                        to="/product/$slug"
                        params={{ slug: product.slug }}
                        className="h-28 w-20 sm:h-36 sm:w-28 shrink-0 overflow-hidden bg-secondary rounded-xs"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </Link>

                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
                                {product.categoryLabel}
                              </p>
                              <h3 className="font-medium text-sm sm:text-base text-foreground mt-0.5">
                                <Link to="/product/$slug" params={{ slug: product.slug }} className="hover:underline">
                                  {product.name}
                                </Link>
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                Size: <span className="font-medium text-foreground">{line.size}</span> · Color: <span className="font-medium text-foreground">{line.color}</span>
                              </p>
                            </div>

                            <p className="font-display text-base font-semibold text-foreground text-right shrink-0">
                              {formatINR(product.price * line.quantity)}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
                          {/* Quantity adjustments */}
                          <div className="flex items-center border border-border rounded-sm bg-surface">
                            <button
                              type="button"
                              onClick={() => updateQuantity(line.id, line.quantity - 1)}
                              className="h-8 w-8 grid place-items-center hover:bg-secondary text-foreground"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="h-8 w-8 grid place-items-center text-xs font-semibold text-foreground">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(line.id, line.quantity + 1)}
                              className="h-8 w-8 grid place-items-center hover:bg-secondary text-foreground"
                              aria-label="Increase quantity"
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
                              className="text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
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
                <div className="border border-border p-6 bg-[#FAF8F5] rounded-sm">
                  <h3 className="font-display text-lg font-normal mb-4">Saved For Later ({savedLines.length})</h3>
                  <div className="divide-y divide-border/60">
                    {savedLines.map((line) => {
                      const product = productService.bySlug(line.productSlug);
                      if (!product) return null;
                      return (
                        <div key={line.id} className="py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img src={product.images[0]} alt="" className="h-12 w-10 object-cover bg-secondary rounded-xs" />
                            <div>
                              <p className="text-xs font-semibold">{product.name}</p>
                              <p className="text-[11px] text-muted-foreground">
                                {line.size} · {line.color} · <span className="font-semibold text-foreground">{formatINR(product.price)}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleSaveForLater(line.id)}
                              className="h-8 text-xs font-semibold uppercase tracking-wider"
                            >
                              Move to Bag
                            </Button>
                            <button
                              onClick={() => removeLine(line.id)}
                              className="text-muted-foreground hover:text-destructive p-1"
                              aria-label="Remove saved piece"
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

            {/* Right: Order Summary */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className="border border-border p-6 bg-background rounded-sm space-y-6 shadow-soft">
                <h2 className="font-display text-xl font-normal text-foreground">Order Summary</h2>

                {/* Promo Code Form */}
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Promotional Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="e.g. MAKERMAN10"
                      className="flex-1 h-10 border border-border px-3 text-xs uppercase rounded-sm outline-none focus:border-foreground"
                    />
                    <Button type="submit" variant="secondary" className="h-10 text-xs font-semibold uppercase tracking-wider">
                      Apply
                    </Button>
                  </div>
                  {appliedCode && (
                    <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1.5 border border-emerald-200 rounded-sm">
                      <span>{appliedCode}</span>
                      <button type="button" onClick={handleRemovePromo} className="text-muted-foreground hover:text-foreground">✕</button>
                    </div>
                  )}
                </form>

                {/* Totals Breakdown */}
                <div className="space-y-3 text-xs divide-y divide-border border-y border-border py-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bag Subtotal</span>
                    <span className="font-semibold text-foreground">{formatINR(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between pt-3 text-emerald-700">
                      <span>Promotional Discount</span>
                      <span className="font-semibold">-{formatINR(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3">
                    <span className="text-muted-foreground">Estimated Shipping</span>
                    <span className="font-semibold text-foreground">
                      {shipping === 0 ? "Complimentary" : formatINR(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3">
                    <span className="text-muted-foreground">GST (5% Inclusive)</span>
                    <span className="font-semibold text-foreground">{formatINR(tax)}</span>
                  </div>
                  <div className="flex justify-between pt-3 text-sm font-medium">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-display text-lg font-semibold text-foreground">{formatINR(total)}</span>
                  </div>
                </div>

                <Button
                  asChild
                  className="w-full h-13 text-xs font-semibold uppercase tracking-[0.14em] bg-ink text-ink-foreground hover:bg-ink/90 rounded-sm shadow-md"
                >
                  <Link to="/checkout" className="flex items-center justify-center gap-2">
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>256-Bit SSL Encrypted Indian Checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Checkout Bottom Bar */}
      {activeLines.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-border p-3.5 z-30 lg:hidden shadow-lift flex items-center justify-between gap-4">
          <div>
            <p className="text-[0.6875rem] text-muted-foreground uppercase tracking-wider">Total Amount</p>
            <p className="font-display text-lg font-semibold text-foreground">{formatINR(total)}</p>
          </div>
          <Button
            asChild
            className="flex-1 h-12 text-xs font-semibold uppercase tracking-wider bg-ink text-ink-foreground rounded-sm"
          >
            <Link to="/checkout" className="flex items-center justify-center gap-2">
              <span>Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
