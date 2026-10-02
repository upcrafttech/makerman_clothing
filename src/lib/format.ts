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

export const FREE_SHIPPING_THRESHOLD = 1999;
export const SHIPPING_FEE = 99;
export const GST_RATE = 0.05;

export function cartTotals(subtotal: number, discount = 0) {
  const afterDiscount = Math.max(subtotal - discount, 0);
  const shipping = afterDiscount === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const tax = Math.round(afterDiscount * GST_RATE);
  return { shipping, tax, total: afterDiscount + shipping + tax };
}
