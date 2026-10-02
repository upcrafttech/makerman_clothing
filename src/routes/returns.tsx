import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, RefreshCw, ShieldCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Exchanges — AVELOR" },
      { name: "description", content: "14-day complimentary returns with doorstep courier pickup." },
    ],
  }),
  component: ReturnsPage,
});

export function ReturnsPage() {
  return (
    <div className="container-page py-10 md:py-16 max-w-3xl space-y-10">
      <div>
        <p className="eyebrow text-subtle">Peace of Mind</p>
        <h1 className="font-display text-4xl sm:text-5xl mt-1">Returns & Exchanges</h1>
        <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
          We want every AVELOR piece to fit seamlessly. If something isn't right, return or exchange it with zero friction.
        </p>
      </div>

      <div className="space-y-6 text-xs text-muted-foreground leading-relaxed divide-y divide-border border-y border-border">
        <div className="pt-6 first:pt-0 space-y-2">
          <h2 className="font-display text-lg text-foreground font-medium flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-accent" /> 14-Day Complimentary Window
          </h2>
          <p>
            You may initiate a return or size exchange within <strong>14 days of delivery</strong>. We arrange complimentary reverse pickup from your address anywhere in India.
          </p>
        </div>

        <div className="pt-6 space-y-2">
          <h2 className="font-display text-lg text-foreground font-medium flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent" /> Condition Guidelines
          </h2>
          <p>
            To qualify for a refund or size replacement, returned items must be:
          </p>
          <ul className="list-disc list-inside space-y-1 pt-1">
            <li>Unworn, unwashed, and undamaged with original atelier tags attached</li>
            <li>In the original paper pouch or protective packaging</li>
            <li>Free of cosmetic residue, perfumes, or animal hair</li>
          </ul>
        </div>

        <div className="pt-6 space-y-2">
          <h2 className="font-display text-lg text-foreground font-medium flex items-center gap-2">
            <Truck className="h-4 w-4 text-accent" /> Refund Processing
          </h2>
          <p>
            Once inspected at our studio warehouse (typically within 48 hours of return arrival), refunds are credited back to your original payment method within 5–7 business days.
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button asChild className="text-xs uppercase tracking-wider">
          <Link to="/account">Initiate a Return</Link>
        </Button>
        <Button asChild variant="outline" className="text-xs uppercase tracking-wider">
          <Link to="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
