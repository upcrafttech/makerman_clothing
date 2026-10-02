import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — AVELOR" },
      { name: "description", content: "Terms governing the purchase and browsing of AVELOR pieces." },
    ],
  }),
  component: TermsPage,
});

export function TermsPage() {
  return (
    <div className="container-page py-10 md:py-16 max-w-3xl space-y-8">
      <div>
        <p className="eyebrow text-subtle">Client Agreement</p>
        <h1 className="font-display text-4xl sm:text-5xl mt-1">Terms of Service</h1>
        <p className="mt-2 text-xs text-muted-foreground">Effective Date: January 1, 2026</p>
      </div>

      <div className="space-y-6 text-xs text-muted-foreground leading-relaxed divide-y divide-border border-y border-border py-6">
        <div className="space-y-2">
          <h2 className="font-display text-base text-foreground font-medium">1. Overview</h2>
          <p>
            By accessing or purchasing from AVELOR, you agree to be bound by these standard Terms of Service and all related company policies.
          </p>
        </div>

        <div className="pt-6 space-y-2">
          <h2 className="font-display text-base text-foreground font-medium">2. Products & Pricing</h2>
          <p>
            All prices are listed in Indian Rupees (INR) and are inclusive of applicable goods and services tax (GST). We reserve the right to correct typographical pricing discrepancies or modify fabric specifications.
          </p>
        </div>

        <div className="pt-6 space-y-2">
          <h2 className="font-display text-base text-foreground font-medium">3. Intellectual Property</h2>
          <p>
            All silhouettes, photography, typography compositions, and editorial trademarks are the proprietary intellectual property of AVELOR Atelier.
          </p>
        </div>
      </div>
    </div>
  );
}
