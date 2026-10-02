import { Star } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/format";

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("eyebrow text-subtle", className)}>{children}</p>;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:flex sm:items-end sm:justify-between sm:gap-8",
        className,
      )}
    >
      <div className="min-w-0 max-w-2xl">
        {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
        <h2 className="text-[clamp(1.75rem,5vw,2.75rem)] leading-[1.08]">{title}</h2>
        {description ? (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function Rating({
  value,
  count,
  size = "sm",
  className,
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const px = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="flex" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            className={cn(px, i < Math.round(value) ? "fill-foreground text-foreground" : "text-border")}
            strokeWidth={1.2}
          />
        ))}
      </span>
      <span className="num text-xs text-muted-foreground">
        {value.toFixed(1)}
        {count != null ? ` (${count})` : ""}
      </span>
      <span className="sr-only">{`Rated ${value} out of 5${count != null ? ` from ${count} reviews` : ""}`}</span>
    </div>
  );
}

export function Price({
  price,
  compareAtPrice,
  className,
  size = "sm",
}: {
  price: number;
  compareAtPrice?: number | undefined;
  className?: string;
  size?: "sm" | "lg";
}) {
  return (
    <div className={cn("flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn("num", size === "lg" ? "text-xl" : "text-sm")}>{formatINR(price)}</span>
      {compareAtPrice ? (
        <>
          <span className="num text-xs text-subtle line-through">{formatINR(compareAtPrice)}</span>
          <span className="eyebrow text-accent">
            {Math.round(((compareAtPrice - price) / compareAtPrice) * 100)}% off
          </span>
        </>
      ) : null}
    </div>
  );
}

export function Tag({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "dark" | "accent" }) {
  return (
    <span
      className={cn(
        "eyebrow inline-flex items-center px-2.5 py-1",
        tone === "dark" && "bg-ink text-ink-foreground",
        tone === "light" && "bg-surface/90 text-foreground backdrop-blur-sm",
        tone === "accent" && "bg-accent text-accent-foreground",
      )}
    >
      {children}
    </span>
  );
}

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
        shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center border border-border bg-surface px-6 py-16 text-center">
      {icon ? <div className="mb-5 text-subtle">{icon}</div> : null}
      <h3 className="text-2xl">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
