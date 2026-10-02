import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Compass, RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";

import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { productService } from "@/services";

export const Route = createFileRoute("/style-quiz")({
  head: () => ({
    meta: [
      { title: "Style & Wardrobe Consultation — AVELOR" },
      { name: "description", content: "Find your ideal silhouette and curated clothing recommendations in 60 seconds." },
    ],
  }),
  component: StyleQuizPage,
});

const QUESTIONS = [
  {
    id: "silhouette",
    title: "How do you prefer your everyday silhouettes to fall?",
    options: [
      { id: "minimal", label: "Clean & Boxy", desc: "Structured shoulders, relaxed chest, clean straight lines." },
      { id: "classic", label: "Tailored & Fluid", desc: "Draped wools, unstructured blazers, tapered leg profiles." },
      { id: "relaxed", label: "Oversized & Easy", desc: "Drop shoulders, generous volume, soft washed cottons." },
      { id: "street", label: "Utilitarian & Layered", desc: "Overshirts, dense denim, multi-pocket functionality." },
    ],
  },
  {
    id: "palette",
    title: "Which color atmosphere best defines your wardrobe?",
    options: [
      { id: "warm", label: "Warm Neutrals", desc: "Ecru, sand, bone, raw clay and unbleached cotton." },
      { id: "dark", label: "Monochrome & Slate", desc: "Charcoal, deep ink black, heather graphite." },
      { id: "earth", label: "Subtle Earth & Indigo", desc: "Washed olive, raw Japanese indigo, washed chalk." },
    ],
  },
  {
    id: "setting",
    title: "What is your most frequent environment?",
    options: [
      { id: "studio", label: "Creative Studio & Workspace", desc: "Refined everyday pieces that look composed on camera and in person." },
      { id: "evening", label: "Dinner & Cultural Outings", desc: "Architectural shapes, darker palettes, crisp textural details." },
      { id: "casual", label: "Transit & Weekend Leisure", desc: "Heavyweight jersey tees, durable denim, effortless layers." },
    ],
  },
];

export function StyleQuizPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);

  const currentQ = QUESTIONS[currentStep];

  const handleSelectOption = (optId: string) => {
    const nextAnswers = { ...answers, [currentQ!.id]: optId };
    setAnswers(nextAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
    setCompleted(false);
  };

  const recommendedProducts = completed
    ? productService.recommendByStyle(answers["silhouette"] ?? "minimal", 4)
    : [];

  return (
    <div className="container-page py-10 md:py-16 max-w-4xl">
      {!completed ? (
        <div className="max-w-xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="eyebrow text-accent flex items-center justify-center gap-1">
              <Sparkles className="h-3.5 w-3.5" /> Style Consultation
            </span>
            <h1 className="font-display text-3xl sm:text-4xl">Curate Your Uniform</h1>
            <p className="text-xs text-muted-foreground">
              Answer 3 brief questions to receive custom silhouette and garment recommendations.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>Step {currentStep + 1} of {QUESTIONS.length}</span>
              <span>{Math.round(((currentStep + 1) / QUESTIONS.length) * 100)}%</span>
            </div>
            <div className="h-1 bg-border w-full rounded-full overflow-hidden">
              <div
                className="h-full bg-ink transition-all duration-300"
                style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Box */}
          <div className="border border-border p-6 sm:p-8 bg-background space-y-6">
            <h2 className="font-display text-xl sm:text-2xl leading-snug">
              {currentQ!.title}
            </h2>

            <div className="space-y-3">
              {currentQ!.options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(opt.id)}
                  className="w-full text-left p-4 border border-border hover:border-foreground/60 hover:bg-secondary/40 transition-all flex items-start justify-between gap-3 group"
                >
                  <div>
                    <p className="font-display text-base font-medium group-hover:underline">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0 mt-1 transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>

            {currentStep > 0 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                ← Previous Question
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Results Summary */}
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="eyebrow text-accent">Your Bespoke Direction</span>
            <h1 className="font-display text-4xl sm:text-5xl">The Architectural Uniform</h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Based on your preference for structured ease and honest materials, we have curated a foundational capsule collection for effortless daily rotation.
            </p>
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={handleReset} className="text-xs uppercase tracking-wider">
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Retake Consultation
              </Button>
            </div>
          </div>

          {/* Curated Product Recommendations */}
          <div>
            <div className="flex items-center justify-between border-b border-border pb-4 mb-8">
              <p className="eyebrow text-subtle">Recommended Capsule ({recommendedProducts.length} pieces)</p>
              <Link to="/shop" className="text-xs text-accent hover:underline">
                View Full Wardrobe →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {recommendedProducts.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
