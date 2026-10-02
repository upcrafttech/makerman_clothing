import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Youtube } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRAND } from "@/data/content";
import { cn } from "@/lib/utils";

const GROUPS: { title: string; links: { label: string; to: string; search?: Record<string, string> }[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "All products", to: "/shop" },
      { label: "Women", to: "/shop", search: { gender: "women" } },
      { label: "Men", to: "/shop", search: { gender: "men" } },
      { label: "Accessories", to: "/shop", search: { category: "accessories" } },
    ],
  },
  {
    title: "Collections",
    links: [
      { label: "New Arrivals", to: "/collections/new-arrivals" },
      { label: "Essentials", to: "/collections/essentials" },
      { label: "Studio Tailoring", to: "/collections/studio-tailoring" },
      { label: "Denim Study", to: "/collections/denim-study" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Contact", to: "/contact" },
      { label: "FAQ", to: "/faq" },
      { label: "Shipping", to: "/shipping" },
      { label: "Returns & Exchanges", to: "/returns" },
      { label: "Size Guide", to: "/size-guide" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our story", to: "/about" },
      { label: "Journal", to: "/journal" },
      { label: "Style quiz", to: "/style-quiz" },
      { label: "Compare", to: "/compare" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy" },
      { label: "Terms & Conditions", to: "/terms" },
      { label: "Shipping Policy", to: "/shipping" },
      { label: "Refund Policy", to: "/returns" },
      { label: "Cookie Policy", to: "/cookies" },
    ],
  },
];

export function Footer() {
  const [open, setOpen] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="container-page grid gap-12 py-12 md:py-16 lg:grid-cols-[1.1fr_2fr]">
        <div>
          <p className="font-display text-2xl tracking-[0.32em] uppercase">Avelor</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Modern essentials, refined through considered materials and timeless silhouettes. Designed in
            Mumbai, made in India.
          </p>
          <form
            className="mt-7 max-w-sm"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^\S+@\S+\.\S+$/.test(email)) {
                toast.error("Enter a valid email address");
                return;
              }
              toast.success("You're on the list", { description: "Look out for our next dispatch." });
              setEmail("");
            }}
          >
            <label htmlFor="footer-email" className="eyebrow text-subtle">
              Newsletter
            </label>
            <div className="mt-3 flex gap-2">
              <Input
                id="footer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="h-11 rounded-none border-border bg-background"
              />
              <Button type="submit" className="shrink-0">
                Subscribe
              </Button>
            </div>
          </form>
          <div className="mt-7 flex gap-1">
            {[Instagram, Twitter, Youtube].map((Icon, i) => (
              <a
                key={i}
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer noopener"
                aria-label={["Instagram", "Twitter", "YouTube"][i]}
                className="grid h-11 w-11 place-items-center text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.3} />
              </a>
            ))}
          </div>
        </div>

        {/* Desktop columns */}
        <div className="hidden grid-cols-2 gap-8 md:grid lg:grid-cols-5">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <p className="eyebrow mb-4 text-subtle">{group.title}</p>
              <ul className="grid gap-2.5">
                {group.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      search={l.search as never}
                      className="link-underline text-sm text-muted-foreground hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Mobile accordion */}
        <div className="md:hidden">
          {GROUPS.map((group) => {
            const isOpen = open === group.title;
            return (
              <div key={group.title} className="border-b border-border">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : group.title)}
                  aria-expanded={isOpen}
                  className="flex min-h-[3.25rem] w-full items-center justify-between text-left text-sm"
                >
                  {group.title}
                  <span className={cn("text-lg transition-transform duration-300", isOpen && "rotate-45")}>
                    +
                  </span>
                </button>
                <div className={cn("grid overflow-hidden transition-all duration-300", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <ul className="min-h-0 overflow-hidden">
                    {group.links.map((l) => (
                      <li key={l.label}>
                        <Link
                          to={l.to}
                          search={l.search as never}
                          className="flex min-h-11 items-center text-sm text-muted-foreground"
                        >
                          {l.label}
                        </Link>
                      </li>
                    ))}
                    <li className="h-2" />
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} AVELOR Studio Pvt. Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>Free shipping above ₹1,999</span>
            <span className="hidden sm:inline">·</span>
            <span>UPI · Cards · Net Banking · COD</span>
          </div>
          <p>{BRAND.address}</p>
        </div>
      </div>
    </footer>
  );
}
