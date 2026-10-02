import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: "Cookie Settings & Policy — AVELOR" },
      { name: "description", content: "Details on how session tokens and local storage are utilized on AVELOR." },
    ],
  }),
  component: CookiesPage,
});

export function CookiesPage() {
  return (
    <div className="container-page py-10 md:py-16 max-w-3xl space-y-8">
      <div>
        <p className="eyebrow text-subtle">Digital Preferences</p>
        <h1 className="font-display text-4xl sm:text-5xl mt-1">Cookie Policy</h1>
        <p className="mt-2 text-xs text-muted-foreground">Effective Date: January 1, 2026</p>
      </div>

      <div className="space-y-6 text-xs text-muted-foreground leading-relaxed divide-y divide-border border-y border-border py-6">
        <div className="space-y-2">
          <h2 className="font-display text-base text-foreground font-medium">1. Essential Local Storage</h2>
          <p>
            We use localized browser storage to remember items saved in your shopping bag, your curated wishlist, and active filter selections between page reloads.
          </p>
        </div>

        <div className="pt-6 space-y-2">
          <h2 className="font-display text-base text-foreground font-medium">2. Analytical Tokens</h2>
          <p>
            Anonymized performance measurements help us evaluate catalog navigation speed and optimize checkout responsiveness across devices.
          </p>
        </div>
      </div>
    </div>
  );
}
