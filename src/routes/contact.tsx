import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { BRAND } from "@/data/content";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Client Concierge — AVELOR" },
      { name: "description", content: "Get in touch with the AVELOR atelier team for orders, fitting advice, or inquiries." },
    ],
  }),
  component: ContactPage,
});

export function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    orderId: "",
    subject: "Order Inquiry",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitted(true);
    toast.success("Your message has been received. Our concierge will respond within 4 hours.");
  };

  return (
    <div className="container-page py-10 md:py-16">
      <div className="max-w-2xl mb-12">
        <p className="eyebrow text-subtle">Client Concierge</p>
        <h1 className="font-display text-4xl sm:text-6xl mt-2">Get in Touch</h1>
        <p className="mt-4 text-xs sm:text-base text-muted-foreground leading-relaxed">
          Our Mumbai studio team is available Monday through Saturday, 10:00 AM – 7:00 PM IST for fit guidance, order status, or tailoring inquiries.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7 border border-border p-6 sm:p-8 bg-background">
          {submitted ? (
            <div className="py-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-secondary grid place-items-center mx-auto text-accent">
                <Send className="h-5 w-5" />
              </div>
              <h2 className="font-display text-2xl">Message Received</h2>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Thank you for reaching out, {form.name}. A client associate has been assigned to your ticket.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: "", email: "", orderId: "", subject: "Order Inquiry", message: "" });
                }}
                className="mt-4 text-xs uppercase tracking-wider"
              >
                Send Another Note
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Maya Sen"
                    className="w-full h-11 border border-border px-3 outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="maya@example.com"
                    className="w-full h-11 border border-border px-3 outline-none focus:border-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Subject</label>
                  <select
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full h-11 border border-border px-3 bg-background outline-none focus:border-ink cursor-pointer"
                  >
                    <option value="Order Inquiry">Order & Delivery Inquiry</option>
                    <option value="Size & Fit Consultation">Size & Fit Consultation</option>
                    <option value="Return or Exchange">Return or Exchange Request</option>
                    <option value="Press & Archival">Press & Editorial Inquiries</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground block mb-1">Order Reference (Optional)</label>
                  <input
                    type="text"
                    value={form.orderId}
                    onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                    placeholder="e.g. AV-2026-8941"
                    className="w-full h-11 border border-border px-3 outline-none focus:border-ink font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground block mb-1">Message *</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can our atelier assist you today?"
                  className="w-full p-3 border border-border outline-none focus:border-ink resize-none"
                />
              </div>

              <Button type="submit" className="w-full h-12 text-xs uppercase tracking-[0.14em] font-medium">
                Dispatch Message
              </Button>
            </form>
          )}
        </div>

        {/* Studio Channels info */}
        <div className="lg:col-span-5 space-y-6 text-xs">
          <div className="border border-border p-6 bg-secondary/30 space-y-4">
            <h3 className="font-display text-lg">Direct Channels</h3>
            
            <div className="space-y-3">
              <a
                href={`mailto:${BRAND.email}`}
                className="flex items-start gap-3 p-3 border border-border bg-background hover:border-foreground/40 transition-colors"
              >
                <Mail className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Email Support</p>
                  <p className="text-muted-foreground text-[11px]">{BRAND.email}</p>
                </div>
              </a>

              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 border border-border bg-background hover:border-foreground/40 transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">WhatsApp Concierge</p>
                  <p className="text-muted-foreground text-[11px]">{BRAND.whatsapp}</p>
                </div>
              </a>

              <div className="flex items-start gap-3 p-3 border border-border bg-background">
                <MapPin className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Design Studio & Fitting Room</p>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">{BRAND.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
