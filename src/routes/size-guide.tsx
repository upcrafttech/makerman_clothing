import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/size-guide")({
  head: () => ({
    meta: [
      { title: "Size & Proportion Guide — AVELOR" },
      { name: "description", content: "Measurement charts and fitting recommendations for AVELOR garments." },
    ],
  }),
  component: SizeGuidePage,
});

export function SizeGuidePage() {
  const [activeUnit, setActiveUnit] = useState<"in" | "cm">("in");
  const [activeTab, setActiveTab] = useState<"tops" | "bottoms" | "outerwear">("tops");

  return (
    <div className="container-page py-10 md:py-16 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-border pb-6 mb-8 gap-4">
        <div>
          <p className="eyebrow text-subtle">Precision Fit</p>
          <h1 className="font-display text-4xl sm:text-5xl mt-1">Size Guide</h1>
          <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
            All measurements reflect actual garment dimensions unless specified otherwise.
          </p>
        </div>

        {/* Unit switch */}
        <div className="flex items-center border border-border p-0.5 bg-secondary/30 text-xs">
          <button
            type="button"
            onClick={() => setActiveUnit("in")}
            className={cn("px-3 py-1 font-medium transition-colors", activeUnit === "in" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground")}
          >
            Inches (in)
          </button>
          <button
            type="button"
            onClick={() => setActiveUnit("cm")}
            className={cn("px-3 py-1 font-medium transition-colors", activeUnit === "cm" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground")}
          >
            Centimeters (cm)
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border mb-6 text-xs uppercase tracking-wider font-medium">
        {[
          { id: "tops", label: "T-Shirts & Shirts" },
          { id: "bottoms", label: "Trousers & Denim" },
          { id: "outerwear", label: "Jackets & Coats" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "pb-3 border-b-2 -mb-px transition-colors",
              activeTab === tab.id ? "border-ink text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border bg-background">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-secondary/30 text-muted-foreground font-medium">
              <th className="p-3.5">Size</th>
              <th className="p-3.5">Chest / Waist</th>
              <th className="p-3.5">Shoulder</th>
              <th className="p-3.5">Length</th>
              <th className="p-3.5">Sleeve</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border font-mono">
            {activeTab === "tops" && (
              <>
                <tr><td className="p-3.5 font-sans font-medium">XS</td><td className="p-3.5">{activeUnit === "in" ? "36\"" : "91 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "17.0\"" : "43 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "27.0\"" : "68 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "8.5\"" : "21 cm"}</td></tr>
                <tr><td className="p-3.5 font-sans font-medium">S</td><td className="p-3.5">{activeUnit === "in" ? "38\"" : "96 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "17.5\"" : "44 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "27.5\"" : "70 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "8.7\"" : "22 cm"}</td></tr>
                <tr><td className="p-3.5 font-sans font-medium">M</td><td className="p-3.5">{activeUnit === "in" ? "40\"" : "101 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "18.5\"" : "47 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "28.5\"" : "72 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "9.0\"" : "23 cm"}</td></tr>
                <tr><td className="p-3.5 font-sans font-medium">L</td><td className="p-3.5">{activeUnit === "in" ? "42\"" : "106 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "19.5\"" : "49 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "29.5\"" : "75 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "9.2\"" : "23.5 cm"}</td></tr>
                <tr><td className="p-3.5 font-sans font-medium">XL</td><td className="p-3.5">{activeUnit === "in" ? "44\"" : "111 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "20.5\"" : "52 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "30.5\"" : "77 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "9.5\"" : "24 cm"}</td></tr>
              </>
            )}
            {activeTab === "bottoms" && (
              <>
                <tr><td className="p-3.5 font-sans font-medium">28</td><td className="p-3.5">{activeUnit === "in" ? "29.5\"" : "75 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "38.0\"" : "96 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "31.0\"" : "79 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "7.5\"" : "19 cm"}</td></tr>
                <tr><td className="p-3.5 font-sans font-medium">30</td><td className="p-3.5">{activeUnit === "in" ? "31.5\"" : "80 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "40.0\"" : "101 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "32.0\"" : "81 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "7.8\"" : "20 cm"}</td></tr>
                <tr><td className="p-3.5 font-sans font-medium">32</td><td className="p-3.5">{activeUnit === "in" ? "33.5\"" : "85 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "42.0\"" : "106 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "32.0\"" : "81 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "8.0\"" : "20.5 cm"}</td></tr>
                <tr><td className="p-3.5 font-sans font-medium">34</td><td className="p-3.5">{activeUnit === "in" ? "35.5\"" : "90 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "44.0\"" : "112 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "33.0\"" : "84 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "8.2\"" : "21 cm"}</td></tr>
              </>
            )}
            {activeTab === "outerwear" && (
              <>
                <tr><td className="p-3.5 font-sans font-medium">S (38)</td><td className="p-3.5">{activeUnit === "in" ? "42.5\"" : "108 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "18.5\"" : "47 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "30.0\"" : "76 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "25.5\"" : "65 cm"}</td></tr>
                <tr><td className="p-3.5 font-sans font-medium">M (40)</td><td className="p-3.5">{activeUnit === "in" ? "44.5\"" : "113 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "19.2\"" : "49 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "31.0\"" : "79 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "26.0\"" : "66 cm"}</td></tr>
                <tr><td className="p-3.5 font-sans font-medium">L (42)</td><td className="p-3.5">{activeUnit === "in" ? "46.5\"" : "118 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "20.0\"" : "51 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "31.5\"" : "80 cm"}</td><td className="p-3.5">{activeUnit === "in" ? "26.5\"" : "67 cm"}</td></tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-10 p-6 bg-secondary/30 border border-border text-xs text-muted-foreground space-y-2">
        <p className="font-medium text-foreground">Need a personalized fit recommendation?</p>
        <p>Contact our concierge team with your height, weight, and favorite garment measurements for tailored sizing advice.</p>
        <Button asChild variant="outline" size="sm" className="text-xs uppercase tracking-wider mt-2">
          <Link to="/contact">Chat with Concierge</Link>
        </Button>
      </div>
    </div>
  );
}
