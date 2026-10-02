import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { journalService } from "@/services";
import type { Article } from "@/types";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "The Journal — AVELOR" },
      { name: "description", content: "Essays on material culture, tailoring history, and design studies by AVELOR." },
    ],
  }),
  component: JournalIndexPage,
});

export function JournalIndexPage() {
  const articles: Article[] = journalService.all();
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories: string[] = ["All", ...Array.from(new Set(articles.map((a: Article) => a.category)))];
  const filtered: Article[] =
    activeCategory === "All" ? articles : articles.filter((a: Article) => a.category === activeCategory);

  const featured = articles[0]!;

  return (
    <div className="container-page py-10 md:py-16">
      {/* Header */}
      <div className="max-w-2xl mb-12">
        <p className="eyebrow text-subtle">Editorial Essays</p>
        <h1 className="font-display text-4xl sm:text-6xl mt-2">The Journal</h1>
        <p className="mt-4 text-xs sm:text-base text-muted-foreground leading-relaxed">
          Inquiries into fabric provenance, textile history, pattern construction, and considered living.
        </p>
      </div>

      {/* Featured Lead Article */}
      <div className="border-b border-border pb-12 mb-12">
        <Link
          to="/journal/$slug"
          params={{ slug: featured.slug }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center group"
        >
          <div className="lg:col-span-7 aspect-16/10 overflow-hidden bg-secondary">
            <img
              src={featured.image}
              alt={featured.title}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="eyebrow text-accent">{featured.category}</span>
              <span>·</span>
              <span>{featured.date}</span>
              <span>·</span>
              <span>{featured.readingTime}</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl group-hover:underline underline-offset-4 leading-tight">
              {featured.title}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {featured.excerpt}
            </p>

            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-medium text-foreground pt-2">
              Read Essay <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 pb-8 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-2 text-xs uppercase tracking-wider transition-colors border",
              activeCategory === cat
                ? "bg-ink text-ink-foreground border-ink font-medium"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Article Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((art: Article) => (
          <Link
            key={art.slug}
            to="/journal/$slug"
            params={{ slug: art.slug }}
            className="group block space-y-4"
          >
            <div className="aspect-16/10 overflow-hidden bg-secondary">
              <img
                src={art.image}
                alt={art.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="eyebrow text-accent">{art.category}</span>
                <span>·</span>
                <span>{art.readingTime}</span>
              </div>

              <h3 className="font-display text-xl group-hover:underline leading-snug">
                {art.title}
              </h3>

              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {art.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
