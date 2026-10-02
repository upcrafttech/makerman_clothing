import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — AVELOR" },
      { name: "description", content: "Our commitment to safeguarding your personal data and digital privacy." },
    ],
  }),
  component: PrivacyPage,
});

export function PrivacyPage() {
  return (
    <div className="container-page py-10 md:py-16 max-w-3xl space-y-8">
      <div>
        <p className="eyebrow text-subtle">Data & Security</p>
        <h1 className="font-display text-4xl sm:text-5xl mt-1">Privacy Policy</h1>
        <p className="mt-2 text-xs text-muted-foreground">Effective Date: January 1, 2026</p>
      </div>

      <div className="space-y-6 text-xs text-muted-foreground leading-relaxed divide-y divide-border border-y border-border py-6">
        <div className="space-y-2">
          <h2 className="font-display text-base text-foreground font-medium">1. Information We Collect</h2>
          <p>
            When you visit AVELOR or place an order, we collect essential transaction details including your name, shipping address, email, contact telephone number, and order history strictly for fulfillment and customer concierge communication.
          </p>
        </div>

        <div className="pt-6 space-y-2">
          <h2 className="font-display text-base text-foreground font-medium">2. Use of Information</h2>
          <p>
            Your information is utilized solely to process your wardrobe orders, dispatch courier tracking updates, process returns, and send voluntary register newsletters if explicitly subscribed.
          </p>
        </div>

        <div className="pt-6 space-y-2">
          <h2 className="font-display text-base text-foreground font-medium">3. Data Security & Storage</h2>
          <p>
            We do not sell, rent, or trade your personal data with third-party advertising networks. Payment credentials are encrypted using industry-standard SSL protocols and never stored on our servers.
          </p>
        </div>
      </div>
    </div>
  );
}
