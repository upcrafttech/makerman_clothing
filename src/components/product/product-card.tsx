import { Link } from "@tanstack/react-router";
import { Heart, Plus } from "lucide-react";

import { Price, Rating, Tag } from "@/components/ui-kit/primitives";
import { Skeleton } from "@/components/ui/skeleton";
import { useShop } from "@/lib/shop-store";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductCard({
  product,
  priority = false,
  className,
  compact = false,
}: {
  product: Product;
  priority?: boolean | undefined;
  className?: string | undefined;
  compact?: boolean | undefined;
}) {
  const { toggleWishlist, isWishlisted, setQuickView } = useShop();
  const wished = isWishlisted(product.slug);
  const hoverImage = product.images[1] ?? product.images[0]!;

  return (
    <article className={cn("group relative flex min-w-0 flex-col", className)}>
      <div className="relative overflow-hidden bg-secondary">
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="block"
          aria-label={`View ${product.name}`}
        >
          <div className="aspect-4/5 w-full">
            <img
              src={product.images[0]}
              alt={product.name}
              width={800}
              height={1000}
              loading={priority ? "eager" : "lazy"}
              className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
            />
          </div>
          <img
            src={hoverImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:block"
          />
        </Link>

        {product.badge ? (
          <div className="pointer-events-none absolute left-3 top-3">
            <Tag tone={product.badge === "Sale" ? "accent" : "light"}>{product.badge}</Tag>
          </div>
        ) : null}

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.slug);
          }}
          aria-label={wished ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
          aria-pressed={wished}
          className="absolute right-2 top-2 z-10 grid h-11 w-11 place-items-center rounded-full bg-background/70 backdrop-blur-xs text-foreground transition-all hover:bg-background hover:scale-105 active:scale-95"
        >
          <Heart
            className={cn(
              "h-[18px] w-[18px] transition-transform duration-200",
              wished ? "scale-110 fill-amber-500 text-amber-500" : "text-foreground/80 hover:text-foreground",
            )}
            strokeWidth={1.4}
          />
        </button>

        <div className="absolute inset-x-2 bottom-2 opacity-0 pointer-events-none transition-all duration-300 md:group-hover:opacity-100 md:group-hover:pointer-events-auto md:translate-y-0 translate-y-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuickView(product.slug);
            }}
            className="flex h-10 w-full items-center justify-center gap-1.5 bg-surface/95 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase backdrop-blur-sm transition-colors hover:bg-ink hover:text-ink-foreground shadow-sm rounded-sm"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
            Quick View
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5 pt-3">
        <p className="eyebrow text-subtle">{product.categoryLabel}</p>
        <h3 className="text-sm font-medium leading-snug">
          <Link to="/product/$slug" params={{ slug: product.slug }} className="link-underline">
            {product.name}
          </Link>
        </h3>
        {!compact ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1.5">
          <Price price={product.price} compareAtPrice={product.compareAtPrice} />
          <Rating value={product.rating} size="sm" className="hidden sm:flex" />
        </div>
        <div className="flex items-center gap-1.5 pt-0.5">
          {product.colors.map((c) => (
            <span
              key={c.name}
              title={c.name}
              className="h-2.5 w-2.5 rounded-full border border-border"
              style={{ backgroundColor: c.hex }}
            />
          ))}
          <span className="ml-1 text-[0.6875rem] text-subtle">{product.colors.length} colours</span>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-4/5 w-full rounded-none" />
      <Skeleton className="h-3 w-16 rounded-none" />
      <Skeleton className="h-4 w-3/4 rounded-none" />
      <Skeleton className="h-4 w-20 rounded-none" />
    </div>
  );
}

export function ProductGrid({
  products,
  className,
  compact,
}: {
  products: Product[];
  className?: string | undefined;
  compact?: boolean | undefined;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 lg:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {products.map((product, i) => (
        <ProductCard key={product.slug} product={product} priority={i < 4} compact={compact} />
      ))}
    </div>
  );
}

export function ProductRail({ products, className }: { products: Product[]; className?: string }) {
  return (
    <div
      className={cn(
        "no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:gap-5 md:mx-0 md:px-0",
        className,
      )}
    >
      {products.map((product) => (
        <div
          key={product.slug}
          className="w-[46%] shrink-0 snap-start sm:w-[32%] lg:w-[24%] xl:w-[23%]"
        >
          <ProductCard product={product} compact />
        </div>
      ))}
    </div>
  );
}
