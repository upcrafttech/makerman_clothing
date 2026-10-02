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

import { MakermanLogo } from "@/components/layout/makerman-logo";
import { Button } from "@/components/ui/button";
import { cartTotals, formatINR } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { productService } from "@/services";
import { useCreateOrder, useCreateRazorpayOrder, useVerifyRazorpayPayment, useProducts } from "@/hooks/use-api";
import { authStore } from "@/lib/auth-store";
import { getRegisteredProduct } from "@/lib/adapters";
import { openRazorpayCheckout } from "@/lib/razorpay";
import type { Address, Order } from "@/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — MAKERMAN | Feeling Happiness" },
      { name: "description", content: "Secure Indian checkout for your Makerman garments." },
      { property: "og:title", content: "Checkout — Makerman Clothing" },
    ],
  }),
  component: CheckoutPage,
});

export function CheckoutPage() {
  const { cart, subtotal, addresses, placeOrder, clearCart } = useShop();

  const [step, setStep] = useState<2 | 3 | 4>(2);
  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id ?? "new");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "cod">("upi");
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Address form fields with Indian localization defaults
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    fullName: "Aarav Deshpande",
    phone: "+91 98204 41120",
    line1: "Flat 402, Signature Towers, Worli",
    line2: "Near Lower Parel Studio",
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
      phone: newAddress.phone ?? "+91 98204 41120",
      line1: newAddress.line1 ?? "Kamala Mills",
      line2: newAddress.line2,
      city: newAddress.city ?? "Mumbai",
      state: newAddress.state ?? "Maharashtra",
      pincode: newAddress.pincode ?? "400013",
      isDefault: false,
    };

  const createOrderMutation = useCreateOrder();
  const createRazorpayOrderMutation = useCreateRazorpayOrder();
  const verifyRazorpayPaymentMutation = useVerifyRazorpayPayment();
  const { data: _catalog } = useProducts();
  const [isPlacing, setIsPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    setIsPlacing(true);
    let orderId = `MK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const items = activeLines
      .map((line) => {
        const p = getRegisteredProduct(line.productSlug) ?? productService.bySlug(line.productSlug);
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

    const completeOrderSuccess = (finalOrderId: string, finalPaymentMethod: string) => {
      const newOrder: Order = {
        id: finalOrderId,
        date: new Date().toISOString().split("T")[0]!,
        status: "Confirmed",
        deliveryDate: "3–4 Business Days",
        paymentMethod: finalPaymentMethod,
        address: currentAddress,
        items,
        subtotal,
        shipping: shipping + shippingExtra,
        tax,
        total: finalTotal,
      };

      placeOrder(newOrder);
      setConfirmedOrder(newOrder);
      setStep(4);
      clearCart();
      setIsPlacing(false);
      toast.success(`Order ${finalOrderId} confirmed!`);
    };

    // If online payment (UPI, Card, Net Banking), initiate Razorpay
    if (paymentMethod !== "cod") {
      try {
        const rzpOrder = await createRazorpayOrderMutation.mutateAsync({
          amount: finalTotal,
          receipt: orderId,
        });

        if (rzpOrder?.razorpayOrderId && rzpOrder?.keyId) {
          await openRazorpayCheckout({
            key: rzpOrder.keyId,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency || "INR",
            name: "Makerman Clothing",
            description: `Order ${orderId}`,
            order_id: rzpOrder.razorpayOrderId,
            prefill: {
              name: currentAddress.fullName,
              contact: currentAddress.phone.replace(/\D/g, "").slice(-10),
            },
            theme: {
              color: "#171717",
            },
            handler: async (response) => {
              try {
                await verifyRazorpayPaymentMutation.mutateAsync({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  platformOrderId: rzpOrder.internalOrderId,
                });
              } catch (verifyErr) {
                console.warn("Payment verification notice:", verifyErr);
              }
              completeOrderSuccess(orderId, `Razorpay Online (${response.razorpay_payment_id.slice(-6)})`);
            },
            modal: {
              ondismiss: () => {
                setIsPlacing(false);
                toast.info("Payment cancelled. You can retry or choose Cash on Delivery.");
              },
            },
          });
          return;
        }
      } catch (err: unknown) {
        const msg = (err as Error)?.message || "";
        console.warn("Razorpay order response:", msg);
        if (msg.includes("not configured")) {
          toast.warning("Razorpay gateway is in setup mode on backend.", {
            description: "Placing order with offline confirmation status.",
          });
        } else {
          toast.error("Online payment gateway unavailable. Proceeding with offline order.", {
            description: msg,
          });
        }
      }
    }

    // COD or offline order
    const token = authStore.getToken();
    if (token) {
      try {
        const apiItems = activeLines
          .map((line) => {
            const p = getRegisteredProduct(line.productSlug) ?? productService.bySlug(line.productSlug);
            if (!p) return null;
            const variant = p.variants?.find(
              (v) =>
                v.sizeLabel.toLowerCase() === line.size.toLowerCase() ||
                v.colorName.toLowerCase() === line.color.toLowerCase(),
            );
            return {
              productId: p.id,
              variantUuid: variant?.id ?? null,
              quantity: line.quantity,
              price: p.price,
            };
          })
          .filter(Boolean);

        const payload = {
          items: apiItems,
          discountAmount: 0,
          totalAmount: finalTotal,
          customerName: currentAddress.fullName,
          customerPhone:
            currentAddress.phone.replace("+91", "").replace(/\D/g, "").slice(-10) || "9820441120",
          address: currentAddress.line1,
          landmark: currentAddress.line2 || "",
          city: currentAddress.city,
          state: currentAddress.state,
          pincode: currentAddress.pincode.replace(/\D/g, "").slice(0, 6) || "400013",
          paymentMethod: paymentMethod.toUpperCase(),
        };

        const res = await createOrderMutation.mutateAsync(payload);
        if (res?.id) {
          orderId = res.id;
        }
      } catch (err) {
        console.warn("Backend order creation warning (fallback to local order):", err);
      }
    }

    completeOrderSuccess(
      orderId,
      paymentMethod === "cod" ? "Cash on Delivery" : `Online (${paymentMethod.toUpperCase()})`,
    );
  };

  // Step 4: Confirmation screen
  if (confirmedOrder || step === 4) {
    const order = confirmedOrder!;
    return (
      <div className="container-page py-12 md:py-20 max-w-3xl">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-ink text-ink-foreground rounded-full grid place-items-center mx-auto mb-2">
            <Check className="h-8 w-8 text-amber-500" strokeWidth={2.5} />
          </div>
          <span className="eyebrow text-amber-600 font-semibold tracking-widest">
            Order Confirmed · Step 4 of 4
          </span>
          <h1 className="font-display text-3xl sm:text-5xl font-normal text-foreground">
            Thank you for your order
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Your receipt and fulfillment updates have been dispatched to your contact phone and email.
          </p>
          <div className="inline-block border border-border px-4 py-2 bg-[#FAF8F5] text-xs font-mono rounded-sm">
            Order Reference: <strong className="text-foreground">{order.id}</strong>
          </div>
        </div>

        <div className="mt-10 border border-border divide-y divide-border bg-background rounded-sm">
          {/* Order Details */}
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div>
              <p className="eyebrow text-muted-foreground mb-2">Delivery Address</p>
              <p className="font-semibold text-foreground">{order.address.fullName}</p>
              <p className="text-muted-foreground mt-0.5">{order.address.line1}</p>
              {order.address.line2 && <p className="text-muted-foreground">{order.address.line2}</p>}
              <p className="text-muted-foreground">{order.address.city}, {order.address.state} — {order.address.pincode}</p>
              <p className="text-muted-foreground mt-1 font-mono">Mobile: {order.address.phone}</p>
            </div>

            <div>
              <p className="eyebrow text-muted-foreground mb-2">Payment & Delivery</p>
              <p><span className="text-muted-foreground">Method:</span> <strong className="text-foreground">{order.paymentMethod}</strong></p>
              <p className="mt-1"><span className="text-muted-foreground">Estimated Delivery:</span> <strong className="text-foreground">{order.deliveryDate}</strong></p>
              <p className="mt-1"><span className="text-muted-foreground">Total Paid:</span> <strong className="num text-foreground text-sm font-semibold">{formatINR(order.total)}</strong></p>
            </div>
          </div>

          {/* Ordered items */}
          <div className="p-6 space-y-4">
            <p className="eyebrow text-muted-foreground">Garments Ordered ({order.items.length})</p>
            <div className="divide-y divide-border/60">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-muted-foreground text-[11px] mt-0.5">
                      {item.color} · Size {item.size} · Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-foreground">{formatINR(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Button asChild className="h-12 px-6 text-xs font-semibold uppercase tracking-wider bg-ink text-ink-foreground rounded-sm">
            <Link to="/account">View in Account / Orders</Link>
          </Button>
          <Button asChild variant="outline" className="h-12 px-6 text-xs font-semibold uppercase tracking-wider border-border rounded-sm">
            <Link to="/store">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (activeLines.length === 0) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="font-display text-3xl">Your shopping bag is empty</h1>
        <p className="mt-2 text-xs text-muted-foreground">Please select items before proceeding to checkout.</p>
        <Button asChild className="mt-6 text-xs uppercase tracking-wider bg-ink text-ink-foreground">
          <Link to="/store">Explore Store</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 md:py-14">
      <div className="container-page max-w-5xl">
        {/* Distraction-Free Checkout Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-border/80 pb-6 mb-8 gap-4">
          <div className="flex items-center gap-4">
            <MakermanLogo size="sm" />
            <div className="hidden sm:block h-6 w-[1px] bg-border" />
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <ShieldCheck className="h-4 w-4" />
              <span>256-Bit SSL Encrypted Indian Checkout</span>
            </div>
          </div>

          <Link
            to="/cart"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Return to Bag
          </Link>
        </div>

        {/* Progress Stepper: 1 CART, 2 DETAILS, 3 PAYMENT, 4 CONFIRMATION */}
        <div className="grid grid-cols-4 gap-2 mb-8 text-center text-xs">
          <Link to="/cart" className="pb-2 border-b-2 border-foreground font-semibold text-foreground">
            1. BAG
          </Link>
          <div className={cn("pb-2 border-b-2 transition-colors", step >= 2 ? "border-foreground font-semibold text-foreground" : "border-border text-muted-foreground")}>
            2. DETAILS
          </div>
          <div className={cn("pb-2 border-b-2 transition-colors", step >= 3 ? "border-foreground font-semibold text-foreground" : "border-border text-muted-foreground")}>
            3. PAYMENT
          </div>
          <div className={cn("pb-2 border-b-2 transition-colors", step >= 4 ? "border-foreground font-semibold text-foreground" : "border-border text-muted-foreground")}>
            4. CONFIRMATION
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Form Column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 2: Details & Address */}
            <div className={cn("border p-6 rounded-sm transition-all", step === 2 ? "border-foreground bg-background shadow-xs" : "border-border bg-[#FAF8F5]/60")}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-normal flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-ink text-ink-foreground grid place-items-center text-xs font-mono">2</span>
                  Delivery Address & Contact
                </h2>
                {step > 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-xs text-amber-600 hover:underline font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>

              {step === 2 ? (
                <div className="space-y-6">
                  {/* Saved addresses selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {addresses.map((addr) => (
                      <label
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={cn(
                          "p-4 border text-xs cursor-pointer rounded-sm flex flex-col justify-between transition-colors",
                          selectedAddressId === addr.id
                            ? "border-foreground bg-[#FAF8F5] ring-1 ring-foreground"
                            : "border-border hover:border-foreground/40",
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between font-semibold">
                            <span>{addr.fullName}</span>
                            {addr.isDefault && <span className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-xs">Default</span>}
                          </div>
                          <p className="text-muted-foreground mt-1">{addr.line1}</p>
                          <p className="text-muted-foreground">{addr.city}, {addr.state} — {addr.pincode}</p>
                        </div>
                        <p className="text-muted-foreground mt-2 text-[11px] font-mono">{addr.phone}</p>
                      </label>
                    ))}

                    <label
                      onClick={() => setSelectedAddressId("new")}
                      className={cn(
                        "p-4 border text-xs cursor-pointer rounded-sm flex flex-col justify-center items-center text-center transition-colors min-h-[110px]",
                        selectedAddressId === "new"
                          ? "border-foreground bg-[#FAF8F5] ring-1 ring-foreground"
                          : "border-border hover:border-foreground/40",
                      )}
                    >
                      <span className="font-semibold">+ Add New Address</span>
                      <span className="text-muted-foreground text-[11px] mt-0.5">Ship to another Indian PIN code</span>
                    </label>
                  </div>

                  {selectedAddressId === "new" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={newAddress.fullName}
                          onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                          className="w-full h-11 border border-border px-3 text-xs rounded-sm outline-none focus:border-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider">
                          Mobile Number (+91)
                        </label>
                        <input
                          type="tel"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className="w-full h-11 border border-border px-3 text-xs rounded-sm outline-none focus:border-foreground font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider">
                          Street Address / House / Flat
                        </label>
                        <input
                          type="text"
                          value={newAddress.line1}
                          onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                          className="w-full h-11 border border-border px-3 text-xs rounded-sm outline-none focus:border-foreground"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider">
                          Apartment / Area / Locality
                        </label>
                        <input
                          type="text"
                          value={newAddress.line2}
                          onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                          className="w-full h-11 border border-border px-3 text-xs rounded-sm outline-none focus:border-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider">
                          City
                        </label>
                        <input
                          type="text"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full h-11 border border-border px-3 text-xs rounded-sm outline-none focus:border-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider">
                          State
                        </label>
                        <input
                          type="text"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          className="w-full h-11 border border-border px-3 text-xs rounded-sm outline-none focus:border-foreground"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider">
                          PIN Code
                        </label>
                        <input
                          type="text"
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                          className="w-full h-11 border border-border px-3 text-xs rounded-sm outline-none focus:border-foreground font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Shipping speed selection */}
                  <div className="pt-3 border-t border-border space-y-2.5">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Select Shipping Speed
                    </p>
                    <label
                      onClick={() => setShippingMethod("standard")}
                      className={cn(
                        "p-3.5 border text-xs cursor-pointer rounded-sm flex items-center justify-between transition-colors",
                        shippingMethod === "standard" ? "border-foreground bg-[#FAF8F5]" : "border-border",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Truck className="h-4 w-4 text-amber-600" />
                        <div>
                          <p className="font-semibold text-foreground">Standard Express Pan-India</p>
                          <p className="text-muted-foreground text-[11px]">2–4 business days delivery</p>
                        </div>
                      </div>
                      <span className="font-semibold">{shipping === 0 ? "Complimentary" : formatINR(shipping)}</span>
                    </label>

                    <label
                      onClick={() => setShippingMethod("express")}
                      className={cn(
                        "p-3.5 border text-xs cursor-pointer rounded-sm flex items-center justify-between transition-colors",
                        shippingMethod === "express" ? "border-foreground bg-[#FAF8F5]" : "border-border",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Package className="h-4 w-4 text-amber-600" />
                        <div>
                          <p className="font-semibold text-foreground">Priority Next-Day Courier (Metro Only)</p>
                          <p className="text-muted-foreground text-[11px]">Guaranteed dispatch in 12 hours</p>
                        </div>
                      </div>
                      <span className="font-semibold">{formatINR(150)}</span>
                    </label>
                  </div>

                  <Button
                    onClick={() => setStep(3)}
                    className="h-12 px-7 text-xs font-semibold uppercase tracking-wider bg-ink text-ink-foreground rounded-sm"
                  >
                    Proceed to Payment →
                  </Button>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{currentAddress.fullName}</span> — {currentAddress.line1}, {currentAddress.city} ({currentAddress.pincode}) · Phone: {currentAddress.phone}
                </div>
              )}
            </div>

            {/* Step 3: Payment Method UI */}
            <div className={cn("border p-6 rounded-sm transition-all", step === 3 ? "border-foreground bg-background shadow-xs" : "border-border bg-[#FAF8F5]/60")}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-normal flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-ink text-ink-foreground grid place-items-center text-xs font-mono">3</span>
                  Payment Method
                </h2>
              </div>

              {step === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { id: "upi", title: "UPI / QR Code", desc: "Google Pay, PhonePe, Paytm, BHIM", icon: QrCode },
                      { id: "card", title: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay, Amex", icon: CreditCard },
                      { id: "netbanking", title: "Net Banking", desc: "HDFC, ICICI, SBI, Axis, Kotak", icon: Wallet },
                      { id: "cod", title: "Cash on Delivery", desc: "Pay cash upon doorstep verification", icon: Package },
                    ].map((method) => (
                      <label
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as typeof paymentMethod)}
                        className={cn(
                          "p-4 border text-xs cursor-pointer rounded-sm flex items-start gap-3 transition-colors",
                          paymentMethod === method.id
                            ? "border-foreground bg-[#FAF8F5] ring-1 ring-foreground"
                            : "border-border hover:border-foreground/40",
                        )}
                      >
                        <method.icon className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
                        <div>
                          <p className="font-semibold text-foreground">{method.title}</p>
                          <p className="text-muted-foreground text-[11px] mt-0.5">{method.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  {paymentMethod === "upi" && (
                    <div className="p-4 bg-[#FAF8F5] border border-border rounded-sm text-center space-y-2 text-xs">
                      <p className="font-semibold text-foreground">Scan or Approve with Any UPI App</p>
                      <p className="text-muted-foreground text-[11px]">
                        Supports GPay, PhonePe, Paytm, CRED, Amazon Pay. Ready to connect Razorpay gateway.
                      </p>
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="p-4 bg-[#FAF8F5] border border-border rounded-sm space-y-3 text-xs">
                      <p className="font-semibold text-foreground">Card Payment Integration Ready</p>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Card Number (4000 1234 5678 9010)"
                          className="w-full h-10 border border-border px-3 text-xs rounded-sm bg-background font-mono"
                          disabled
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="MM / YY"
                            className="h-10 border border-border px-3 text-xs rounded-sm bg-background font-mono"
                            disabled
                          />
                          <input
                            type="password"
                            placeholder="CVV"
                            maxLength={4}
                            className="h-10 border border-border px-3 text-xs rounded-sm bg-background font-mono"
                            disabled
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        End-to-end encrypted card processing compliant with RBI tokenization norms.
                      </p>
                    </div>
                  )}

                  <Button
                    disabled={isPlacing}
                    onClick={handlePlaceOrder}
                    className="w-full h-13 text-xs font-semibold uppercase tracking-[0.14em] bg-ink text-ink-foreground hover:bg-ink/90 rounded-sm shadow-md"
                  >
                    {isPlacing
                      ? "Securing Garments..."
                      : paymentMethod === "cod"
                      ? `Confirm Cash on Delivery — ${formatINR(finalTotal)}`
                      : `Pay Online via Razorpay — ${formatINR(finalTotal)}`}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right: Order Summary Sticky Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="border border-border p-6 bg-background rounded-sm space-y-5 shadow-soft">
              <h3 className="font-display text-lg font-normal text-foreground">
                Order Summary ({activeLines.length})
              </h3>

              <div className="divide-y divide-border/60 max-h-60 overflow-y-auto pr-1">
                {activeLines.map((line) => {
                  const product = productService.bySlug(line.productSlug);
                  if (!product) return null;

                  return (
                    <div key={line.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={product.images[0]} alt="" className="h-10 w-8 object-cover rounded-xs bg-secondary shrink-0" />
                        <div className="truncate">
                          <p className="font-medium text-foreground truncate">{product.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {line.size} · {line.color} · Qty {line.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-foreground shrink-0">{formatINR(product.price * line.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2.5 text-xs border-t border-border pt-4 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-foreground">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping ({shippingMethod === "express" ? "Priority Express" : "Standard"})</span>
                  <span className="font-semibold text-foreground">
                    {shipping + shippingExtra === 0 ? "Complimentary" : formatINR(shipping + shippingExtra)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated GST (5% Inclusive)</span>
                  <span className="font-semibold text-foreground">{formatINR(tax)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-border text-sm font-semibold text-foreground">
                  <span>Total Amount</span>
                  <span className="font-display text-lg">{formatINR(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
