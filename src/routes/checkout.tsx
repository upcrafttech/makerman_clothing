import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CreditCard,
  Lock,
  Package,
  QrCode,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cartTotals, formatINR } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { productService } from "@/services";
import type { Address, Order } from "@/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — AVELOR" },
      { name: "description", content: "Secure checkout for your AVELOR order." },
    ],
  }),
  component: CheckoutPage,
});

export function CheckoutPage() {
  const { cart, subtotal, addresses, placeOrder, clearCart } = useShop();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id ?? "new");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "cod">("upi");
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Address form fields
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    fullName: "Aarav Sharma",
    phone: "+91 98204 11200",
    line1: "Flat 402, Signature Towers, Worli",
    line2: "Near High Street Phoenix",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400018",
  });

  const activeLines = cart.filter((l) => !l.savedForLater);
  const shippingExtra = shippingMethod === "express" ? 150 : 0;
  const { shipping, tax, total } = cartTotals(subtotal, 0);
  const finalTotal = total + shippingExtra;

  const currentAddress: Address =
    addresses.find((a) => a.id === selectedAddressId) ?? {
      id: "addr-custom",
      fullName: newAddress.fullName ?? "Guest Customer",
      phone: newAddress.phone ?? "+91 98204 00000",
      line1: newAddress.line1 ?? "Studio Address",
      line2: newAddress.line2,
      city: newAddress.city ?? "Mumbai",
      state: newAddress.state ?? "Maharashtra",
      pincode: newAddress.pincode ?? "400001",
      isDefault: false,
    };

  const handlePlaceOrder = () => {
    const orderId = `AV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const items = activeLines
      .map((line) => {
        const p = productService.bySlug(line.productSlug);
        if (!p) return null;
        return {
          productSlug: p.slug,
          name: p.name,
          size: line.size,
          color: line.color,
          quantity: line.quantity,
          price: p.price,
        };
      })
      .filter(Boolean) as Order["items"];

    const newOrder: Order = {
      id: orderId,
      date: new Date().toISOString().split("T")[0]!,
      status: "Confirmed",
      deliveryDate: "3–4 Business Days",
      paymentMethod:
        paymentMethod === "upi"
          ? "UPI Instant QR"
          : paymentMethod === "card"
          ? "Credit/Debit Card"
          : paymentMethod === "cod"
          ? "Cash on Delivery"
          : "Netbanking",
      address: currentAddress,
      items,
      subtotal,
      shipping: shipping + shippingExtra,
      tax,
      total: finalTotal,
    };

    placeOrder(newOrder);
    setConfirmedOrder(newOrder);
    clearCart();
    toast.success(`Order ${orderId} confirmed successfully.`);
  };

  // If order was confirmed, show Order Confirmation Screen
  if (confirmedOrder) {
    return (
      <div className="container-page py-12 md:py-20 max-w-3xl">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-ink text-ink-foreground rounded-full grid place-items-center mx-auto mb-2">
            <Check className="h-8 w-8" />
          </div>
          <span className="eyebrow text-accent">Order Confirmed</span>
          <h1 className="font-display text-4xl sm:text-5xl">Thank you for your order</h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Your receipt and fulfillment updates have been dispatched to your email.
          </p>
          <div className="inline-block border border-border px-4 py-2 bg-secondary/50 text-xs font-mono">
            Order Reference: <strong className="text-foreground">{confirmedOrder.id}</strong>
          </div>
        </div>

        <div className="mt-12 border border-border divide-y divide-border bg-background">
          {/* Order Details */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <p className="eyebrow text-subtle mb-2">Shipping To</p>
              <p className="font-medium text-foreground">{confirmedOrder.address.fullName}</p>
              <p className="text-muted-foreground mt-0.5">{confirmedOrder.address.line1}</p>
              {confirmedOrder.address.line2 && <p className="text-muted-foreground">{confirmedOrder.address.line2}</p>}
              <p className="text-muted-foreground">{confirmedOrder.address.city}, {confirmedOrder.address.state} — {confirmedOrder.address.pincode}</p>
              <p className="text-muted-foreground mt-1">Phone: {confirmedOrder.address.phone}</p>
            </div>

            <div>
              <p className="eyebrow text-subtle mb-2">Payment & Delivery</p>
              <p><span className="text-muted-foreground">Method:</span> <strong className="text-foreground">{confirmedOrder.paymentMethod}</strong></p>
              <p className="mt-1"><span className="text-muted-foreground">Estimated Delivery:</span> <strong className="text-foreground">{confirmedOrder.deliveryDate}</strong></p>
              <p className="mt-1"><span className="text-muted-foreground">Total Paid:</span> <strong className="num text-foreground text-sm">{formatINR(confirmedOrder.total)}</strong></p>
            </div>
          </div>

          {/* Ordered items */}
          <div className="p-6 space-y-4">
            <p className="eyebrow text-subtle">Pieces Ordered ({confirmedOrder.items.length})</p>
            <div className="divide-y divide-border">
              {confirmedOrder.items.map((item, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      {item.color} · Size {item.size} · Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="num font-medium">{formatINR(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Button asChild className="h-12 text-xs uppercase tracking-wider">
            <Link to="/account">View in Account / Track Order</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 text-xs uppercase tracking-wider">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (activeLines.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-3xl">Your shopping bag is empty</h1>
        <p className="mt-2 text-xs text-muted-foreground">Please add items to your bag before proceeding to checkout.</p>
        <Button asChild className="mt-6 text-xs uppercase tracking-wider">
          <Link to="/shop">Explore Collection</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-16">
      {/* Step Indicator Header */}
      <div className="flex items-center justify-between border-b border-border pb-6 mb-8">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Checkout</h1>
          <div className="flex items-center gap-3 mt-2 text-xs">
            <span className={cn("font-medium", step >= 1 ? "text-foreground" : "text-muted-foreground")}>
              1. Address
            </span>
            <span className="text-muted-foreground">→</span>
            <span className={cn("font-medium", step >= 2 ? "text-foreground" : "text-muted-foreground")}>
              2. Delivery
            </span>
            <span className="text-muted-foreground">→</span>
            <span className={cn("font-medium", step >= 3 ? "text-foreground" : "text-muted-foreground")}>
              3. Payment
            </span>
          </div>
        </div>

        <Link to="/cart" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Return to Bag
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Main Flow Steps */}
        <div className="lg:col-span-8 space-y-8">
          {/* Step 1: Address */}
          <div className={cn("border p-6 transition-all", step === 1 ? "border-ink bg-background" : "border-border bg-secondary/20")}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-ink text-ink-foreground grid place-items-center text-xs font-mono">1</span>
                Shipping Address
              </h2>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-accent hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {step === 1 ? (
              <div className="space-y-6">
                {/* Saved addresses selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={cn(
                        "p-4 border text-xs cursor-pointer flex flex-col justify-between transition-colors",
                        selectedAddressId === addr.id ? "border-ink bg-secondary/40 ring-1 ring-ink" : "border-border hover:border-foreground/40"
                      )}
                    >
                      <div>
                        <div className="flex items-center justify-between font-medium">
                          <span>{addr.fullName}</span>
                          {addr.isDefault && <span className="text-[10px] bg-secondary px-1.5 py-0.5">Default</span>}
                        </div>
                        <p className="text-muted-foreground mt-1">{addr.line1}</p>
                        <p className="text-muted-foreground">{addr.city}, {addr.state} — {addr.pincode}</p>
                      </div>
                      <p className="text-muted-foreground mt-2 text-[11px]">{addr.phone}</p>
                    </label>
                  ))}

                  <label
                    onClick={() => setSelectedAddressId("new")}
                    className={cn(
                      "p-4 border text-xs cursor-pointer flex flex-col justify-center items-center text-center transition-colors min-h-[120px]",
                      selectedAddressId === "new" ? "border-ink bg-secondary/40 ring-1 ring-ink" : "border-border hover:border-foreground/40"
                    )}
                  >
                    <span className="font-medium">+ Add New Address</span>
                    <span className="text-muted-foreground text-[11px] mt-1">Deliver to another location</span>
                  </label>
                </div>

                {selectedAddressId === "new" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        className="w-full h-10 border border-border px-3 text-xs outline-none focus:border-ink"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="w-full h-10 border border-border px-3 text-xs outline-none focus:border-ink"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">Street Address</label>
                      <input
                        type="text"
                        value={newAddress.line1}
                        onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                        className="w-full h-10 border border-border px-3 text-xs outline-none focus:border-ink"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">City</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full h-10 border border-border px-3 text-xs outline-none focus:border-ink"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">PIN Code</label>
                      <input
                        type="text"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        className="w-full h-10 border border-border px-3 text-xs outline-none focus:border-ink"
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => setStep(2)}
                  className="h-11 px-6 text-xs uppercase tracking-wider"
                >
                  Continue to Delivery →
                </Button>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{currentAddress.fullName}</span> — {currentAddress.line1}, {currentAddress.city} ({currentAddress.pincode})
              </div>
            )}
          </div>

          {/* Step 2: Delivery Method */}
          <div className={cn("border p-6 transition-all", step === 2 ? "border-ink bg-background" : "border-border bg-secondary/20")}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-ink text-ink-foreground grid place-items-center text-xs font-mono">2</span>
                Delivery Method
              </h2>
              {step > 2 && (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-accent hover:underline"
                >
                  Edit
                </button>
              )}
            </div>

            {step === 2 ? (
              <div className="space-y-4">
                <label
                  onClick={() => setShippingMethod("standard")}
                  className={cn(
                    "p-4 border text-xs cursor-pointer flex items-center justify-between transition-colors",
                    shippingMethod === "standard" ? "border-ink bg-secondary/40 ring-1 ring-ink" : "border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-accent" strokeWidth={1.4} />
                    <div>
                      <p className="font-medium text-foreground">Standard Express Courier</p>
                      <p className="text-muted-foreground text-[11px]">Estimated 2–4 business days delivery</p>
                    </div>
                  </div>
                  <span className="num font-medium">{shipping === 0 ? "Free" : formatINR(shipping)}</span>
                </label>

                <label
                  onClick={() => setShippingMethod("express")}
                  className={cn(
                    "p-4 border text-xs cursor-pointer flex items-center justify-between transition-colors",
                    shippingMethod === "express" ? "border-ink bg-secondary/40 ring-1 ring-ink" : "border-border"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-accent" strokeWidth={1.4} />
                    <div>
                      <p className="font-medium text-foreground">Priority Next-Day Courier (Metro Only)</p>
                      <p className="text-muted-foreground text-[11px]">Guaranteed dispatch within 12 hours</p>
                    </div>
                  </div>
                  <span className="num font-medium">{formatINR(150)}</span>
                </label>

                <Button
                  onClick={() => setStep(3)}
                  className="h-11 px-6 text-xs uppercase tracking-wider"
                >
                  Continue to Payment →
                </Button>
              </div>
            ) : step > 2 ? (
              <div className="text-xs text-muted-foreground">
                {shippingMethod === "standard" ? "Standard Express (2–4 Days)" : "Priority Next-Day Dispatch"}
              </div>
            ) : null}
          </div>

          {/* Step 3: Payment Simulation */}
          <div className={cn("border p-6 transition-all", step === 3 ? "border-ink bg-background" : "border-border bg-secondary/20")}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg flex items-center gap-2">
                <span className="h-6 w-6 rounded-full bg-ink text-ink-foreground grid place-items-center text-xs font-mono">3</span>
                Payment Method
              </h2>
            </div>

            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "upi", title: "UPI / QR Code", desc: "Google Pay, PhonePe, Paytm", icon: QrCode },
                    { id: "card", title: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay, Amex", icon: CreditCard },
                    { id: "netbanking", title: "Net Banking", desc: "HDFC, ICICI, SBI, Axis, etc.", icon: Wallet },
                    { id: "cod", title: "Cash on Delivery", desc: "Pay on doorstep inspection", icon: Package },
                  ].map((method) => (
                    <label
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as typeof paymentMethod)}
                      className={cn(
                        "p-4 border text-xs cursor-pointer flex items-start gap-3 transition-colors",
                        paymentMethod === method.id ? "border-ink bg-secondary/40 ring-1 ring-ink" : "border-border hover:border-foreground/40"
                      )}
                    >
                      <method.icon className="h-5 w-5 text-accent shrink-0 mt-0.5" strokeWidth={1.4} />
                      <div>
                        <p className="font-medium text-foreground">{method.title}</p>
                        <p className="text-muted-foreground text-[11px] mt-0.5">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {paymentMethod === "upi" && (
                  <div className="p-4 bg-secondary/40 border border-border text-center space-y-2 text-xs">
                    <p className="font-medium">Scan to Pay with Any UPI App</p>
                    <div className="h-32 w-32 bg-white border border-border p-2 mx-auto grid place-items-center shadow-xs">
                      <QrCode className="h-24 w-24 text-ink" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Demo QR simulation. Click "Place Order" to finalize.</p>
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="space-y-3 p-4 bg-secondary/30 border border-border text-xs">
                    <div>
                      <label className="text-[11px] font-medium text-muted-foreground block mb-1">Card Number</label>
                      <input
                        type="text"
                        defaultValue="4111 2222 3333 4444"
                        className="w-full h-10 border border-border px-3 text-xs font-mono outline-none focus:border-ink"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground block mb-1">Expiry MM/YY</label>
                        <input
                          type="text"
                          defaultValue="08/29"
                          className="w-full h-10 border border-border px-3 text-xs font-mono outline-none focus:border-ink"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-muted-foreground block mb-1">CVV</label>
                        <input
                          type="password"
                          defaultValue="891"
                          className="w-full h-10 border border-border px-3 text-xs font-mono outline-none focus:border-ink"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    onClick={handlePlaceOrder}
                    className="w-full h-13 text-xs uppercase tracking-[0.14em] font-medium flex items-center justify-center gap-2"
                  >
                    <Lock className="h-4 w-4" /> Place Order — {formatINR(finalTotal)}
                  </Button>
                  <p className="text-[11px] text-center text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-accent" /> 256-bit encrypted checkout. No actual charges are made.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary sidebar */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
          <div className="border border-border p-6 bg-background space-y-4">
            <h3 className="font-display text-lg">In Your Bag ({activeLines.length})</h3>

            <div className="divide-y divide-border/60 max-h-72 overflow-y-auto pr-1">
              {activeLines.map((line) => {
                const product = productService.bySlug(line.productSlug);
                if (!product) return null;
                return (
                  <div key={line.id} className="py-3 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={product.images[0]} alt="" className="h-12 w-9 shrink-0 object-cover bg-secondary" />
                      <div className="truncate">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-[11px] text-muted-foreground">{line.color} · {line.size} · Qty {line.quantity}</p>
                      </div>
                    </div>
                    <span className="num font-medium shrink-0">{formatINR(product.price * line.quantity)}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border pt-4 space-y-2 text-xs divide-y divide-border/60">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="num font-medium text-foreground">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between pt-2 text-muted-foreground">
                <span>Delivery</span>
                <span className="num font-medium text-foreground">
                  {shipping + shippingExtra === 0 ? "Free" : formatINR(shipping + shippingExtra)}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-muted-foreground">
                <span>GST (5%)</span>
                <span className="num font-medium text-foreground">{formatINR(tax)}</span>
              </div>
              <div className="flex justify-between pt-3 text-sm font-semibold text-foreground">
                <span>Total</span>
                <span className="num text-base font-bold">{formatINR(finalTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
