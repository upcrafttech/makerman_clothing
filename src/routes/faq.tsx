import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, HelpCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { faqs } from "@/data/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — AVELOR" },
      { name: "description", content: "Answers regarding shipping, returns, fabric care, and order tracking." },
    ],
  }),
  component: FaqPage,
});

export function FaqPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState<string | null>("Orders-0");

  const categories = ["all", ...faqs.map((f) => f.category)];

  const flatFaqs = useMemo(() => {
    const list: { category: string; q: string; a: string; key: string }[] = [];
    faqs.forEach((group) => {
      group.items.forEach((item, idx) => {
        list.push({
          category: group.category,
          q: item.q,
          a: item.a,
          key: `${group.category}-${idx}`,
        });
      });
    });
    return list;
  }, []);

  const filteredFaqs = flatFaqs.filter((f) => {
    if (activeCategory !== "all" && f.category.toLowerCase() !== activeCategory.toLowerCase()) {
      return false;
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      return f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="container-page py-10 md:py-16 max-w-4xl">
      <div className="text-center max-w-xl mx-auto mb-10">
        <p className="eyebrow text-subtle">Client Assistance</p>
        <h1 className="font-display text-4xl sm:text-5xl mt-2">Frequently Asked Questions</h1>
        <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Everything you need to know about deliveries, returns, size consultations, and garment longevity.
        </p>

        {/* Search input */}
        <div className="relative mt-6 max-w-md mx-auto">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions (e.g. returns, washing, delivery)..."
            className="w-full h-11 pl-10 pr-4 border border-border bg-background text-xs outline-none focus:border-ink"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 justify-center pb-8 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-2 text-xs uppercase tracking-wider border transition-colors capitalize",
              activeCategory === cat
                ? "bg-ink text-ink-foreground border-ink font-medium"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="divide-y divide-border border-y border-border">
        {filteredFaqs.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No matching questions found for "{query}".
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openIndex === faq.key;
            return (
              <div key={faq.key} className="py-4">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : faq.key)}
                  className="flex w-full items-center justify-between text-left gap-4"
                >
                  <span className="font-display text-base sm:text-lg font-medium">{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      isOpen ? "rotate-180 text-foreground" : ""
                    )}
                  />
                </button>
                {isOpen && (
                  <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed pr-8">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still need help CTA */}
      <div className="mt-16 p-8 border border-border bg-secondary/30 text-center max-w-md mx-auto space-y-3">
        <HelpCircle className="h-6 w-6 text-accent mx-auto" />
        <h3 className="font-display text-xl">Have a specific question?</h3>
        <p className="text-xs text-muted-foreground">
          Our client concierge team is ready to assist with sizing advice or special requests.
        </p>
        <Button asChild variant="outline" className="text-xs uppercase tracking-wider mt-2">
          <Link to="/contact">Contact Concierge</Link>
        </Button>
      </div>
    </div>
  );
}
