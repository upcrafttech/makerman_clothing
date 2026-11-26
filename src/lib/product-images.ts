import type { Product, ColorOption, ProductImageItem } from "@/types";

/**
 * Known color synonyms and family groupings used only for legacy untagged URL fallback.
 */
const COLOR_FAMILIES: Record<string, string[]> = {
  black: ["black", "noir", "jetblack", "#000000", "#1a1a1a", "#111111"],
  grey: [
    "grey",
    "gray",
    "heather",
    "heathergrey",
    "heathergray",
    "slategrey",
    "slategray",
    "charcoal",
    "ash",
    "silver",
    "smoke",
    "#94a3b8",
    "#475569",
    "#36454f",
    "#64748b",
    "#cbd5e1",
  ],
  white: [
    "white",
    "offwhite",
    "cream",
    "ivory",
    "milk",
    "snow",
    "#ffffff",
    "#faf7f2",
    "#f8fafc",
    "#efe9df",
  ],
  blue: [
    "blue",
    "navy",
    "navyblue",
    "royal",
    "royalblue",
    "indigo",
    "sky",
    "azure",
    "#0f172a",
    "#1e3a8a",
    "#2563eb",
    "#3b82f6",
  ],
  green: [
    "green",
    "olive",
    "olivegreen",
    "emerald",
    "sage",
    "mint",
    "forest",
    "#556b2f",
    "#16a34a",
    "#15803d",
  ],
  red: ["red", "crimson", "maroon", "burgundy", "ruby", "wine", "#dc2626", "#b91c1c"],
  beige: ["beige", "khaki", "tan", "camel", "sand", "nude", "fawn", "#d4b896", "#d97706"],
  brown: ["brown", "coffee", "chocolate", "mocha", "#78350f", "#854d0e"],
  yellow: ["yellow", "mustard", "gold", "#eab308", "#facc15"],
  orange: ["orange", "rust", "coral", "peach", "#ea580c", "#f97316"],
  pink: ["pink", "rose", "blush", "magenta", "#ec4899", "#f43f5e"],
  purple: ["purple", "violet", "lavender", "plum", "#8b5cf6", "#a855f7"],
};

export function normalizeColor(name?: string | null): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/gray/g, "grey")
    .replace(/[^a-z0-9#]/g, "");
}

/**
 * Checks if two color representations (names or hex codes) match exactly.
 * Handles:
 * 1. Exact normalized name match
 * 2. Exact hex match
 * 3. Cross-match when a name field holds a hex code
 */
export function isColorMatch(
  sourceName?: string | null,
  sourceHex?: string | null,
  targetName?: string | null,
  targetHex?: string | null,
): boolean {
  const normSource = normalizeColor(sourceName);
  const normTarget = normalizeColor(targetName);
  const cleanSourceHex = sourceHex?.trim().toLowerCase();
  const cleanTargetHex = targetHex?.trim().toLowerCase();

  if (normSource === "general" || normTarget === "general") return false;

  // 1. Exact normalized name or exact hex match
  if (normSource && normTarget && normSource === normTarget) return true;
  if (cleanSourceHex && cleanTargetHex && cleanSourceHex === cleanTargetHex) return true;

  // 2. Cross-match name with hex if name is a hex code
  if (normSource.startsWith("#") && cleanTargetHex && normSource === cleanTargetHex) return true;
  if (normTarget.startsWith("#") && cleanSourceHex && normTarget === cleanSourceHex) return true;

  return false;
}

/**
 * Checks if an image URL filename contains clues for a color name.
 */
export function urlMatchesColor(url: string, colorName: string, colorHex?: string): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  const normColor = normalizeColor(colorName);

  if (normColor && normColor.length >= 3 && lowerUrl.includes(normColor)) {
    return true;
  }

  for (const [, members] of Object.entries(COLOR_FAMILIES)) {
    const isTargetFamily =
      members.some((m) => normColor.includes(m) || m.includes(normColor)) ||
      (colorHex && members.includes(colorHex.toLowerCase()));

    if (isTargetFamily) {
      const keywordHit = members.some(
        (m) => !m.startsWith("#") && m.length >= 4 && lowerUrl.includes(m),
      );
      if (keywordHit) return true;
    }
  }

  return false;
}

/**
 * Returns strictly the images corresponding to the selected color.
 * If user selects Black -> returns ONLY Black images.
 * If user selects Grey -> returns ONLY Grey images.
 */
export function getImagesForColor(product: Product, selectedColor?: string | null): string[] {
  if (!product) return [];
  const allImages = product.images ?? [];
  const productImages = product.productImages ?? [];

  if (!selectedColor || product.colors.length === 0) {
    return allImages;
  }

  // Find active color from product.colors
  const activeColor = product.colors.find(
    (c) =>
      c.name.trim().toLowerCase() === selectedColor.trim().toLowerCase() ||
      c.hex.trim().toLowerCase() === selectedColor.trim().toLowerCase(),
  );
  const activeName = activeColor?.name || selectedColor;
  const activeHex = activeColor?.hex;

  const isGeneralImage = (img: ProductImageItem) =>
    (!img.colorName && !img.colorCode) || img.colorName?.trim().toLowerCase() === "general";

  // General images (tagged as 'general' or having no color tag)
  const generalUrls = productImages.filter(isGeneralImage).map((img) => img.url);

  const combineWithGeneral = (colorUrls: string[]) => {
    const isFirst = product.generalImagePosition === "FIRST";
    const combined = isFirst
      ? [...generalUrls, ...colorUrls]
      : [...colorUrls, ...generalUrls];
    return Array.from(new Set(combined.filter(Boolean)));
  };

  const hasAnyTaggedImages = productImages.some((img) => !isGeneralImage(img));

  // 1. Check explicit exact color matches from productImages
  if (productImages.length > 0) {
    const explicitMatches = productImages.filter((img) => {
      if (isGeneralImage(img)) return false;
      return isColorMatch(img.colorName, img.colorCode, activeName, activeHex);
    });

    if (explicitMatches.length > 0) {
      return combineWithGeneral(explicitMatches.map((img) => img.url));
    }
  }

  // 2. When any image has an explicit color tag, never guess via URL or positional index.
  //    Return general images if present, otherwise full gallery.
  if (hasAnyTaggedImages) {
    if (generalUrls.length > 0) {
      return Array.from(new Set(generalUrls.filter(Boolean)));
    }
    return Array.from(new Set(allImages.filter(Boolean)));
  }

  // 3. Legacy fallback when no images are tagged: URL / filename keyword match
  const candidateUrls = productImages.length > 0 ? productImages.map((img) => img.url) : allImages;
  const urlMatches = candidateUrls.filter((url) => urlMatchesColor(url, activeName, activeHex));

  if (urlMatches.length > 0) {
    return combineWithGeneral(urlMatches);
  }

  // 4. Fallback to general images or full gallery
  if (generalUrls.length > 0) {
    return Array.from(new Set(generalUrls.filter(Boolean)));
  }

  return Array.from(new Set(allImages.filter(Boolean)));
}
