import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  CreditCard,
  Heart,
  LogOut,
  MapPin,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { MakermanLogo } from "@/components/layout/makerman-logo";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import { productService } from "@/services";
import { authStore } from "@/lib/auth-store";
import {
  useLogin,
  useRegister,
  useVerifyOtp,
  useOrders,
  useApiWishlist,
} from "@/hooks/use-api";
import type { Address } from "@/types";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account & Orders — MAKERMAN | Feeling Happiness" },
      { name: "description", content: "Manage your Makerman orders, saved addresses, and profile." },
      { property: "og:title", content: "My Account — Makerman Clothing" },
    ],
  }),
  component: AccountPage,
});

export function AccountPage() {
  const {
    session,
    signIn,
    signOut,
    orders,
    addresses,
    wishlist,
    saveAddress,
    deleteAddress,
    setDefaultAddress,
  } = useShop();

  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "addresses" | "profile" | "favorites">("overview");
  const [authMode, setAuthMode] = useState<"login" | "register" | "otp">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authPhone, setAuthPhone] = useState("");
  const [authOtp, setAuthOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const verifyOtpMutation = useVerifyOtp();
  const { data: apiOrdersData } = useOrders();
  const { data: apiWishlistData } = useApiWishlist();

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState<Partial<Address>>({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await loginMutation.mutateAsync({
        email: authEmail.trim(),
        password: authPassword,
      });
      authStore.set(res);
      signIn(res.email, res.name);
      toast.success("Welcome back", { description: res.name });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials";
      toast.error("Sign in failed", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!authName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (authPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerMutation.mutateAsync({
        name: authName.trim(),
        email: authEmail.trim(),
        password: authPassword,
        phone: authPhone.replace(/\D/g, "") || undefined,
      });
      setAuthMode("otp");
      toast.success("Verification code sent", {
        description: `Check your inbox at ${authEmail}`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      toast.error("Registration failed", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authOtp.trim()) {
      toast.error("Please enter the verification OTP");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifyOtpMutation.mutateAsync({
        email: authEmail.trim(),
        otp: authOtp.trim(),
      });
      authStore.set(res);
      signIn(res.email, res.name);
      toast.success("Account verified", { description: `Welcome ${res.name}` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid OTP code";
      toast.error("Verification failed", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.line1 || !newAddr.pincode) {
      toast.error("Please fill in all required address fields.");
      return;
    }
    const addr: Address = {
      id: `addr-${Date.now()}`,
      fullName: newAddr.fullName ?? "",
      phone: newAddr.phone ?? "+91 98204 41120",
      line1: newAddr.line1 ?? "",
      line2: newAddr.line2,
      city: newAddr.city ?? "Mumbai",
      state: newAddr.state ?? "Maharashtra",
      pincode: newAddr.pincode ?? "400013",
      isDefault: addresses.length === 0,
    };
    saveAddress(addr);
    setIsAddingAddress(false);
    setNewAddr({ fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
    toast.success("New delivery address saved.");
  };

  // If not logged in, show elegant auth card (Login, Register, OTP verification)
  if (!session) {
    return (
      <div className="min-h-[75vh] bg-background py-16 md:py-24">
        <div className="container-page max-w-md mx-auto">
          <div className="text-center mb-8 space-y-3">
            <MakermanLogo size="sm" className="mx-auto" />
            <p className="eyebrow text-amber-600 font-semibold tracking-widest pt-2">
              Client Portal
            </p>
            <h1 className="font-display text-3xl sm:text-4xl text-foreground font-normal">
              {authMode === "login"
                ? "Sign In to Makerman"
                : authMode === "register"
                  ? "Create Your Account"
                  : "Verify Your Email"}
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {authMode === "otp"
                ? `Enter the 6-digit one-time code sent to ${authEmail}`
                : "Track orders, access saved favorites, and manage your wardrobe."}
            </p>
          </div>

          <div className="border border-border p-6 sm:p-8 bg-background rounded-sm shadow-soft space-y-4">
            {/* Mode Tabs */}
            {authMode !== "otp" && (
              <div className="flex border-b border-border/70 mb-4 pb-2">
                <button
                  type="button"
                  onClick={() => setAuthMode("login")}
                  className={cn(
                    "flex-1 text-xs uppercase tracking-wider py-1 font-semibold text-center border-b-2 transition-colors",
                    authMode === "login"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("register")}
                  className={cn(
                    "flex-1 text-xs uppercase tracking-wider py-1 font-semibold text-center border-b-2 transition-colors",
                    authMode === "register"
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  Register
                </button>
              </div>
            )}

            {/* Form: LOGIN */}
            {authMode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full h-11 border border-border px-3 text-xs rounded-sm outline-none focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-11 border border-border px-3 text-xs rounded-sm outline-none focus:border-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-xs font-semibold uppercase tracking-[0.14em] bg-ink text-ink-foreground hover:bg-ink/90 rounded-sm mt-2"
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                </Button>

                <p className="text-[11px] text-center text-muted-foreground pt-2">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("register")}
                    className="text-amber-600 font-medium hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              </form>
            )}

            {/* Form: REGISTER */}
            {authMode === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Siddharth Sen"
                    className="w-full h-11 border border-border px-3 text-xs rounded-sm outline-none focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full h-11 border border-border px-3 text-xs rounded-sm outline-none focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Mobile Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    placeholder="98204 41120"
                    className="w-full h-11 border border-border px-3 text-xs rounded-sm outline-none focus:border-foreground font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Create Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full h-11 border border-border px-3 text-xs rounded-sm outline-none focus:border-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-xs font-semibold uppercase tracking-[0.14em] bg-ink text-ink-foreground hover:bg-ink/90 rounded-sm mt-2"
                >
                  {isSubmitting ? "Sending OTP..." : "Register & Get OTP"}
                </Button>

                <p className="text-[11px] text-center text-muted-foreground pt-2">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className="text-amber-600 font-medium hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </form>
            )}

            {/* Form: VERIFY OTP */}
            {authMode === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
                    Verification Code (OTP)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={authOtp}
                    onChange={(e) => setAuthOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full h-12 border border-border px-3 text-center text-lg tracking-widest font-mono rounded-sm outline-none focus:border-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-xs font-semibold uppercase tracking-[0.14em] bg-ink text-ink-foreground hover:bg-ink/90 rounded-sm mt-2"
                >
                  {isSubmitting ? "Verifying..." : "Verify & Sign In"}
                </Button>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode("register")}
                    className="hover:underline"
                  >
                    ← Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode("login")}
                    className="text-amber-600 hover:underline font-medium"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  const liveUser = authStore.get();
  const liveOrders = apiOrdersData?.content;
  const effectiveOrders =
    liveOrders && liveOrders.length > 0
      ? liveOrders.map((o) => ({
          id: o.id,
          date: new Date(o.createdAt || Date.now()).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          status: (o.status || "Order Placed") as Order["status"],
          deliveryDate: "Estimated 3-5 business days",
          paymentMethod: o.paymentMethod || "Prepaid",
          address: addresses[0] || {
            id: "1",
            fullName: o.customerName || "Customer",
            phone: o.customerPhone || "+91 98204 41120",
            line1: o.shippingAddress || "Main Street",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400013",
            isDefault: true,
          },
          items: (o.items || []).map((it) => ({
            productSlug: it.productId,
            name: it.productName || "Makerman Garment",
            size: "Regular",
            color: "Standard",
            quantity: it.quantity,
            price: it.price,
          })),
          subtotal: o.totalAmount,
          shipping: 0,
          tax: 0,
          total: o.totalAmount,
        }))
      : orders;

  const favoriteProducts = wishlist
    .map((slug) => productService.bySlug(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const handleSignOut = () => {
    authStore.clear();
    signOut();
    toast("Signed out of Makerman account");
  };

  return (
    <div className="min-h-screen bg-background py-10 md:py-16">
      <div className="container-page max-w-5xl">
        {/* User Greeting & Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border/80 pb-6 mb-8 gap-4">
          <div>
            <p className="eyebrow text-amber-600 font-semibold tracking-widest">
              Makerman Client Concierge
            </p>
            <h1 className="font-display text-3xl sm:text-4xl text-foreground font-normal mt-1">
              Welcome, {liveUser?.name ? liveUser.name.split(" ")[0] : session.firstName}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Signed in as <span className="font-mono text-foreground">{session.email}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors self-start sm:self-auto"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>

        {/* Tab Navigation (Overview, Orders, Addresses, Profile, Favorites) */}
        <div className="flex border-b border-border/70 overflow-x-auto no-scrollbar gap-1 sm:gap-2 mb-8">
          {[
            { id: "overview", label: "Overview" },
            { id: "orders", label: `Orders (${effectiveOrders.length})` },
            { id: "addresses", label: "Addresses" },
            { id: "profile", label: "Profile" },
            { id: "favorites", label: `Favorites (${wishlist.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "h-11 px-4 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all border-b-2",
                activeTab === tab.id
                  ? "border-foreground text-foreground font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-in fade-in-50">
            {/* Quick Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 border border-border rounded-sm bg-[#FAF8F5]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Orders</p>
                <p className="font-display text-2xl font-semibold text-foreground mt-2">{effectiveOrders.length}</p>
                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className="mt-3 text-xs text-amber-600 font-medium hover:underline inline-flex items-center gap-1"
                >
                  View order history →
                </button>
              </div>

              <div className="p-5 border border-border rounded-sm bg-[#FAF8F5]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Saved Favorites</p>
                <p className="font-display text-2xl font-semibold text-foreground mt-2">{wishlist.length}</p>
                <button
                  type="button"
                  onClick={() => setActiveTab("favorites")}
                  className="mt-3 text-xs text-amber-600 font-medium hover:underline inline-flex items-center gap-1"
                >
                  View saved garments →
                </button>
              </div>

              <div className="p-5 border border-border rounded-sm bg-[#FAF8F5]">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Saved Addresses</p>
                <p className="font-display text-2xl font-semibold text-foreground mt-2">{addresses.length}</p>
                <button
                  type="button"
                  onClick={() => setActiveTab("addresses")}
                  className="mt-3 text-xs text-amber-600 font-medium hover:underline inline-flex items-center gap-1"
                >
                  Manage addresses →
                </button>
              </div>
            </div>

            {/* Recent Order Preview */}
            {effectiveOrders.length > 0 && (
              <div className="border border-border p-6 rounded-sm bg-background">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-normal">Recent Order</h3>
                  <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-xs font-semibold">
                    {effectiveOrders[0]?.status}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Order ID: <strong className="text-foreground">{effectiveOrders[0]?.id}</strong> · Placed on {effectiveOrders[0]?.date}</p>
                  <p>Total: <strong className="text-foreground font-semibold">{formatINR(effectiveOrders[0]?.total ?? 0)}</strong></p>
                </div>
                <div className="mt-4 pt-4 border-t border-border/60">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("orders")}
                    className="text-xs uppercase tracking-wider"
                  >
                    View All Orders
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-in fade-in-50">
            {effectiveOrders.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-border rounded-sm p-6">
                <Package className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-display text-xl">No orders yet</p>
                <p className="text-xs text-muted-foreground mt-1">Your placed garments will appear here.</p>
                <Button asChild className="mt-6 text-xs uppercase tracking-wider bg-ink text-ink-foreground">
                  <Link to="/store">Explore Store</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {effectiveOrders.map((order) => (
                  <div key={order.id} className="border border-border rounded-sm bg-background overflow-hidden">
                    {/* Order Header */}
                    <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Order #</span>
                        <strong className="text-foreground ml-1 font-mono">{order.id}</strong>
                        <span className="text-muted-foreground ml-3">Date: {order.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-xs bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                          {order.status}
                        </span>
                        <span className="font-display text-sm font-semibold text-foreground">
                          {formatINR(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-5 divide-y divide-border/60">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                          <div>
                            <p className="font-semibold text-foreground">{item.name}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              Size: {item.size} · Color: {item.color} · Qty: {item.quantity}
                            </p>
                          </div>
                          <span className="font-semibold text-foreground">{formatINR(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="px-5 py-3 bg-secondary/30 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Paid via {order.paymentMethod}</span>
                      <span>Estimated Arrival: {order.deliveryDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Addresses */}
        {activeTab === "addresses" && (
          <div className="space-y-6 animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl font-normal">Delivery Addresses</h3>
              {!isAddingAddress && (
                <Button
                  onClick={() => setIsAddingAddress(true)}
                  size="sm"
                  className="text-xs uppercase tracking-wider bg-ink text-ink-foreground"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Address
                </Button>
              )}
            </div>

            {isAddingAddress && (
              <form onSubmit={handleCreateAddress} className="border border-border p-6 rounded-sm bg-[#FAF8F5] space-y-4 text-xs">
                <p className="font-semibold text-foreground uppercase tracking-wider text-xs">New Delivery Address</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.fullName}
                      onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                      className="w-full h-10 border border-border px-3 rounded-sm bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                      placeholder="+91 98204 00000"
                      className="w-full h-10 border border-border px-3 rounded-sm bg-background font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.line1}
                      onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                      className="w-full h-10 border border-border px-3 rounded-sm bg-background"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Area / Locality</label>
                    <input
                      type="text"
                      value={newAddr.line2}
                      onChange={(e) => setNewAddr({ ...newAddr, line2: e.target.value })}
                      className="w-full h-10 border border-border px-3 rounded-sm bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      className="w-full h-10 border border-border px-3 rounded-sm bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      className="w-full h-10 border border-border px-3 rounded-sm bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">PIN Code *</label>
                    <input
                      type="text"
                      required
                      value={newAddr.pincode}
                      onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                      className="w-full h-10 border border-border px-3 rounded-sm bg-background font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" size="sm" className="bg-ink text-ink-foreground text-xs uppercase tracking-wider">
                    Save Address
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingAddress(false)} className="text-xs uppercase tracking-wider">
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="border border-border p-5 rounded-sm bg-background relative flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground text-sm">{addr.fullName}</p>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-xs font-semibold">
                          Default Address
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{addr.line1}</p>
                    {addr.line2 && <p className="text-xs text-muted-foreground">{addr.line2}</p>}
                    <p className="text-xs text-muted-foreground">{addr.city}, {addr.state} — {addr.pincode}</p>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">Mobile: {addr.phone}</p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 mt-4 border-t border-border/60 text-xs">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-amber-600 hover:underline font-medium"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteAddress(addr.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors ml-auto"
                      aria-label="Delete address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Profile */}
        {activeTab === "profile" && (
          <div className="max-w-xl border border-border p-6 rounded-sm bg-background space-y-5 animate-in fade-in-50">
            <h3 className="font-display text-xl font-normal">Personal Profile</h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={`${session.firstName} ${session.lastName}`}
                  className="w-full h-11 border border-border px-3 rounded-sm bg-background font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue={session.email}
                  disabled
                  className="w-full h-11 border border-border px-3 rounded-sm bg-secondary/50 font-mono text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider">
                  Primary Mobile (+91)
                </label>
                <input
                  type="tel"
                  defaultValue="+91 98204 41120"
                  className="w-full h-11 border border-border px-3 rounded-sm bg-background font-mono"
                />
              </div>

              <Button
                type="button"
                onClick={() => toast.success("Profile preferences updated")}
                className="h-11 px-6 text-xs font-semibold uppercase tracking-wider bg-ink text-ink-foreground"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* Tab 5: Favorites */}
        {activeTab === "favorites" && (
          <div className="space-y-6 animate-in fade-in-50">
            {favoriteProducts.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-border rounded-sm p-6">
                <Heart className="h-8 w-8 text-amber-500/40 mx-auto mb-3" />
                <p className="font-display text-xl">Your favourites are waiting.</p>
                <p className="text-xs text-muted-foreground mt-1">Explore our garments to curate your wardrobe.</p>
                <Button asChild className="mt-6 text-xs uppercase tracking-wider bg-ink text-ink-foreground">
                  <Link to="/store">Explore Store</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {favoriteProducts.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
