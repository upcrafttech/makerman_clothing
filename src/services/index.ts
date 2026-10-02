/**
 * Mock service layer.
 *
 * Every function returns a Promise so that a real REST/GraphQL client can be
 * dropped in later without touching a single component. Nothing here talks to a
 * backend today — data comes from src/data.
 */
import { CATEGORIES, products } from "@/data/products";
import { articles, collections, faqs, reviews, seedOrders } from "@/data/content";
import { getRegisteredProduct, getAllRegisteredProducts } from "@/lib/adapters";
import type { Article, Collection, Order, Product, ProductFilters, Review, SortKey } from "@/types";

const delay = <T,>(value: T, ms = 120): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const materialMatches = (product: Product, material: string) =>
  product.material.toLowerCase().includes(material.toLowerCase()) ||
  product.tags.some((t) => t.toLowerCase().includes(material.toLowerCase()));

export function applyFilters(list: Product[], filters: Partial<ProductFilters>): Product[] {
  return list.filter((p) => {
    if (filters.categories?.length && !filters.categories.includes(p.category)) return false;
    if (filters.sizes?.length && !filters.sizes.some((s) => p.sizes.includes(s))) return false;
    if (filters.colors?.length && !filters.colors.some((c) => p.colors.some((pc) => pc.name === c)))
      return false;
    if (filters.materials?.length && !filters.materials.some((m) => materialMatches(p, m))) return false;
    if (filters.fits?.length && !filters.fits.includes(p.fit)) return false;
    if (filters.collections?.length && !filters.collections.some((c) => p.collections.includes(c)))
      return false;
    if (filters.gender && filters.gender !== "all") {
      if (p.gender !== filters.gender && p.gender !== "unisex") return false;
    }
    if (filters.minPrice != null && p.price < filters.minPrice) return false;
    if (filters.maxPrice != null && p.price > filters.maxPrice) return false;
    if (filters.inStockOnly && !p.inStock) return false;
    if (filters.minRating != null && p.rating < filters.minRating) return false;
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const haystack = `${p.name} ${p.categoryLabel} ${p.tags.join(" ")} ${p.material} ${p.shortDescription}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const copy = [...list];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "newest":
      return copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    default:
      return copy.sort((a, b) => b.reviewCount * b.rating - a.reviewCount * a.rating);
  }
}

export const productService = {
  all: (): Product[] => {
    const live = getAllRegisteredProducts();
    return live.length > 0 ? live : products;
  },
  list: async (filters: Partial<ProductFilters> = {}, sort: SortKey = "featured"): Promise<Product[]> => {
    const live = getAllRegisteredProducts();
    const source = live.length > 0 ? live : products;
    return delay(sortProducts(applyFilters(source, filters), sort));
  },
  bySlug: (slug: string): Product | undefined =>
    getRegisteredProduct(slug) ?? products.find((p) => p.slug === slug),
  bySlugAsync: async (slug: string) =>
    delay(getRegisteredProduct(slug) ?? products.find((p) => p.slug === slug)),
  bySlugs: (slugs: string[]): Product[] =>
    slugs
      .map((s) => getRegisteredProduct(s) ?? products.find((p) => p.slug === s))
      .filter((p): p is Product => Boolean(p)),
  newArrivals: (limit = 8): Product[] => {
    const live = getAllRegisteredProducts();
    const source = live.length > 0 ? live : products;
    return sortProducts(source, "newest").slice(0, limit);
  },
  bestSellers: (limit = 8): Product[] => {
    const live = getAllRegisteredProducts();
    const source = live.length > 0 ? live : products;
    return source.filter((p) => p.badge === "Best Seller" || p.rating >= 4.6).slice(0, limit);
  },
  related: (product: Product, limit = 8): Product[] =>
    products
      .filter((p) => p.slug !== product.slug)
      .sort((a, b) => {
        const score = (p: Product) =>
          (p.category === product.category ? 2 : 0) +
          p.collections.filter((c) => product.collections.includes(c)).length;
        return score(b) - score(a);
      })
      .slice(0, limit),
  trending: (limit = 6): Product[] => sortProducts(products, "rating").slice(0, limit),
  recommendByStyle: (style: string, limit = 4): Product[] => {
    const map: Record<string, string[]> = {
      minimal: ["essentials", "studio-tailoring"],
      classic: ["studio-tailoring", "winter-atelier"],
      street: ["layering", "denim-study"],
      relaxed: ["essentials", "summer-neutrals"],
      contemporary: ["new-arrivals", "studio-tailoring"],
    };
    const wanted = map[style] ?? ["essentials"];
    return products.filter((p) => p.collections.some((c) => wanted.includes(c))).slice(0, limit);
  },
};

export const categoryService = {
  all: () => CATEGORIES,
  label: (slug: string) => CATEGORIES.find((c) => c.slug === slug)?.label ?? slug,
};

export const collectionService = {
  all: (): Collection[] =>
    collections.map((c) => ({
      ...c,
      productSlugs: products.filter((p) => p.collections.includes(c.slug)).map((p) => p.slug),
    })),
  bySlug: (slug: string): Collection | undefined => collectionService.all().find((c) => c.slug === slug),
  products: (slug: string): Product[] => products.filter((p) => p.collections.includes(slug)),
};

export const reviewService = {
  forProduct: (slug: string): Review[] => reviews.filter((r) => r.productSlug === slug),
  all: (): Review[] => reviews,
};

export const journalService = {
  all: (): Article[] => articles,
  bySlug: (slug: string): Article | undefined => articles.find((a) => a.slug === slug),
  related: (slug: string, limit = 3): Article[] => articles.filter((a) => a.slug !== slug).slice(0, limit),
};

export const searchService = {
  search: async (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return { products: [], collections: [], articles: [] };
    return delay({
      products: applyFilters(products, { query: q }).slice(0, 8),
      collections: collectionService.all().filter((c) => c.title.toLowerCase().includes(q)),
      articles: articles.filter(
        (a) => a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q),
      ),
    }, 220);
  },
};

export const orderService = {
  seed: (): Order[] => seedOrders,
  byId: (id: string, orders: Order[]): Order | undefined => orders.find((o) => o.id === id),
};

export const faqService = { all: () => faqs };

export const deliveryService = {
  estimate: (pincode: string) => {
    if (!/^\d{6}$/.test(pincode)) return { ok: false as const, message: "Enter a valid 6-digit PIN code." };
    const metro = ["400", "110", "560", "600", "700", "500", "411"];
    const fast = metro.some((p) => pincode.startsWith(p));
    const days = fast ? 2 : 5;
    const date = new Date();
    date.setDate(date.getDate() + days);
    return {
      ok: true as const,
      days,
      date: date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
      cod: !pincode.startsWith("19"),
    };
  },
};
