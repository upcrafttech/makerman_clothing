import { createFileRoute } from "@tanstack/react-router";
import {
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { BRAND, faqs } from "@/data/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us & FAQ — MAKERMAN | Feeling Happiness" },
      {
        name: "description",
        content:
          "Connect with the Makerman client concierge for orders, fit consultations, or tailoring inquiries.",
      },
      { property: "og:title", content: "Contact Makerman Client Concierge" },
    ],
  }),
  component: ContactPage,
});

export function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    orderNumber: "",
    subject: "Order Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>("Orders-0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitted(true);
    toast.success("Thank you for contacting Makerman. Our concierge will respond within 4 hours.");
  };

  return (
    <div className="min-h-screen bg-background py-10 md:py-16">
      <div className="container-page max-w-5xl">
        {/* Hero Section */}
        <div className="max-w-2xl mb-12">
          <p className="eyebrow text-amber-600 font-semibold tracking-widest">
            Client Concierge
          </p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-normal text-foreground mt-2">
            Contact Makerman
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Our atelier team in Mumbai is available Monday through Saturday, 10:00 AM – 7:00 PM IST for sizing advice, order status, custom inquiries, or general support.
          </p>
        </div>

        {/* 3 Quick Action Concierge CTAs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {/* WhatsApp CTA */}
          <a
            href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}?text=Hi%20Makerman%20team,%20I%20have%20an%20inquiry`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 border border-border rounded-sm bg-[#FAF8F5] hover:border-foreground/50 transition-all flex items-center gap-4 group"
          >
            <div className="h-11 w-11 rounded-full bg-emerald-100 text-emerald-800 grid place-items-center shrink-0">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground group-hover:text-emerald-800 transition-colors">
                WhatsApp Chat
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{BRAND.whatsapp}</p>
              <span className="text-[10px] text-emerald-700 font-medium">Instant replies · 10am–7pm</span>
            </div>
          </a>

          {/* Phone Call CTA */}
          <a
            href={`tel:${BRAND.phone.replace(/\s+/g, "")}`}
            className="p-5 border border-border rounded-sm bg-[#FAF8F5] hover:border-foreground/50 transition-all flex items-center gap-4 group"
          >
            <div className="h-11 w-11 rounded-full bg-amber-100 text-amber-800 grid place-items-center shrink-0">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground group-hover:text-amber-800 transition-colors">
                Phone Support
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{BRAND.phone}</p>
              <span className="text-[10px] text-muted-foreground">Mon–Sat 10:00 AM – 7:00 PM IST</span>
            </div>
          </a>

          {/* Email CTA */}
          <a
            href={`mailto:${BRAND.email}`}
            className="p-5 border border-border rounded-sm bg-[#FAF8F5] hover:border-foreground/50 transition-all flex items-center gap-4 group"
          >
            <div className="h-11 w-11 rounded-full bg-neutral-200 text-neutral-800 grid place-items-center shrink-0">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground group-hover:text-foreground transition-colors">
                Email Atelier
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{BRAND.email}</p>
              <span className="text-[10px] text-muted-foreground">Detailed responses under 4 hours</span>
            </div>
          </a>
        </div>

        {/* Main Grid: Contact Form + Studio Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-20">
          {/* Contact Form */}
          <div className="lg:col-span-7 border border-border p-6 sm:p-8 bg-background rounded-sm shadow-soft">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-secondary grid place-items-center mx-auto text-amber-600">
                  <Send className="h-5 w-5" />
                </div>
                <h2 className="font-display text-2xl text-foreground font-normal">Message Received</h2>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out, {form.name}. A client associate at Makerman Atelier will review your inquiry and reply shortly.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", phone: "", orderNumber: "", subject: "Order Inquiry", message: "" });
                  }}
                  className="mt-4 text-xs font-semibold uppercase tracking-wider border-border"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Rahul Verma"
                      className="w-full h-11 border border-border px-3 rounded-sm outline-none focus:border-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="rahul@example.com"
                      className="w-full h-11 border border-border px-3 rounded-sm outline-none focus:border-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider">
                      Phone Number (+91)
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98204 00000"
                      className="w-full h-11 border border-border px-3 rounded-sm outline-none focus:border-foreground font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider">
                      Order Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={form.orderNumber}
                      onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                      placeholder="e.g. MK-2026-1042"
                      className="w-full h-11 border border-border px-3 rounded-sm outline-none focus:border-foreground uppercase font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider">
                    Subject
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full h-11 border border-border px-3 rounded-sm outline-none focus:border-foreground bg-background"
                  >
                    <option value="Order Inquiry">Order Inquiry & Tracking</option>
                    <option value="Size Consultation">Size & Fit Guidance</option>
                    <option value="Returns & Exchange">Returns & Exchange Request</option>
                    <option value="Fabric & Product Details">Fabric & Care Details</option>
                    <option value="Corporate / Gifting">Corporate / Bulk Gifting</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground block mb-1 uppercase tracking-wider">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="How can our concierge assist you today?"
                    className="w-full border border-border p-3 rounded-sm outline-none focus:border-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-xs font-semibold uppercase tracking-[0.14em] bg-ink text-ink-foreground hover:bg-ink/90 rounded-sm"
                >
                  Send Message to Concierge
                </Button>
              </form>
            )}
          </div>

          {/* Atelier Info Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 border border-border rounded-sm bg-[#FAF8F5] space-y-4">
              <h3 className="font-display text-lg font-normal text-foreground">Makerman Atelier</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Unit 4, Kamala Mills Compound, Lower Parel, Mumbai, Maharashtra 400013, India
              </p>

              <div className="border-t border-border/80 pt-4 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>Mon – Sat: 10:00 AM – 7:00 PM IST</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-amber-600" />
                  <span>{BRAND.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-amber-600" />
                  <span>{BRAND.email}</span>
                </div>
              </div>
            </div>

            <div className="p-5 border border-border rounded-sm bg-background text-xs space-y-2 text-muted-foreground">
              <p className="font-semibold text-foreground uppercase tracking-wider">Complimentary Sizing & Fit Consults</p>
              <p className="leading-relaxed">
                Not sure about shoulders or trouser lengths? Message our master tailor on WhatsApp with your height, chest, and waist measurements for personalized sizing suggestions.
              </p>
            </div>
          </div>
        </div>

        {/* Compact Integrated FAQ Accordion Section (Per Section 14) */}
        <div className="border-t border-border pt-12">
          <div className="max-w-3xl mb-8">
            <p className="eyebrow text-amber-600 font-semibold tracking-widest">
              Frequently Asked Questions
            </p>
            <h2 className="font-display text-2xl sm:text-4xl text-foreground font-normal mt-1">
              Common Questions & Answers
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Everything you need to know about deliveries, returns, fabrics, and orders.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((group) => (
              <div key={group.category} className="border border-border rounded-sm bg-[#FAF8F5]/50 overflow-hidden">
                <div className="bg-[#FAF8F5] px-5 py-3 border-b border-border/80">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    {group.category}
                  </p>
                </div>
                <div className="divide-y divide-border/60">
                  {group.items.map((item, idx) => {
                    const key = `${group.category}-${idx}`;
                    const isOpen = openFaq === key;

                    return (
                      <div key={idx} className="p-4 sm:p-5">
                        <button
                          type="button"
                          onClick={() => setOpenFaq(isOpen ? null : key)}
                          className="flex w-full items-center justify-between text-xs font-semibold text-left text-foreground"
                        >
                          <span className="pr-4">{item.q}</span>
                          <ChevronDown
                            className={cn(
                              "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
                              isOpen ? "rotate-180" : "",
                            )}
                          />
                        </button>
                        {isOpen && (
                          <div className="mt-2 text-xs text-muted-foreground leading-relaxed animate-in fade-in-50">
                            {item.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
