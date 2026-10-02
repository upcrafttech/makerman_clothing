import type { ApiProduct } from "@/types/api";
import type { Product, ColorOption } from "@/types";

// Runtime registry of live adapted products
const productRegistry = new Map<string, Product>();
const categoryRegistry = new Map<string, string>();

export function registerCategories(categories: Array<{ id: string; name: string }>): void {
  for (const c of categories) {
    categoryRegistry.set(c.id, c.name);
  }
}

export function getCategoryLabel(id: string): string | undefined {
  return categoryRegistry.get(id);
}

export function getRegisteredProduct(slugOrId: string): Product | undefined {
  return (
    productRegistry.get(slugOrId) ||
    Array.from(productRegistry.values()).find((p) => p.slug === slugOrId || p.id === slugOrId)
  );
}

export function registerProducts(products: Product[]): void {
  for (const p of products) {
    productRegistry.set(p.slug, p);
    productRegistry.set(p.id, p);
  }
}

export function getAllRegisteredProducts(): Product[] {
  const seen = new Set<string>();
  const list: Product[] = [];
  for (const p of productRegistry.values()) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      list.push(p);
    }
  }
  return list;
}

export function adaptProduct(api: ApiProduct): Product {
  const rawVariants = api.variants ?? [];

  const sizes = Array.from(
    new Set(rawVariants.map((v) => v.sizeLabel).filter(Boolean)),
  );

  const colorMap: Record<string, ColorOption> = {};
  for (const v of rawVariants) {
    if (v.colorName && !colorMap[v.colorName]) {
      colorMap[v.colorName] = {
        name: v.colorName,
        hex: v.colorCode || "#1a1a1a",
      };
    }
  }
  const colors = Object.values(colorMap);

  const images = [
    ...(api.imageUrls?.filter(Boolean) ?? []),
    ...(api.imageUrl && !api.imageUrls?.includes(api.imageUrl) ? [api.imageUrl] : []),
  ].filter(Boolean);

  // If no images exist from backend, provide refined image fallback
  if (images.length === 0) {
    const nameLower = api.name.toLowerCase();
    if (nameLower.includes("shirt") || nameLower.includes("kurta")) {
      images.push("/images/p-shirt-1.jpg", "/images/look-1.jpg");
    } else if (nameLower.includes("pant") || nameLower.includes("trouser") || nameLower.includes("jean")) {
      images.push("/images/p-trousers-1.jpg", "/images/p-jeans-1.jpg");
    } else if (nameLower.includes("tshirt") || nameLower.includes("tee")) {
      images.push("/images/p-tshirt-1.jpg");
    } else {
      images.push("/images/p-shirt-1.jpg", "/images/hero.jpg");
    }
  }

  const meta = (key: string) =>
    api.metafields?.find((m) => m.key.toLowerCase() === key.toLowerCase())?.value;

  // Generate clean URL slug from product name or fallback to id
  const slug =
    api.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || `prod-${api.id.slice(0, 8)}`;

  const genderRaw = meta("gender")?.toLowerCase();
  const gender: Product["gender"] =
    genderRaw === "men" || genderRaw === "women" ? genderRaw : "unisex";

  const daysOld =
    (Date.now() - new Date(api.createdAt || Date.now()).getTime()) / 86_400_000;
  const badgeRaw = meta("badge") as Product["badge"];
  const badge: Product["badge"] =
    badgeRaw ?? (daysOld < 30 ? "New" : undefined);

  const adapted: Product = {
    id: api.id,
    slug,
    name: api.name,
    category: api.categoryId ?? "uncategorized",
    categoryLabel:
      meta("categoryLabel") ??
      (api.categoryId ? categoryRegistry.get(api.categoryId) : undefined) ??
      "Clothing",
    gender,
    collections: meta("collections")?.split(",").map((c) => c.trim()).filter(Boolean) ?? [],
    price: Number(api.price || 0),
    compareAtPrice: api.comparePrice ? Number(api.comparePrice) : undefined,
    shortDescription: api.description ? api.description.slice(0, 140) : "",
    description: api.description ?? "",
    material: meta("material") ?? "Premium Craft Fabric",
    fit: meta("fit") ?? "Tailored Regular Fit",
    care: meta("care")?.split("|").map((c) => c.trim()).filter(Boolean) ?? [
      "Dry clean or cold wash",
      "Do not bleach",
      "Warm iron inside out",
    ],
    details: meta("details")?.split("|").map((d) => d.trim()).filter(Boolean) ?? [
      "Designed and crafted by Makerman",
      "Reinforced seams for lasting durability",
      "Breathable high-density weave",
    ],
    colors: colors.length > 0 ? colors : [{ name: "Standard", hex: "#1A1A1A" }],
    sizes: sizes.length > 0 ? sizes : ["M", "L", "XL"],
    rating: Number(api.averageRating ?? 5.0),
    reviewCount: Number(api.reviewCount ?? 0),
    images,
    badge,
    inStock: api.stock > 0,
    stockCount: api.stock ?? 0,
    tags: meta("tags")?.split(",").map((t) => t.trim()).filter(Boolean) ?? [],
    createdAt: api.createdAt || new Date().toISOString(),
    variants: rawVariants,
  };

  // Register in memory cache
  productRegistry.set(adapted.slug, adapted);
  productRegistry.set(adapted.id, adapted);

  return adapted;
}
