import { Link } from "@tanstack/react-router";
import { ChevronDown, Instagram, Facebook, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { MakermanLogo } from "@/components/layout/makerman-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BRAND } from "@/data/content";
import { cn } from "@/lib/utils";

type PolicyType = "shipping" | "returns" | "privacy" | "terms" | null;

export function Footer() {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);

  const toggleAccordion = (title: string) => {
    setOpenGroup(openGroup === title ? null : title);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    toast.success("Welcome to Makerman World", {
      description: "You will be first to receive news of new drops and curated collections.",
    });
    setEmail("");
  };

  const policyContent = {
    shipping: {
      title: "Shipping & Pan-India Delivery",
      description: "Express pan-India delivery details and timelines.",
      content: (
        <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
          <p>
            <strong>Pan-India Delivery:</strong> We ship across all serviceable PIN codes in India. Metro deliveries typically arrive within 2–3 business days. Rest of India takes 4–6 business days.
          </p>
          <p>
            <strong>Complimentary Shipping:</strong> Enjoy free express shipping on all orders over ₹1,999. For orders under ₹1,999, a flat delivery fee of ₹99 is charged.
          </p>
          <p>
            <strong>Eco-Minded Packaging:</strong> Every Makerman garment is hand-folded, wrapped in archival tissue, and shipped in 100% recyclable tamper-evident mailers.
          </p>
          <p>
            <strong>Tracking:</strong> Real-time SMS and email tracking links are sent upon dispatch.
          </p>
        </div>
      ),
    },
    returns: {
      title: "Returns & Exchanges",
      description: "15-day hassle-free return and exchange policy.",
      content: (
        <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
          <p>
            <strong>15-Day Policy:</strong> If a piece does not fit or meet your expectations, request a return or exchange within 15 days of delivery.
          </p>
          <p>
            <strong>Free First Exchange:</strong> Your first exchange for size or color on any order is completely free with complimentary doorstep pickup.
          </p>
          <p>
            <strong>Condition:</strong> Garments must be unworn, unwashed, and returned with original tags attached.
          </p>
          <p>
            <strong>Fast Refunds:</strong> Refunds are initiated within 48 hours of inspection at our Mumbai studio directly to your original payment method.
          </p>
        </div>
      ),
    },
    privacy: {
      title: "Privacy & Data Protection",
      description: "How Makerman protects your personal information.",
      content: (
        <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
          <p>
            <strong>Your Privacy:</strong> Makerman values your trust. We collect only essential details required for delivery and concierge support (name, contact number, shipping address, and email).
          </p>
          <p>
            <strong>Payment Security:</strong> Payment transactions are encrypted via 256-bit SSL protocols. We never store credit/debit card numbers or UPI PINs on our servers.
          </p>
          <p>
            <strong>Zero Spam:</strong> We will never sell, rent, or trade your data to third parties.
          </p>
        </div>
      ),
    },
    terms: {
      title: "Terms of Service",
      description: "Terms governing shopping and browsing at Makerman.",
      content: (
        <div className="space-y-4 text-sm text-foreground/80 leading-relaxed">
          <p>
            <strong>Authentic Merchandise:</strong> All apparel offered on this website is genuine Makerman Clothing, designed and produced in India.
          </p>
          <p>
            <strong>Pricing & Taxes:</strong> All displayed prices are inclusive of GST (Goods and Services Tax) in Indian Rupees (₹).
          </p>
          <p>
            <strong>Customer Concierge:</strong> Reach our Mumbai studio concierge via email at {BRAND.email} or WhatsApp at {BRAND.phone}.
          </p>
        </div>
      ),
    },
  };

  return (
    <>
      <footer className="mt-20 border-t border-border bg-[#FAF8F5] text-foreground">
        {/* Upper Trust Strip */}
        <div className="border-b border-border/60 py-6">
          <div className="container-page grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <Truck className="h-5 w-5 text-amber-600 shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-semibold tracking-wider uppercase">Pan-India Express</p>
                <p className="text-[0.75rem] text-muted-foreground">Free shipping on orders above ₹1,999</p>
              </div>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <RotateCcw className="h-5 w-5 text-amber-600 shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-semibold tracking-wider uppercase">Easy 15-Day Returns</p>
                <p className="text-[0.75rem] text-muted-foreground">Free first exchange with doorstep pickup</p>
              </div>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-semibold tracking-wider uppercase">100% Genuine Apparel</p>
                <p className="text-[0.75rem] text-muted-foreground">Crafted with long-staple Indian fabrics</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="container-page py-12 lg:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
            
            {/* Brand Column */}
            <div className="space-y-4 text-center lg:text-left">
              <div className="inline-block">
                <MakermanLogo size="md" />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground max-w-sm mx-auto lg:mx-0">
                Premium Indian clothing brand crafted with refined silhouettes, durable fabrics, and meticulous attention to detail.
              </p>
              <div className="pt-2">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-widest text-foreground">
                  Feeling Happiness
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Atelier: Mumbai, Maharashtra, India
                </p>
              </div>
            </div>

            {/* Desktop Column 1: SHOP */}
            <div className="hidden lg:block space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                SHOP
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link to="/store" search={{ collection: "new-arrivals" }} className="hover:text-foreground transition-colors">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link to="/store" search={{ gender: "men" }} className="hover:text-foreground transition-colors">
                    Men's Collection
                  </Link>
                </li>
                <li>
                  <Link to="/store" search={{ gender: "women" }} className="hover:text-foreground transition-colors">
                    Women's Collection
                  </Link>
                </li>
                <li>
                  <Link to="/store" className="hover:text-foreground transition-colors">
                    All Garments
                  </Link>
                </li>
              </ul>
            </div>

            {/* Desktop Column 2: HELP & SERVICE */}
            <div className="hidden lg:block space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground">
                HELP
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li>
                  <Link to="/contact" className="hover:text-foreground transition-colors">
                    Contact Concierge & FAQ
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActivePolicy("shipping")}
                    className="hover:text-foreground transition-colors text-left"
                  >
                    Shipping Information
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActivePolicy("returns")}
                    className="hover:text-foreground transition-colors text-left"
                  >
                    Returns & Exchanges
                  </button>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors text-left"
                  >
                    WhatsApp Support
                  </a>
                </li>
              </ul>
            </div>

            {/* Desktop Column 3: ACCOUNT & NEWSLETTER */}
            <div className="hidden lg:block space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground mb-3">
                  ACCOUNT
                </p>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li>
                    <Link to="/account" className="hover:text-foreground transition-colors">
                      My Account & Orders
                    </Link>
                  </li>
                  <li>
                    <Link to="/favorites" className="hover:text-foreground transition-colors">
                      My Favorites
                    </Link>
                  </li>
                  <li>
                    <Link to="/cart" className="hover:text-foreground transition-colors">
                      Shopping Bag
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Compact Newsletter */}
              <div className="pt-2">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-foreground mb-2">
                  Stay Informed
                </p>
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email"
                    className="h-9 text-xs rounded-sm bg-background border-border"
                  />
                  <Button type="submit" size="sm" className="h-9 px-3 text-xs bg-ink text-ink-foreground hover:bg-ink/90">
                    Join
                  </Button>
                </form>
              </div>
            </div>

            {/* Mobile Accordions for Shop / Help / Account */}
            <div className="lg:hidden space-y-2 border-t border-border/80 pt-4">
              {/* Mobile Shop Accordion */}
              <div className="border-b border-border/60 pb-2">
                <button
                  type="button"
                  onClick={() => toggleAccordion("shop")}
                  className="flex w-full items-center justify-between py-2 text-xs font-semibold uppercase tracking-wider text-foreground"
                >
                  <span>SHOP</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      openGroup === "shop" ? "rotate-180" : "",
                    )}
                  />
                </button>
                {openGroup === "shop" && (
                  <div className="space-y-2.5 pb-3 pt-1 text-xs text-muted-foreground animate-in fade-in-50">
                    <p><Link to="/store" search={{ collection: "new-arrivals" }}>New Arrivals</Link></p>
                    <p><Link to="/store" search={{ gender: "men" }}>Men's Collection</Link></p>
                    <p><Link to="/store" search={{ gender: "women" }}>Women's Collection</Link></p>
                    <p><Link to="/store">All Garments</Link></p>
                  </div>
                )}
              </div>

              {/* Mobile Help Accordion */}
              <div className="border-b border-border/60 pb-2">
                <button
                  type="button"
                  onClick={() => toggleAccordion("help")}
                  className="flex w-full items-center justify-between py-2 text-xs font-semibold uppercase tracking-wider text-foreground"
                >
                  <span>HELP & POLICIES</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      openGroup === "help" ? "rotate-180" : "",
                    )}
                  />
                </button>
                {openGroup === "help" && (
                  <div className="space-y-2.5 pb-3 pt-1 text-xs text-muted-foreground animate-in fade-in-50">
                    <p><Link to="/contact">Contact Concierge & FAQ</Link></p>
                    <p><button type="button" onClick={() => setActivePolicy("shipping")}>Shipping Policy</button></p>
                    <p><button type="button" onClick={() => setActivePolicy("returns")}>Returns & Exchanges</button></p>
                    <p><a href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">WhatsApp Support</a></p>
                  </div>
                )}
              </div>

              {/* Mobile Account Accordion */}
              <div className="border-b border-border/60 pb-2">
                <button
                  type="button"
                  onClick={() => toggleAccordion("account")}
                  className="flex w-full items-center justify-between py-2 text-xs font-semibold uppercase tracking-wider text-foreground"
                >
                  <span>ACCOUNT & BAG</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      openGroup === "account" ? "rotate-180" : "",
                    )}
                  />
                </button>
                {openGroup === "account" && (
                  <div className="space-y-2.5 pb-3 pt-1 text-xs text-muted-foreground animate-in fade-in-50">
                    <p><Link to="/account">My Account & Orders</Link></p>
                    <p><Link to="/favorites">Favorites</Link></p>
                    <p><Link to="/cart">Shopping Bag</Link></p>
                  </div>
                )}
              </div>

              {/* Mobile Newsletter */}
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground mb-2">
                  Join The Makerman World
                </p>
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="h-10 text-xs rounded-sm bg-background border-border"
                  />
                  <Button type="submit" className="h-10 px-4 text-xs bg-ink text-ink-foreground">
                    Join
                  </Button>
                </form>
              </div>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Legal Modals */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} MAKERMAN CLOTHING. All rights reserved.</p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 text-[0.75rem]">
              <button
                type="button"
                onClick={() => setActivePolicy("privacy")}
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setActivePolicy("terms")}
                className="hover:text-foreground transition-colors"
              >
                Terms of Service
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setActivePolicy("shipping")}
                className="hover:text-foreground transition-colors"
              >
                Shipping Terms
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => setActivePolicy("returns")}
                className="hover:text-foreground transition-colors"
              >
                Return Policy
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Lightweight Policy Dialog */}
      <Dialog open={activePolicy !== null} onOpenChange={(open) => !open && setActivePolicy(null)}>
        <DialogContent className="max-w-lg p-6 max-h-[85vh] overflow-y-auto">
          {activePolicy && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  {policyContent[activePolicy].title}
                </DialogTitle>
                <DialogDescription>
                  {policyContent[activePolicy].description}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                {policyContent[activePolicy].content}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
