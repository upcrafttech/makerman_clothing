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
  Clock,
  Zap,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { MakermanLogo } from "@/components/layout/makerman-logo";
import { Button } from "@/components/ui/button";
import { cartTotals, formatINR, formatOrderId } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { productService } from "@/services";
import {
  useCreateOrder,
  useCreateRazorpayOrder,
  useVerifyRazorpayPayment,
  useAbandonOrderPayment,
  useProducts,
  useCustomerAddresses,
  useCreateCustomerAddress,
  usePaymentConfig,
  useDeliveryConfig,
} from "@/hooks/use-api";
import { StorefrontLocationSelector } from "@/components/common/storefront-location-selector";
import { authStore } from "@/lib/auth-store";
import { getRegisteredProduct } from "@/lib/adapters";
import { getVariantStock, getStockByVariantId } from "@/lib/product-stock";
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
  const { cart, subtotal, addresses, placeOrder, clearCart, saveAddress } = useShop();
  const { data: apiAddresses } = useCustomerAddresses();
  const createAddressMutation = useCreateCustomerAddress();

  const availableAddresses = (apiAddresses && apiAddresses.length > 0 ? apiAddresses : addresses).filter(
    (a) => a.id !== "addr-1" && a.id !== "addr-2" && a.fullName !== "Aarav Deshpande",
  );

  const [step, setStep] = useState<2 | 3 | 4>(2);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [saveAddressToAccount, setSaveAddressToAccount] = useState(true);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const { data: paymentConfig, isLoading: paymentConfigLoading } = usePaymentConfig();
  const onlinePaymentEnabled = paymentConfig?.onlinePaymentEnabled ?? true;

  useEffect(() => {
    if (availableAddresses.length > 0 && selectedAddressId === "new") {
      const def = availableAddresses.find((a) => a.isDefault) ?? availableAddresses[0];
      if (def) setSelectedAddressId(def.id);
    }
  }, [availableAddresses]);

  // Address form fields with Indian localization defaults
  const [newAddress, setNewAddress] = useState<Partial<Address> & { country?: string }>({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
  });

  // Pre-fill user details if logged in
  useEffect(() => {
    const user = authStore.get();
    if (user) {
      setNewAddress((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        phone: prev.phone || (user.phone ? user.phone.replace(/\D/g, "").slice(-10) : ""),
      }));
    }
  }, []);

  const { data: deliveryConfig } = useDeliveryConfig();
  const activeLines = cart.filter((l) => !l.savedForLater);
  const isFreeStandard = true;
  const standardShipping = 0;
  const expressCharge = Number(deliveryConfig?.expressCharge ?? 150);
  const expressEnabled = Boolean(deliveryConfig?.expressEnabled);

  const effectiveShipping = shippingMethod === "express" && expressEnabled ? expressCharge : standardShipping;
  const { tax } = cartTotals(subtotal, 0);
  const finalTotal = subtotal + effectiveShipping + tax;

  const activeDeliveryEstimate = shippingMethod === "express" && expressEnabled
    ? (deliveryConfig?.expressEstimate || "1–2 business days")
    : (deliveryConfig?.standardEstimate || "3–5 business days");

  const selectedSavedAddress = availableAddresses.find((a) => a.id === selectedAddressId);
  const currentAddress: Address = selectedSavedAddress ?? {
    id: "addr-custom",
    fullName: newAddress.fullName?.trim() || "",
    phone: newAddress.phone?.trim() || "",
    line1: newAddress.line1?.trim() || "",
    line2: newAddress.line2?.trim() || "",
    city: newAddress.city?.trim() || "",
    state: newAddress.state?.trim() || "",
    pincode: newAddress.pincode?.trim() || "",
    isDefault: false,
  };

  const persistNewAddress = async (): Promise<string | null> => {
    if (!newAddress.fullName?.trim()) {
      toast.error("Please enter your full name");
      return null;
    }
    const rawPhone = (newAddress.phone ?? "").replace(/\D/g, "");
    const cleanPhone =
      rawPhone.length === 12 && rawPhone.startsWith("91")
        ? rawPhone.slice(2)
        : rawPhone.length === 11 && rawPhone.startsWith("0")
        ? rawPhone.slice(1)
        : rawPhone.slice(-10);

    if (cleanPhone.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return null;
    }
    if (!newAddress.line1?.trim()) {
      toast.error("Please enter your street address");
      return null;
    }
    if (!newAddress.city?.trim()) {
      toast.error("Please select or enter your city");
      return null;
    }
    if (!newAddress.state?.trim()) {
      toast.error("Please select or enter your state");
      return null;
    }
    const cleanPin = (newAddress.pincode ?? "").replace(/\D/g, "").slice(0, 6);
    if (cleanPin.length !== 6) {
      toast.error("Please enter a valid 6-digit PIN code");
      return null;
    }

    const country = newAddress.country || "India";
    const token = authStore.getToken();
    setIsSavingAddress(true);

    try {
      if (token) {
        const res = await createAddressMutation.mutateAsync({
          recipientName: newAddress.fullName.trim(),
          phone: cleanPhone,
          addressLine1: newAddress.line1.trim(),
          addressLine2: newAddress.line2?.trim() || null,
          city: newAddress.city.trim(),
          state: newAddress.state.trim(),
          country,
          pincode: cleanPin,
          addressType: "HOME",
          isDefault: availableAddresses.length === 0,
        });

        const createdId = res?.data?.id ?? `addr-${Date.now()}`;
        const localAddr: Address = {
          id: createdId,
          fullName: newAddress.fullName.trim(),
          phone: cleanPhone,
          line1: newAddress.line1.trim(),
          line2: newAddress.line2?.trim() || undefined,
          city: newAddress.city.trim(),
          state: newAddress.state.trim(),
          pincode: cleanPin,
          isDefault: availableAddresses.length === 0,
        };
        saveAddress(localAddr);
        setSelectedAddressId(createdId);
        toast.success("Delivery address saved to your account");
        return createdId;
      } else {
        const localId = `addr-${Date.now()}`;
        const localAddr: Address = {
          id: localId,
          fullName: newAddress.fullName.trim(),
          phone: cleanPhone,
          line1: newAddress.line1.trim(),
          line2: newAddress.line2?.trim() || undefined,
          city: newAddress.city.trim(),
          state: newAddress.state.trim(),
          pincode: cleanPin,
          isDefault: availableAddresses.length === 0,
        };
        saveAddress(localAddr);
        setSelectedAddressId(localId);
        toast.success("Address saved for checkout");
        return localId;
      }
    } catch (err: any) {
      console.warn("Failed to persist address to account:", err);
      const localId = `addr-${Date.now()}`;
      const localAddr: Address = {
        id: localId,
        fullName: newAddress.fullName.trim(),
        phone: cleanPhone,
        line1: newAddress.line1.trim(),
        line2: newAddress.line2?.trim() || undefined,
        city: newAddress.city.trim(),
        state: newAddress.state.trim(),
        pincode: cleanPin,
        isDefault: availableAddresses.length === 0,
      };
      saveAddress(localAddr);
      setSelectedAddressId(localId);
      return localId;
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (selectedAddressId === "new") {
      const savedId = await persistNewAddress();
      if (!savedId) return;
    } else {
      const selected = availableAddresses.find((a) => a.id === selectedAddressId);
      if (!selected) {
        toast.error("Please select a delivery address");
        return;
      }
    }
    setStep(3);
  };

  const createOrderMutation = useCreateOrder();
  const createRazorpayOrderMutation = useCreateRazorpayOrder();
  const verifyRazorpayPaymentMutation = useVerifyRazorpayPayment();
  const abandonOrderPaymentMutation = useAbandonOrderPayment();
  const pendingOnlineOrderRef = useRef<{
    signature: string;
    order: { id: string; orderNumber?: string | null | undefined };
  } | null>(null);
  const { data: _catalog } = useProducts();
  const [isPlacing, setIsPlacing] = useState(false);

  const outOfStockItems = activeLines.filter((line) => {
    const p = getRegisteredProduct(line.productId) ?? productService.bySlug(line.productId);
    return p && getStockByVariantId(p, line.variantId) < line.quantity;
  });
  const hasOutOfStockItems = outOfStockItems.length > 0;

  const handlePlaceOrder = async () => {
    setIsPlacing(true);

    if (hasOutOfStockItems) {
      toast.error(
        "Some items in your bag are currently out of stock. Please update your bag to proceed.",
      );
      setIsPlacing(false);
      return;
    }

    const items = activeLines
      .map((line) => {
        const p = getRegisteredProduct(line.productId) ?? productService.bySlug(line.productId);
        if (!p) return null;
        const v = p.variants?.find((vr) => vr.id === line.variantId);
        return {
          productSlug: p.slug,
          name: p.name,
          size: v?.sizeLabel ?? "—",
          color: v?.colorName ?? "—",
          quantity: line.quantity,
          price: p.price,
        };
      })
      .filter(Boolean) as Order["items"];

    if (items.length === 0) {
      toast.error("Your cart is empty");
      setIsPlacing(false);
      return;
    }

    if (!onlinePaymentEnabled) {
      toast.error("Online payment gateway is temporarily unavailable. Please try again shortly.");
      setIsPlacing(false);
      return;
    }

    const completeOrderSuccess = (finalOrderId: string, finalPaymentMethod: string, finalOrderNumber?: string | null) => {
      const newOrder: Order = {
        id: finalOrderId,
        orderNumber: finalOrderNumber,
        date: new Date().toISOString().split("T")[0]!,
        status: "Confirmed",
        deliveryDate: activeDeliveryEstimate,
        paymentMethod: finalPaymentMethod,
        address: currentAddress,
        items,
        subtotal,
        shipping: effectiveShipping,
        tax,
        total: finalTotal,
      };

      placeOrder(newOrder);
      setConfirmedOrder(newOrder);
      setStep(4);
      clearCart();
      setIsPlacing(false);
      toast.success(`Order confirmed successfully!`);
    };

    const apiItems = activeLines
      .map((line) => {
        const p = getRegisteredProduct(line.productId) ?? productService.bySlug(line.productId);
        if (!p) return null;
        // Resolve variant strictly by UUID — no string label matching needed
        const variant = p.variants?.find((v) => v.id === line.variantId) ?? null;
        return {
          productId: p.id,
          variantUuid: variant?.id ?? null,
          sizeLabel: variant?.sizeLabel ?? null,
          colorName: variant?.colorName ?? null,
          quantity: line.quantity,
          price: p.price,
        };
      })
      .filter(Boolean);

    const authUser = authStore.get();
    const rawPhone = (currentAddress.phone ?? "").replace(/\D/g, "");
    const cleanPhone =
      rawPhone.length === 12 && rawPhone.startsWith("91")
        ? rawPhone.slice(2)
        : rawPhone.length === 11 && rawPhone.startsWith("0")
        ? rawPhone.slice(1)
        : rawPhone.slice(-10);
    const cleanPincode = (currentAddress.pincode ?? "").replace(/\D/g, "").slice(0, 6);

    if (!currentAddress.fullName?.trim()) {
      toast.error("Please provide your full name");
      setStep(2);
      setIsPlacing(false);
      return;
    }
    if (cleanPhone.length !== 10) {
      toast.error("Please provide a valid 10-digit mobile number");
      setStep(2);
      setIsPlacing(false);
      return;
    }
    if (!currentAddress.line1?.trim() || !currentAddress.city?.trim() || !currentAddress.state?.trim()) {
      toast.error("Please provide a complete delivery address");
      setStep(2);
      setIsPlacing(false);
      return;
    }
    if (cleanPincode.length !== 6) {
      toast.error("Please provide a valid 6-digit PIN code");
      setStep(2);
      setIsPlacing(false);
      return;
    }

    const payload = {
      items: apiItems,
      discountAmount: 0,
      totalAmount: finalTotal,
      customerName: currentAddress.fullName.trim(),
      customerEmail: authUser?.email || undefined,
      customerPhone: cleanPhone,
      address: currentAddress.line1.trim(),
      landmark: currentAddress.line2?.trim() || "",
      city: currentAddress.city.trim(),
      state: currentAddress.state.trim(),
      country: currentAddress.country || newAddress.country || "India",
      pincode: cleanPincode,
      paymentMethod: "ONLINE",
      saveAddress: saveAddressToAccount,
      savedAddressId: selectedSavedAddress && !selectedSavedAddress.id.startsWith("addr-") ? selectedSavedAddress.id : undefined,
    };

    const checkoutSignature = JSON.stringify({
      items: apiItems,
      totalAmount: finalTotal,
      customerName: currentAddress.fullName.trim(),
      customerPhone: cleanPhone,
      address: currentAddress.line1.trim(),
      landmark: currentAddress.line2?.trim() || "",
      city: currentAddress.city.trim(),
      state: currentAddress.state.trim(),
      pincode: cleanPincode,
    });

    let backendOrder: { id: string; orderNumber?: string | null | undefined } | null = null;
    if (
      pendingOnlineOrderRef.current &&
      pendingOnlineOrderRef.current.signature === checkoutSignature
    ) {
      backendOrder = pendingOnlineOrderRef.current.order;
    } else {
      if (pendingOnlineOrderRef.current) {
        const staleOrderId = pendingOnlineOrderRef.current.order.id;
        pendingOnlineOrderRef.current = null;
        abandonOrderPaymentMutation.mutate(staleOrderId, { onError: () => {} });
      }
      try {
        backendOrder = await createOrderMutation.mutateAsync(payload);
        if (backendOrder?.id) {
          pendingOnlineOrderRef.current = {
            signature: checkoutSignature,
            order: { id: backendOrder.id, orderNumber: backendOrder.orderNumber },
          };
        }
      } catch (err: any) {
        console.error("Backend order creation failed:", err);
        toast.error(err?.message || "Failed to create order on server");
        setIsPlacing(false);
        return;
      }
    }

    const platformOrderId = backendOrder?.id;
    if (!platformOrderId) {
      toast.error("Server did not return a valid order ID");
      setIsPlacing(false);
      return;
    }

    // Online payment flow (UPI, Card, Net Banking via Razorpay)
    try {
      let rzpOrder: Awaited<ReturnType<typeof createRazorpayOrderMutation.mutateAsync>>;
      try {
        rzpOrder = await createRazorpayOrderMutation.mutateAsync({
          platformOrderId,
          amount: finalTotal,
          receipt: platformOrderId,
        });
      } catch (createRzpErr) {
        pendingOnlineOrderRef.current = null;
        throw createRzpErr;
      }

      if (!rzpOrder?.razorpayOrderId || !rzpOrder?.keyId) {
        throw new Error("Razorpay gateway response missing order ID or key");
      }

      await openRazorpayCheckout({
        key: rzpOrder.keyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency || "INR",
        name: "Makerman Clothing",
        description: `Order ${platformOrderId.slice(0, 8)}`,
        order_id: rzpOrder.razorpayOrderId,
        prefill: {
          name: currentAddress.fullName,
          contact: cleanPhone,
          ...(authUser?.email ? { email: authUser.email } : {}),
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
              platformOrderId: platformOrderId,
            });
            pendingOnlineOrderRef.current = null;
            completeOrderSuccess(
              platformOrderId,
              `Razorpay Online (${response.razorpay_payment_id.slice(-6)})`,
              backendOrder?.orderNumber,
            );
          } catch (verifyErr: any) {
            console.error("Payment verification failed:", verifyErr);
            toast.error(
              verifyErr?.message ||
                "Payment verification failed. Please contact support if your account was debited.",
            );
            setIsPlacing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsPlacing(false);
            abandonOrderPaymentMutation.mutate(platformOrderId, { onError: () => {} });
            toast.info("Payment pending — order not placed. You can retry when ready.");
          },
        },
      });
    } catch (err: unknown) {
      setIsPlacing(false);
      const msg = (err as Error)?.message || "";
      console.error("Razorpay order initiation error:", msg);
      toast.error("Online payment error: " + (msg || "Unable to initiate transaction. Please try again."));
    }
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
            Order Reference: <strong className="text-foreground">{formatOrderId(order.id, order.orderNumber)}</strong>
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
                    {availableAddresses.map((addr) => (
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
                    <div className="space-y-4 pt-3 border-t border-border">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={newAddress.fullName}
                            onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full h-11 border border-border px-3 text-xs rounded-sm outline-none bg-background focus:border-foreground"
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
                            placeholder="10-digit mobile number"
                            className="w-full h-11 border border-border px-3 text-xs rounded-sm outline-none bg-background focus:border-foreground font-mono"
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
                            placeholder="Flat/House No., Building, Street"
                            className="w-full h-11 border border-border px-3 text-xs rounded-sm outline-none bg-background focus:border-foreground"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider">
                            Apartment / Area / Locality (Optional)
                          </label>
                          <input
                            type="text"
                            value={newAddress.line2}
                            onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                            placeholder="Landmark or locality"
                            className="w-full h-11 border border-border px-3 text-xs rounded-sm outline-none bg-background focus:border-foreground"
                          />
                        </div>
                      </div>

                      {/* Searchable Country, State, City, PIN Code with Live Verification */}
                      <StorefrontLocationSelector
                        country={newAddress.country || "India"}
                        state={newAddress.state || ""}
                        city={newAddress.city || ""}
                        pincode={newAddress.pincode || ""}
                        onCountryChange={(cntry) => setNewAddress((prev) => ({ ...prev, country: cntry }))}
                        onStateChange={(st) => setNewAddress((prev) => ({ ...prev, state: st }))}
                        onCityChange={(cty) => setNewAddress((prev) => ({ ...prev, city: cty }))}
                        onPincodeChange={(pin) => setNewAddress((prev) => ({ ...prev, pincode: pin }))}
                      />

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={saveAddressToAccount}
                            onChange={(e) => setSaveAddressToAccount(e.target.checked)}
                            className="h-4 w-4 rounded-xs border-border text-foreground accent-foreground"
                          />
                          <span>Save this delivery address to my account for faster checkout</span>
                        </label>

                        <button
                          type="button"
                          disabled={isSavingAddress}
                          onClick={persistNewAddress}
                          className="text-xs font-semibold text-foreground underline hover:text-muted-foreground transition-colors disabled:opacity-50"
                        >
                          {isSavingAddress ? "Saving address..." : "+ Save to Address Book"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Delivery Option */}
                  <div className="pt-3 border-t border-border space-y-2.5">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Delivery Option
                      </p>
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3 text-amber-600" />
                        {activeDeliveryEstimate}
                      </span>
                    </div>

                    {/* Single Normal Delivery Option */}
                    <div
                      className={cn(
                        "p-3.5 border text-xs rounded-sm flex items-center justify-between transition-colors border-foreground bg-[#FAF8F5]",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Truck className="h-4 w-4 text-amber-600 shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground">
                            {deliveryConfig?.standardName || "Standard Delivery"}
                          </p>
                          <p className="text-muted-foreground text-[11px]">
                            {deliveryConfig?.standardEstimate || "3–5 business days"} delivery
                          </p>
                        </div>
                      </div>
                      <span className="font-semibold text-foreground">
                        {standardShipping === 0 ? "Complimentary" : formatINR(standardShipping)}
                      </span>
                    </div>

                    {/* Optional Express (Only if client enabled in admin panel) */}
                    {expressEnabled && (
                      <label
                        onClick={() => setShippingMethod(shippingMethod === "express" ? "standard" : "express")}
                        className={cn(
                          "p-3.5 border text-xs cursor-pointer rounded-sm flex items-center justify-between transition-colors",
                          shippingMethod === "express" ? "border-foreground bg-[#FAF8F5]" : "border-border",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Zap className="h-4 w-4 text-amber-600 shrink-0" />
                          <div>
                            <p className="font-semibold text-foreground">
                              {deliveryConfig?.expressName || "Express Delivery"}
                            </p>
                            <p className="text-muted-foreground text-[11px]">
                              {deliveryConfig?.expressEstimate || "1–2 business days"}
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold">{formatINR(expressCharge)}</span>
                      </label>
                    )}
                  </div>

                  <Button
                    onClick={handleProceedToPayment}
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
                    <div className="sm:col-span-2 p-3 bg-[#FAF8F5] border border-border/80 rounded-sm text-xs text-muted-foreground flex items-start gap-2.5">
                      <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                      <div>
                        <p className="font-semibold text-foreground">100% Prepaid Orders</p>
                        <p className="text-[11px] mt-0.5">
                          We exclusively accept secure prepaid payments via Razorpay (UPI, Credit/Debit Cards, Net Banking).
                        </p>
                      </div>
                    </div>

                    {paymentConfigLoading &&
                      [1, 2, 3].map((i) => (
                        <div key={i} className="p-4 border border-border rounded-sm animate-pulse bg-secondary/40 h-20" />
                      ))}

                    {!paymentConfigLoading &&
                      [
                      { id: "upi", title: "UPI / QR Code", desc: "Google Pay, PhonePe, Paytm, BHIM", icon: QrCode },
                      { id: "card", title: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay, Amex", icon: CreditCard },
                      { id: "netbanking", title: "Net Banking", desc: "HDFC, ICICI, SBI, Axis, Kotak", icon: Wallet },
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
                    disabled={isPlacing || paymentConfigLoading || hasOutOfStockItems}
                    onClick={handlePlaceOrder}
                    className={cn(
                      "w-full h-13 text-xs font-semibold uppercase tracking-[0.14em] rounded-sm shadow-md transition-all",
                      hasOutOfStockItems
                        ? "bg-rose-700 text-white cursor-not-allowed hover:bg-rose-700"
                        : "bg-ink text-ink-foreground hover:bg-ink/90",
                    )}
                  >
                    {isPlacing
                      ? "Securing Garments..."
                      : hasOutOfStockItems
                        ? "Item Out of Stock — Please Update Bag"
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
                  const product =
                    getRegisteredProduct(line.productId) ?? productService.bySlug(line.productId);
                  if (!product) return null;
                  const variant = product.variants?.find((vr) => vr.id === line.variantId);
                  const displaySize = variant?.sizeLabel ?? "—";
                  const displayColor = variant?.colorName ?? "—";
                  const available = getStockByVariantId(product, line.variantId);
                  const isInsufficient = available < line.quantity;

                  return (
                    <div key={line.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img src={product.images[0]} alt="" className="h-10 w-8 object-cover rounded-xs bg-secondary shrink-0" />
                        <div className="truncate">
                          <p className="font-medium text-foreground truncate">{product.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {displaySize} · {displayColor} · Qty {line.quantity}
                          </p>
                          {isInsufficient && (
                            <p className="text-[10px] text-rose-600 font-semibold mt-0.5">
                              Out of stock ({available} in stock)
                            </p>
                          )}
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
                  <span>
                    Delivery ({shippingMethod === "express" && expressEnabled ? (deliveryConfig?.expressName || "Express") : (deliveryConfig?.standardName || "Standard")})
                  </span>
                  <span className="font-semibold text-foreground">
                    {effectiveShipping === 0 ? "Complimentary" : formatINR(effectiveShipping)}
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
