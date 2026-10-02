import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, MapPin, Package, ShieldCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping & Fulfillment — AVELOR" },
      { name: "description", content: "Details on dispatch timelines, express domestic delivery, and carbon-neutral packaging." },
    ],
  }),
  component: ShippingPage,
});

export function ShippingPage() {
  return (
    <div className="container-page py-10 md:py-16 max-w-3xl space-y-10">
      <div>
        <p className="eyebrow text-subtle">Logistics & Delivery</p>
        <h1 className="font-display text-4xl sm:text-5xl mt-1">Shipping Policy</h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
          All orders are prepared and dispatched with care from our Mumbai atelier warehouse.
        </p>
      </div>

      <div className="space-y-6 text-xs text-muted-foreground leading-relaxed divide-y divide-border border-y border-border">
        <div className="pt-6 first:pt-0 space-y-2">
          <h2 className="font-display text-lg text-foreground font-medium flex items-center gap-2">
            <Truck className="h-4 w-4 text-accent" /> Domestic Shipping & Rates
          </h2>
          <p>
            We offer <strong>Complimentary Express Delivery</strong> on all orders valued above ₹1,999 across India. For orders below ₹1,999, a flat shipping fee of ₹99 applies.
          </p>
        </div>

        <div className="pt-6 space-y-2">
          <h2 className="font-display text-lg text-foreground font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" /> Dispatch & Delivery Timelines
          </h2>
          <p>
            Orders placed before 2:00 PM IST (Monday–Friday) are dispatched on the same business day. Delivery times vary by region:
          </p>
          <ul className="list-disc list-inside space-y-1 pt-1">
            <li><strong>Tier 1 Metro Cities:</strong> 2–3 business days</li>
            <li><strong>Rest of India:</strong> 3–5 business days</li>
            <li><strong>Priority Same-Day (Mumbai metro only):</strong> Available upon checkout request</li>
          </ul>
        </div>

        <div className="pt-6 space-y-2">
          <h2 className="font-display text-lg text-foreground font-medium flex items-center gap-2">
            <Package className="h-4 w-4 text-accent" /> Sustainable Packaging
          </h2>
          <p>
            Every AVELOR garment is wrapped in unbleached acid-free tissue paper and shipped in 100% recyclable FSC-certified paper mailers. No single-use plastic is used in our dispatch chain.
          </p>
        </div>

        <div className="pt-6 space-y-2">
          <h2 className="font-display text-lg text-foreground font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" /> Tracking Your Dispatch
          </h2>
          <p>
            Upon courier pickup, a dispatch confirmation with a live tracking link is transmitted via SMS and email. You can also monitor fulfillment directly within your account dashboard.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button asChild className="text-xs uppercase tracking-wider">
          <Link to="/shop">Continue Shopping</Link>
        </Button>
        <Button asChild variant="outline" className="text-xs uppercase tracking-wider">
          <Link to="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
