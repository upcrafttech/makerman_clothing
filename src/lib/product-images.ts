import type { Product, ColorOption, ProductImageItem } from "@/types";

/**
 * Known color synonyms and family groupings for fuzzy color matching.
 */
const COLOR_FAMILIES: Record<string, string[]> = {
  black: ["black", "noir", "jetblack", "dark", "#000000", "#1a1a1a", "#111111"],
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
 * Checks if two color representations (names or hex codes) match.
 * Handles:
 * 1. Exact string match
 * 2. Exact hex match
 * 3. Substring / compound word match (e.g. "Heather Grey" vs "Grey")
 * 4. Color family match (e.g. both in "grey" family)
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

  // 1. Direct match
  if (normSource && normTarget && normSource === normTarget) return true;
  if (cleanSourceHex && cleanTargetHex && cleanSourceHex === cleanTargetHex) return true;

  // 2. Cross-match name with hex if name is a hex code
  if (normSource.startsWith("#") && cleanTargetHex && normSource === cleanTargetHex) return true;
  if (normTarget.startsWith("#") && cleanSourceHex && normTarget === cleanSourceHex) return true;

  // 3. Substring match for compound names
  if (normSource && normTarget) {
    if (normSource.length >= 3 && normTarget.length >= 3) {
      if (normSource.includes(normTarget) || normTarget.includes(normSource)) {
        return true;
      }
    }
  }

  // 4. Color family match
  for (const [, members] of Object.entries(COLOR_FAMILIES)) {
    const sourceInFamily =
      (normSource && members.some((m) => normSource.includes(m) || m.includes(normSource))) ||
      (cleanSourceHex && members.includes(cleanSourceHex));

    const targetInFamily =
      (normTarget && members.some((m) => normTarget.includes(m) || m.includes(normTarget))) ||
      (cleanTargetHex && members.includes(cleanTargetHex));

    if (sourceInFamily && targetInFamily) {
      return true;
    }
  }

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

  // General images (tagged as 'general' or having no colorName)
  const generalUrls = productImages
    .filter((img) => !img.colorName || img.colorName.trim().toLowerCase() === "general")
    .map((img) => img.url);

  const combineWithGeneral = (colorUrls: string[]) => {
    const isFirst = product.generalImagePosition === "FIRST";
    const combined = isFirst
      ? [...generalUrls, ...colorUrls]
      : [...colorUrls, ...generalUrls];
    return Array.from(new Set(combined.filter(Boolean)));
  };

  // 1. Check explicit color matches from productImages
  if (productImages.length > 0) {
    const explicitMatches = productImages.filter((img) => {
      if (!img.colorName && !img.colorCode) return false;
      if (img.colorName && img.colorName.trim().toLowerCase() === "general") return false;
      return isColorMatch(img.colorName, img.colorCode, activeName, activeHex);
    });

    if (explicitMatches.length > 0) {
      return combineWithGeneral(explicitMatches.map((img) => img.url));
    }
  }

  // 2. Check URL / Filename matches
  const candidateUrls = productImages.length > 0 ? productImages.map((img) => img.url) : allImages;
  const urlMatches = candidateUrls.filter((url) => urlMatchesColor(url, activeName, activeHex));

  if (urlMatches.length > 0) {
    return combineWithGeneral(urlMatches);
  }

  // 3. Positional / 1-to-1 index matching:
  // If product has N colors and candidate images has at least N images, map colorIndex -> imageIndex
  if (product.colors.length > 1 && candidateUrls.length >= product.colors.length) {
    const colorIndex = product.colors.findIndex(
      (c) =>
        c.name.trim().toLowerCase() === selectedColor.trim().toLowerCase() ||
        c.hex.trim().toLowerCase() === selectedColor.trim().toLowerCase(),
    );
    if (colorIndex >= 0 && candidateUrls[colorIndex]) {
      return combineWithGeneral([candidateUrls[colorIndex]]);
    }
  }

  // 4. Check if there are general images tagged explicitly
  if (generalUrls.length > 0) {
    return Array.from(new Set(generalUrls));
  }

  // 5. Fallback to first image or all images
  return allImages.length > 0 ? [allImages[0]] : [];
}
