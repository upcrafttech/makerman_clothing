import type { ApiProduct, ApiCustomerAddress } from "@/types/api";
import type { Product, ColorOption, Address } from "@/types";

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

  const meta = (key: string) =>
    api.metafields?.find((m) => m.key.toLowerCase() === key.toLowerCase())?.value;

  const colorMap: Record<string, ColorOption> = {};

  // 1. Extract from variants
  for (const v of rawVariants) {
    const rawName = v.colorName?.trim();
    const rawCode = v.colorCode?.trim();
    if (rawName && !colorMap[rawName.toLowerCase()]) {
      colorMap[rawName.toLowerCase()] = {
        name: rawName,
        hex: rawCode || "#1a1a1a",
      };
    } else if (rawCode && !colorMap[rawCode.toLowerCase()]) {
      colorMap[rawCode.toLowerCase()] = {
        name: rawCode,
        hex: rawCode,
      };
    }
  }

  // 2. Extract from metafields (colors, color, Color)
  const colorsMeta = meta("colors") || meta("color");
  if (colorsMeta) {
    try {
      const parsed = JSON.parse(colorsMeta);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (typeof item === "string" && item.trim()) {
            const val = item.trim();
            const hex = val.startsWith("#") ? val : "#1a1a1a";
            if (!colorMap[val.toLowerCase()]) {
              colorMap[val.toLowerCase()] = { name: val, hex };
            }
          } else if (item && typeof item === "object") {
            const name = (item.name || item.colorName || item.label || item.hex || "Color").trim();
            const hex = (item.hex || item.colorCode || item.code || "#1a1a1a").trim();
            if (name && !colorMap[name.toLowerCase()]) {
              colorMap[name.toLowerCase()] = { name, hex };
            }
          }
        }
      }
    } catch {
      const parts = colorsMeta.split(",").map((s) => s.trim()).filter(Boolean);
      for (const p of parts) {
        if (!colorMap[p.toLowerCase()]) {
          colorMap[p.toLowerCase()] = {
            name: p,
            hex: p.startsWith("#") ? p : "#1a1a1a",
          };
        }
      }
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
  const isNewArrival =
    meta("isNewArrival") === "true" ||
    meta("newArrival") === "true";
  const isFeatured =
    meta("isFeatured") === "true" ||
    meta("featured") === "true";

  const rawCollections =
    meta("collections")?.split(",").map((c) => c.trim()).filter(Boolean) ?? [];
  if (isNewArrival && !rawCollections.includes("new-arrivals")) {
    rawCollections.push("new-arrivals");
  }
  if (isFeatured && !rawCollections.includes("featured")) {
    rawCollections.push("featured");
  }

  const badgeRaw = meta("badge") as Product["badge"];
  const badge: Product["badge"] =
    badgeRaw ?? (isNewArrival || daysOld < 30 ? "New" : isFeatured ? "Featured" : undefined);

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
    collections: rawCollections,
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

export function adaptCustomerAddress(api: ApiCustomerAddress): Address {
  return {
    id: api.id,
    fullName: api.recipientName,
    phone: api.phone,
    line1: api.addressLine1,
    line2: api.addressLine2 || undefined,
    city: api.city,
    state: api.state,
    pincode: api.pincode,
    isDefault: Boolean(api.isDefault),
  };
}

