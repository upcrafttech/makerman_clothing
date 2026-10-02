import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Compass, Feather, HeartHandshake, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — AVELOR" },
      { name: "description", content: "The philosophy, atelier standards, and material commitments of AVELOR." },
    ],
  }),
  component: AboutPage,
});

export function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Editorial Hero */}
      <section className="relative min-h-[60vh] flex items-end bg-secondary overflow-hidden">
        <img
          src="/images/story-1.jpg"
          alt="AVELOR Atelier"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.8]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="container-page relative z-10 pb-12 pt-28 text-white">
          <div className="max-w-2xl">
            <span className="eyebrow tracking-[0.25em] text-white/80 uppercase mb-3 inline-block">
              Foundational Principles
            </span>
            <h1 className="font-display text-4xl sm:text-6xl text-white font-normal leading-tight">
              Quiet distinction in every stitch.
            </h1>
            <p className="mt-4 text-sm sm:text-base text-white/80 max-w-xl font-light leading-relaxed">
              AVELOR exists to create enduring garments of uncompromised fabric quality, balanced proportions, and understated aesthetics.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="section-y bg-background">
        <div className="container-page">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="eyebrow text-subtle">Origin & Intent</span>
              <h2 className="font-display text-3xl sm:text-4xl">
                Clothing built for long days and repeat wear.
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Founded in 2024, AVELOR began as a reaction against hyper-speed fashion cycles and disposable trends. We asked a simple question: what makes a piece of clothing something you choose to reach for morning after morning?
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The answer lay not in loud branding, but in the subtle mastery of weight, collar stance, shoulder pitch, and tactile yarn density. We work directly with heritage mills across India, Portugal, and Japan to develop custom-spun textiles that age with character.
              </p>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="aspect-3/4 overflow-hidden bg-secondary">
                <img src="/images/editorial-1.jpg" alt="" className="h-full w-full object-cover" />
              </div>
              <div className="aspect-3/4 overflow-hidden bg-secondary mt-8">
                <img src="/images/detail-fabric.jpg" alt="" className="h-full w-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 bg-secondary/40 border-y border-border">
        <div className="container-page">
          <div className="max-w-xl mb-12">
            <p className="eyebrow text-subtle">Core Commitments</p>
            <h2 className="font-display text-3xl mt-1">Our Making Standards</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-background border border-border space-y-3">
              <Feather className="h-6 w-6 text-accent" strokeWidth={1.4} />
              <h3 className="font-display text-lg">Natural & Traceable Fibers</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We prioritize GOTS-certified organic cotton, mulesing-free merino wool, European flax linen, and natural corozo nut buttons.
              </p>
            </div>

            <div className="p-6 bg-background border border-border space-y-3">
              <Compass className="h-6 w-6 text-accent" strokeWidth={1.4} />
              <h3 className="font-display text-lg">Architectural Cuts</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every pattern block is sampled through dozens of iterations to guarantee natural ease of movement without sloppy volume.
              </p>
            </div>

            <div className="p-6 bg-background border border-border space-y-3">
              <HeartHandshake className="h-6 w-6 text-accent" strokeWidth={1.4} />
              <h3 className="font-display text-lg">Ethical Production</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We partner with specialized manufacturing units ensuring fair living wages, safe workshop conditions, and zero hazardous chemicals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center container-page max-w-xl mx-auto">
        <h2 className="font-display text-3xl sm:text-4xl">Experience the Collection</h2>
        <p className="mt-3 text-xs sm:text-sm text-muted-foreground">
          Discover our newest tailoring, heavyweight essentials, and washed denim.
        </p>
        <Button asChild className="mt-8 h-12 px-8 text-xs uppercase tracking-wider">
          <Link to="/shop">Explore The Catalog <ArrowRight className="h-3.5 w-3.5 ml-2" /></Link>
        </Button>
      </section>
    </div>
  );
}
