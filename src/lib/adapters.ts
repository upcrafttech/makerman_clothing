import type { ApiProduct, ApiCustomerAddress } from "@/types/api";
import type { Product, ColorOption, Address, ProductImageItem } from "@/types";

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

const KNOWN_COLOR_NAMES: Record<string, string> = {
  "#ffffff": "White",
  "#faf7f2": "Off White",
  "#000000": "Black",
  "#0f172a": "Navy Blue",
  "#94a3b8": "Heather Grey",
  "#556b2f": "Olive Green",
  "#dc2626": "Crimson Red",
  "#2563eb": "Royal Blue",
  "#d4b896": "Beige",
  "#36454f": "Charcoal",
};

export function resolveColorName(
  name?: string | null,
  hex?: string | null,
): { name: string; hex: string } | null {
  let cleanName = name?.trim() || "";
  let cleanHex = hex?.trim() || "";

  if (cleanName.startsWith("#") && !cleanHex) {
    cleanHex = cleanName;
    cleanName = "";
  }

  if (!cleanName && !cleanHex) return null;
  if (cleanName.toLowerCase() === "general") return null;

  if (cleanHex && !cleanHex.startsWith("#")) {
    cleanHex = `#${cleanHex}`;
  }

  if (!cleanName || cleanName.startsWith("#")) {
    const matched = KNOWN_COLOR_NAMES[cleanHex.toLowerCase()];
    cleanName = matched || cleanHex;
  }

  return {
    name: cleanName,
    hex: cleanHex || "#1a1a1a",
  };
}

export function adaptProduct(api: ApiProduct): Product {
  const rawVariants = api.variants ?? [];

  const sizes = Array.from(new Set(rawVariants.map((v) => v.sizeLabel).filter(Boolean)));

  const meta = (key: string) =>
    api.metafields?.find((m) => m.key.toLowerCase() === key.toLowerCase())?.value;

  const colorMap = new Map<string, ColorOption>();

  const registerColor = (rawName?: string | null, rawHex?: string | null) => {
    const resolved = resolveColorName(rawName, rawHex);
    if (!resolved) return;

    const hexKey = resolved.hex.toLowerCase();
    const nameKey = resolved.name.toLowerCase();

    let foundKey: string | undefined;
    for (const [key, existing] of colorMap.entries()) {
      if (
        (hexKey && existing.hex.toLowerCase() === hexKey) ||
        (nameKey && existing.name.toLowerCase() === nameKey)
      ) {
        foundKey = key;
        break;
      }
    }

    if (foundKey) {
      const existing = colorMap.get(foundKey)!;
      if (existing.name.startsWith("#") && !resolved.name.startsWith("#")) {
        existing.name = resolved.name;
      }
      return;
    }

    colorMap.set(nameKey, resolved);
  };

  // 1. Extract from variants
  for (const v of rawVariants) {
    registerColor(v.colorName, v.colorCode);
  }

  // 2. Extract from metafields (colors, color, Color)
  const colorsMeta = meta("colors") || meta("color");
  if (colorsMeta) {
    try {
      const parsed = JSON.parse(colorsMeta);
      if (Array.isArray(parsed)) {
        for (const item of parsed) {
          if (typeof item === "string" && item.trim()) {
            registerColor(item.trim(), null);
          } else if (item && typeof item === "object") {
            registerColor(
              item.name || item.colorName || item.label,
              item.hex || item.colorCode || item.code,
            );
          }
        }
      }
    } catch {
      const parts = colorsMeta
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      for (const p of parts) {
        registerColor(p, null);
      }
    }
  }

  const rawApiImages: any[] =
    Array.isArray(api.images) && api.images.length > 0
      ? api.images
      : Array.isArray(api.imageUrls) && api.imageUrls.length > 0
        ? api.imageUrls
        : api.imageUrl
          ? [api.imageUrl]
          : [];

  const productImages: ProductImageItem[] = rawApiImages
    .map((img: any, idx: number) => {
      if (typeof img === "string") {
        return {
          url: img.trim(),
          colorName: null,
          colorCode: null,
          sortOrder: idx,
        };
      }
      if (img && typeof img === "object") {
        return {
          url: (img.url || img.imageUrl || "").trim(),
          colorName: img.colorName?.trim() || null,
          colorCode: img.colorCode?.trim() || null,
          sortOrder: typeof img.sortOrder === "number" ? img.sortOrder : idx,
        };
      }
      return null;
    })
    .filter((img): img is ProductImageItem => Boolean(img && img.url));

  // 3. Extract from productImages if any (skipping general)
  for (const img of productImages) {
    if (img.colorName && img.colorName.trim().toLowerCase() !== "general") {
      registerColor(img.colorName, img.colorCode);
    }
  }

  const colors = Array.from(colorMap.values());

  const images =
    productImages.length > 0
      ? productImages.map((img) => img.url)
      : [
          ...(api.imageUrls?.filter(Boolean) ?? []),
          ...(api.imageUrl && !api.imageUrls?.includes(api.imageUrl) ? [api.imageUrl] : []),
        ].filter(Boolean);

  // If no images exist from backend, provide refined image fallback
  if (images.length === 0) {
    const nameLower = api.name.toLowerCase();
    if (nameLower.includes("shirt") || nameLower.includes("kurta")) {
      images.push("/images/p-shirt-1.jpg", "/images/look-1.jpg");
    } else if (
      nameLower.includes("pant") ||
      nameLower.includes("trouser") ||
      nameLower.includes("jean")
    ) {
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

  const daysOld = (Date.now() - new Date(api.createdAt || Date.now()).getTime()) / 86_400_000;
  const isNewArrival = meta("isNewArrival") === "true" || meta("newArrival") === "true";
  const isFeatured = meta("isFeatured") === "true" || meta("featured") === "true";

  const rawCollections =
    meta("collections")
      ?.split(",")
      .map((c) => c.trim())
      .filter(Boolean) ?? [];
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
    care: meta("care")
      ?.split("|")
      .map((c) => c.trim())
      .filter(Boolean) ?? ["Dry clean or cold wash", "Do not bleach", "Warm iron inside out"],
    details: meta("details")
      ?.split("|")
      .map((d) => d.trim())
      .filter(Boolean) ?? [
      "Designed and crafted by Makerman",
      "Reinforced seams for lasting durability",
      "Breathable high-density weave",
    ],
    colors: colors.length > 0 ? colors : [{ name: "Standard", hex: "#1A1A1A" }],
    sizes: sizes.length > 0 ? sizes : ["M", "L", "XL"],
    rating: Number(api.averageRating ?? 5.0),
    reviewCount: Number(api.reviewCount ?? 0),
    images,
    productImages: productImages.length > 0 ? productImages : undefined,
    badge,
    inStock: api.stock > 0,
    stockCount: api.stock ?? 0,
    tags:
      meta("tags")
        ?.split(",")
        .map((t) => t.trim())
        .filter(Boolean) ?? [],
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
