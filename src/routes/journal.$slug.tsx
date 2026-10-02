import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Share2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { journalService } from "@/services";
import type { Article } from "@/types";

export const Route = createFileRoute("/journal/$slug")({
  loader: async ({ params }) => {
    const article = journalService.bySlug(params.slug);
    if (!article) {
      throw notFound();
    }
    return { article };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.article as Article | undefined;
    return {
      meta: [
        { title: a ? `${a.title} — The Journal, AVELOR` : "Article — AVELOR" },
        { name: "description", content: a?.excerpt ?? "Journal essay by AVELOR." },
      ],
    };
  },
  component: JournalArticlePage,
});

export function JournalArticlePage() {
  const { article } = Route.useLoaderData() as { article: Article };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: article.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Article link copied to clipboard.");
    }
  };

  return (
    <article className="container-page py-10 md:py-16 max-w-4xl">
      <Link
        to="/journal"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-8"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Journal
      </Link>

      <header className="space-y-4 mb-8">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="eyebrow text-accent">{article.category}</span>
          <span>·</span>
          <span>{article.date}</span>
          <span>·</span>
          <span>{article.readingTime}</span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-normal leading-tight">
          {article.title}
        </h1>

        <div className="flex items-center justify-between border-t border-b border-border py-4 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Written by</span>
            <strong className="text-foreground">{article.author}</strong>
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>
      </header>

      {/* Main Cover Image */}
      <div className="aspect-16/9 overflow-hidden bg-secondary mb-12">
        <img src={article.image} alt="" className="h-full w-full object-cover" />
      </div>

      {/* Article Body Content */}
      <div className="space-y-8 text-foreground/90 leading-relaxed text-sm sm:text-base font-light">
        <p className="text-lg sm:text-xl leading-relaxed text-foreground font-normal border-l-2 border-accent pl-6 italic">
          {article.excerpt}
        </p>

        {article.body.map((section: Article["body"][number], idx: number) => (
          <div key={idx} className="space-y-4 pt-4">
            {section.heading && (
              <h2 className="font-display text-2xl sm:text-3xl text-foreground font-normal mt-6">
                {section.heading}
              </h2>
            )}

            {section.paragraphs.map((p: string, pIdx: number) => (
              <p key={pIdx} className="leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}

            {section.image && (
              <div className="my-6 aspect-16/10 overflow-hidden bg-secondary">
                <img src={section.image} alt="" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-border mt-16 pt-8 flex justify-between items-center">
        <Button asChild variant="outline" className="text-xs uppercase tracking-wider">
          <Link to="/journal">← All Articles</Link>
        </Button>
        <Button asChild className="text-xs uppercase tracking-wider">
          <Link to="/shop">Shop The Collection →</Link>
        </Button>
      </div>
    </article>
  );
}
