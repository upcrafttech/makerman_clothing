import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Clock,
  LogOut,
  MapPin,
  Package,
  Plus,
  Shield,
  Trash2,
  Truck,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/format";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import type { Address } from "@/types";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "Account & Orders — AVELOR" },
      { name: "description", content: "Manage your AVELOR orders, delivery addresses, and personal profile." },
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
    saveAddress,
    deleteAddress,
    setDefaultAddress,
  } = useShop();

  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile">("orders");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginName, setLoginName] = useState("");
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddr, setNewAddr] = useState<Partial<Address>>({
    fullName: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    signIn(loginEmail, loginName || "Client");
    toast.success("Welcome back to your AVELOR account.");
  };

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.fullName || !newAddr.line1 || !newAddr.pincode) {
      toast.error("Please fill in required address fields.");
      return;
    }
    const addr: Address = {
      id: `addr-${Date.now()}`,
      fullName: newAddr.fullName ?? "",
      phone: newAddr.phone ?? "+91 98204 00000",
      line1: newAddr.line1 ?? "",
      line2: newAddr.line2,
      city: newAddr.city ?? "Mumbai",
      state: newAddr.state ?? "Maharashtra",
      pincode: newAddr.pincode ?? "400001",
      isDefault: addresses.length === 0,
    };
    saveAddress(addr);
    setIsAddingAddress(false);
    setNewAddr({ fullName: "", phone: "", line1: "", city: "", state: "", pincode: "" });
    toast.success("New address saved.");
  };

  // If not logged in, show elegant auth gate
  if (!session) {
    return (
      <div className="container-page py-16 md:py-24 max-w-md mx-auto">
        <div className="text-center mb-8">
          <p className="eyebrow text-subtle">Client Portal</p>
          <h1 className="font-display text-3xl sm:text-4xl mt-1">Sign In</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Access your order fulfillment status, saved shipping addresses, and bespoke preferences.
          </p>
        </div>

        <form onSubmit={handleSignIn} className="border border-border p-6 bg-background space-y-4 shadow-xs">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Email Address</label>
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full h-11 border border-border px-3 text-xs outline-none focus:border-ink"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Full Name (Optional)</label>
            <input
              type="text"
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              placeholder="e.g. Siddharth Verma"
              className="w-full h-11 border border-border px-3 text-xs outline-none focus:border-ink"
            />
          </div>

          <Button type="submit" className="w-full h-12 text-xs uppercase tracking-[0.12em] font-medium mt-2">
            Continue with Email
          </Button>

          <p className="text-[11px] text-center text-muted-foreground pt-2">
            By signing in, you agree to AVELOR's terms and privacy protocols.
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border pb-6 mb-8 gap-4">
        <div>
          <p className="eyebrow text-subtle">Member Account</p>
          <h1 className="font-display text-3xl sm:text-4xl mt-1">
            Welcome, {session.firstName || "Member"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{session.email}</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            signOut();
            toast.info("Signed out of account.");
          }}
          className="text-xs text-muted-foreground hover:text-foreground h-9"
        >
          <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign Out
        </Button>
      </div>

      {/* Navigation tabs */}
      <div className="flex gap-6 border-b border-border mb-8 text-xs font-medium uppercase tracking-wider">
        {[
          { id: "orders", label: `Orders (${orders.length})`, icon: Package },
          { id: "addresses", label: `Saved Addresses (${addresses.length})`, icon: MapPin },
          { id: "profile", label: "Profile & Settings", icon: User },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "flex items-center gap-2 pb-3 transition-colors border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-ink text-foreground font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Orders */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-border">
              <Package className="h-8 w-8 text-muted-foreground mx-auto mb-2" strokeWidth={1.2} />
              <h3 className="font-display text-lg">No orders placed yet</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Your past purchases and live fulfillment timelines will show here.
              </p>
              <Button asChild className="mt-4 text-xs uppercase tracking-wider">
                <Link to="/shop">Explore Collection</Link>
              </Button>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="border border-border p-6 bg-background space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-2 text-xs">
                  <div>
                    <span className="font-mono text-muted-foreground">Order ID: </span>
                    <strong className="text-foreground font-mono">{order.id}</strong>
                    <span className="text-muted-foreground mx-2">·</span>
                    <span className="text-muted-foreground">Placed on {order.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-ink text-ink-foreground px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-medium">
                      {order.status}
                    </span>
                    <span className="num font-semibold text-foreground">{formatINR(order.total)}</span>
                  </div>
                </div>

                {/* Timeline progress indicator */}
                <div className="py-2">
                  <p className="eyebrow text-subtle text-[10px] mb-3">Fulfillment Status: {order.status}</p>
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                    {["Confirmed", "Packed", "Shipped", "Delivered"].map((st, i) => {
                      const isComplete =
                        (order.status === "Confirmed" && i <= 0) ||
                        (order.status === "Packed" && i <= 1) ||
                        (order.status === "Shipped" && i <= 2) ||
                        order.status === "Delivered";
                      return (
                        <div key={st} className="space-y-1">
                          <div
                            className={cn(
                              "h-1.5 w-full rounded-full transition-colors",
                              isComplete ? "bg-ink" : "bg-border"
                            )}
                          />
                          <span className={cn(isComplete ? "font-medium text-foreground" : "text-muted-foreground")}>
                            {st}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items in order */}
                <div className="divide-y divide-border/60">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-muted-foreground text-[11px]">
                          {item.color} · Size: {item.size} · Quantity: {item.quantity}
                        </p>
                      </div>
                      <span className="num font-medium">{formatINR(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab: Addresses */}
      {activeTab === "addresses" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-xl">Saved Shipping Locations</h2>
            <Button
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              size="sm"
              className="text-xs uppercase tracking-wider"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Address
            </Button>
          </div>

          {isAddingAddress && (
            <form onSubmit={handleCreateAddress} className="border border-border p-6 bg-secondary/20 space-y-4">
              <h3 className="font-display text-lg">Add New Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newAddr.fullName}
                    onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                    className="w-full h-10 border border-border px-3 bg-background outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    className="w-full h-10 border border-border px-3 bg-background outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-muted-foreground block mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={newAddr.line1}
                    onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                    className="w-full h-10 border border-border px-3 bg-background outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    className="w-full h-10 border border-border px-3 bg-background outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                    className="w-full h-10 border border-border px-3 bg-background outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" size="sm" className="text-xs uppercase tracking-wider">Save Address</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingAddress(false)}>Cancel</Button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="border border-border p-6 bg-background text-xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-foreground text-sm">{addr.fullName}</span>
                    {addr.isDefault && (
                      <span className="bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-2">{addr.line1}</p>
                  {addr.line2 && <p className="text-muted-foreground">{addr.line2}</p>}
                  <p className="text-muted-foreground">{addr.city}, {addr.state} — {addr.pincode}</p>
                  <p className="text-muted-foreground mt-1">Phone: {addr.phone}</p>
                </div>

                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  {!addr.isDefault ? (
                    <button
                      type="button"
                      onClick={() => setDefaultAddress(addr.id)}
                      className="text-xs text-accent hover:underline"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">Primary Delivery Address</span>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteAddress(addr.id)}
                    className="text-muted-foreground hover:text-destructive"
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

      {/* Tab: Profile */}
      {activeTab === "profile" && (
        <div className="border border-border p-6 bg-background max-w-lg space-y-6 text-xs">
          <h2 className="font-display text-xl">Account Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Email</label>
              <input
                type="text"
                disabled
                value={session.email}
                className="w-full h-10 border border-border px-3 bg-secondary text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Full Name</label>
              <input
                type="text"
                defaultValue={session.firstName}
                className="w-full h-10 border border-border px-3 bg-background outline-none"
              />
            </div>
            <div className="pt-2">
              <Button size="sm" onClick={() => toast.success("Preferences updated.")} className="text-xs uppercase tracking-wider">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
