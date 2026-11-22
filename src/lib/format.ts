export function formatINR(value: number): string {
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(value))}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const FREE_SHIPPING_THRESHOLD = 0;
export const SHIPPING_FEE = 0;
export const GST_RATE = 0.05;

export function cartTotals(subtotal: number, discount = 0) {
  const afterDiscount = Math.max(subtotal - discount, 0);
  const shipping = 0; // Free delivery for all
  const tax = Math.round(afterDiscount * GST_RATE);
  return { shipping, tax, total: afterDiscount + shipping + tax };
}

/**
 * Returns a clean, user-friendly Order ID (e.g. #MKR-0001 or #719DE08E), never raw UUID.
 */
export function formatOrderId(id?: string | null, orderNumber?: string | null): string {
  if (orderNumber && orderNumber.trim()) {
    const cleanNum = orderNumber.trim();
    return cleanNum.startsWith("#") ? cleanNum : `#${cleanNum}`;
  }
  if (!id) return "—";
  const clean = id.trim();
  if (clean.includes("-")) {
    const shortCode = clean.split("-")[0].toUpperCase();
    return `#${shortCode}`;
  }
  return clean.startsWith("#") ? clean : `#${clean}`;
}
