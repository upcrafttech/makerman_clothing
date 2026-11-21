import type { Product } from "@/types";

/** Finds a variant by its UUID from the product's variants list. */
export function getVariantById(
  product: Product | null | undefined,
  variantId: string | null | undefined,
): { id: string; sizeLabel: string; colorName: string; colorCode: string; quantity: number } | null {
  if (!product || !variantId) return null;
  return product.variants?.find((v) => v.id === variantId) ?? null;
}

/** Returns available stock for a variant resolved strictly by its UUID. */
export function getStockByVariantId(
  product: Product | null | undefined,
  variantId: string | null | undefined,
): number {
  if (!product) return 0;
  if (!variantId) {
    // No variant id — fall back to product-level stock
    if (typeof product.stockCount === "number") return product.stockCount;
    return product.inStock ? 999 : 0;
  }
  const variant = getVariantById(product, variantId);
  if (variant) return variant.quantity || 0;
  // variantId supplied but not found in list — out of stock for this variant
  return 0;
}

/**
 * Returns available inventory quantity for a specific product, size, and color.
 */
export function getVariantStock(
  product?: Product | null,
  sizeLabel?: string | null,
  colorName?: string | null,
): number {
  if (!product) return 0;
  const variants = product.variants;

  if (Array.isArray(variants) && variants.length > 0) {
    if (!sizeLabel) {
      return variants.reduce((sum, v) => sum + (v.quantity || 0), 0);
    }

    const cleanSize = sizeLabel.trim().toLowerCase();
    const cleanColor = colorName?.trim().toLowerCase();

    // 1. Match both sizeLabel and colorName
    if (cleanColor) {
      const matchBoth = variants.filter(
        (v) =>
          v.sizeLabel?.trim().toLowerCase() === cleanSize &&
          v.colorName?.trim().toLowerCase() === cleanColor,
      );
      if (matchBoth.length > 0) {
        return matchBoth.reduce((sum, v) => sum + (v.quantity || 0), 0);
      }
      // If product has color-specific variants and this size+color variant doesn't exist,
      // it means this size is not in stock for this color.
      const hasColorVariants = variants.some((v) => Boolean(v.colorName?.trim()));
      if (hasColorVariants) {
        return 0;
      }
    }

    // 2. Fallback to match by sizeLabel only
    const matchSize = variants.filter(
      (v) => v.sizeLabel?.trim().toLowerCase() === cleanSize,
    );
    if (matchSize.length > 0) {
      return matchSize.reduce((sum, v) => sum + (v.quantity || 0), 0);
    }

    // Size doesn't exist among variants
    return 0;
  }

  // If no variants list is attached to product, fallback to product-level stock
  if (typeof product.stockCount === "number") {
    return product.stockCount;
  }
  return product.inStock ? 999 : 0;
}

/**
 * Checks whether a specific size is in stock for the given color.
 */
export function isSizeAvailable(
  product?: Product | null,
  sizeLabel?: string | null,
  colorName?: string | null,
): boolean {
  return getVariantStock(product, sizeLabel, colorName) > 0;
}

/**
 * Finds the first available size with stock > 0 for the given color.
 */
export function getFirstAvailableSize(
  product?: Product | null,
  colorName?: string | null,
): string | null {
  if (!product || !product.sizes || product.sizes.length === 0) return null;
  return product.sizes.find((s) => isSizeAvailable(product, s, colorName)) ?? null;
}
