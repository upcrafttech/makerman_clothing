# Implementation Plan: ID-Based Cart & Variant Resolution

**Date**: 2026-11-22  
**Project**: `makerman_clothing`  
**Goal**: Fix "Something went wrong" crash on product pages AND replace all name/slug-based cart/order APIs with ID-based lookups.

---

## Problem Statement

### 1. "Something went wrong" on `/product/kurtas`

The route `/product/$slug` loader fetches the product by slug. The slug is generated from the product **name** (lowercased, spaces replaced with `-`). If the product name is a category name or the memory registry isn't pre-populated from that slug, the loader fails:
- `getRegisteredProduct(params.slug)` misses because registry not populated.
- `/products?page=0&size=100` fetch fallback may not find exact slug match.
- `/products?search=kurtas` backend search also may not match slug.
- Result: `notFound()` thrown → TanStack Router error boundary → "Something went wrong."

**Root cause**: Product URLs are based on name-derived slugs, which are fragile. Fix: route by product **ID** (UUID).

### 2. APIs Use Names/Labels Instead of IDs

**Current (broken)**:
```
CartLine { id: "slug|size|color", productSlug, size: "L", color: "Black" }
addToCart(productSlug, size: string, color: string)
checkout apiItems { productId, variantUuid, sizeLabel: "L", colorName: "Black" }
```

**Problems**:
- CartLine keyed by slug (fragile, name-derived) + label strings
- Variant lookup uses string comparison on labels — casing/spacing mismatches cause wrong `variantUuid`
- `shop-store addToCart` sends only `productId` to `/cart/items`, drops variant info
- Backend receives wrong/null `variantUuid` → falls through label matching → may hit wrong variant (Free Size bug)

**Target (correct)**:
```
CartLine { id: "productId|variantId", productId, variantId, quantity }
addToCart(productId: string, variantId: string, quantity: number)
checkout apiItems { productId, variantUuid: variantId, sizeLabel: variant.sizeLabel, colorName: variant.colorName }
```

---

## Assumptions

1. `Product.id` (UUID) always present after `adaptProduct()`.
2. `Product.variants[].id` (variant UUID) always present in `ApiVariant.id`.
3. Backend `deductProductStock()` already resolves by `variantUuid` first — correct, do not change.
4. Backend has `GET /products/:id` endpoint that returns a single product by UUID.

## Non-Goals

- Do NOT change backend `OrderService.java`.
- Do NOT change backend DTO structures.
- Do NOT change product listing/filtering/search logic.
- Do NOT change URL path segments — `/product/:id` replaces `/product/:slug`.

---

## Acceptance Criteria

- [x] `/product/:id` loads product by UUID — no "Something went wrong" for valid products.
- [x] Old slug URLs redirect to ID-based URLs.
- [x] `CartLine` stores `productId` (UUID) + `variantId` (UUID).
- [x] `addToCart(productId, variantId, quantity)` — variant ID resolves everything.
- [x] Checkout `apiItems` sends `{ productId, variantUuid }` with correct UUIDs.
- [x] Size/color in cart/checkout derived from variant data, not from CartLine strings.
- [x] Product pages load for all products including "kurtas".
- [x] `npm run build` exits 0.

---

## Affected Files

| File | Change |
|------|--------|
| `src/routes/product.$slug.tsx` | Redirect slug → id |
| `src/routes/product.$id.tsx` | New — load by UUID |
| `src/types/index.ts` | Update `CartLine` type |
| `src/lib/shop-store.tsx` | Update `addToCart` signature + CartLine construction |
| `src/lib/product-stock.ts` | Add `getVariantById`, `getStockByVariantId` |
| `src/routes/checkout.tsx` | Build `apiItems` from variantId directly |
| `src/routes/cart.tsx` | Resolve product+variant from IDs |
| `src/components/layout/cart-drawer.tsx` | Resolve product+variant from IDs |
| `src/components/product/quick-view-modal.tsx` | Update `handleAdd` to pass variantId |
| `src/components/product/product-card.tsx` | Update Link to use `product.id` |
| `src/routes/index.tsx` | Update `addToCart` calls |
| `src/routes/account.tsx` | Order item productSlug → productId |

---

## Implementation Tasks

### T1 — Update `CartLine` type

**File**: `src/types/index.ts`

```typescript
// AFTER
export type CartLine = {
  id: string;           // "productId|variantId"
  productId: string;    // product UUID
  variantId: string;    // variant UUID (empty string if no variants)
  quantity: number;
  savedForLater?: boolean;
};
```

---

### T2 — Add `getVariantById` / `getStockByVariantId` helpers

**File**: `src/lib/product-stock.ts`

```typescript
export function getVariantById(product, variantId): ApiVariant | null
export function getStockByVariantId(product, variantId): number
```

---

### T3 — Update `addToCart` in `shop-store.tsx`

Signature change:
```typescript
addToCart: (productId: string, variantId: string, quantity?: number) => void;
```

Inside:
1. Resolve product by `productId` UUID from registry.
2. Resolve variant by `variantId` from `product.variants`.
3. Build `CartLine.id = "${productId}|${variantId}"`.
4. Guard: `getStockByVariantId(product, variantId) <= 0` → return silently.
5. Send to `/cart/items` with `{ productId: product.id, variantUuid: variantId, quantity, price }`.
6. Derive `size` and `color` from variant for toast description only.

---

### T4 — Rename product route: slug → id

Create `src/routes/product.$id.tsx` with loader:
```typescript
loader: async ({ params }) => {
  let product = getRegisteredProduct(params.id);
  if (!product) {
    const raw = await apiFetch<ApiProduct>(`/products/${params.id}`);
    product = adaptProduct(raw);
    registerProducts([product]);
  }
  if (!product) throw notFound();
  return { product };
}
```

Update `src/routes/product.$slug.tsx` to redirect:
```typescript
loader: ({ params }) => {
  const found = getAllRegisteredProducts().find(p => p.slug === params.slug);
  if (found) throw redirect({ to: '/product/$id', params: { id: found.id } });
  throw notFound();
}
```

---

### T5 — Update all `addToCart` call sites

All files that call `addToCart(slug, size, color)`:

**product.$id.tsx**:
```typescript
const selectedVariant = product.variants?.find(
  v => v.sizeLabel === selectedSize && v.colorName === selectedColor
) ?? null;
// ...
addToCart(product.id, selectedVariant?.id ?? "", quantity);
```

**quick-view-modal.tsx**: same pattern — resolve variant, pass `variant.id`.

**index.tsx**: use first available variant:
```typescript
const firstVariant = product.variants?.find(v => v.quantity > 0) ?? product.variants?.[0];
addToCart(product.id, firstVariant?.id ?? "", 1);
```

---

### T6 — Update `checkout.tsx` `apiItems` builder

```typescript
// AFTER — ID-based, no string matching
const apiItems = activeLines.map(line => {
  const p = getRegisteredProduct(line.productId);
  if (!p) return null;
  const variant = p.variants?.find(v => v.id === line.variantId) ?? null;
  return {
    productId: p.id,
    variantUuid: variant?.id ?? null,
    sizeLabel: variant?.sizeLabel ?? null,
    colorName: variant?.colorName ?? null,
    quantity: line.quantity,
    price: p.price,
  };
}).filter(Boolean);
```

Also update outOfStockItems check: `getStockByVariantId(p, line.variantId) < line.quantity`.

---

### T7 — Update `cart.tsx` and `cart-drawer.tsx`

Replace:
```typescript
// BEFORE
getRegisteredProduct(line.productSlug) + line.size + line.color

// AFTER
const p = getRegisteredProduct(line.productId);
const v = p?.variants?.find(vr => vr.id === line.variantId);
const displaySize = v?.sizeLabel ?? "—";
const displayColor = v?.colorName ?? "—";
```

---

### T8 — Update all product Links

`<Link to="/product/$slug" params={{ slug: p.slug }}>` → `<Link to="/product/$id" params={{ id: p.id }}>` in:
- `product-card.tsx`
- `cart-drawer.tsx`
- `quick-view-modal.tsx`
- `cart.tsx`
- `account.tsx`

---

### T9 — Add localStorage migration guard

In `ShopProvider` hydration in `shop-store.tsx`:
```typescript
// Discard old slug-based cart lines (they have productSlug instead of productId)
if (Array.isArray(parsed.cart)) {
  parsed.cart = parsed.cart.filter(
    line => line.productId && !line.productSlug
  );
}
```

---

### T10 — Build & verify

```bash
npm --prefix makerman_clothing run build
```

Then run verify-lens `scope: all`.

---

## Risk & Mitigation

| Risk | Mitigation |
|------|-----------|
| Old bookmarks to `/product/kurtas` break | Slug redirect route stays |
| localStorage cart lines invalidated | Migration guard in hydration discards old lines |
| `addToCart` called without variants | Guard: if no variants, variantId = "" and use product-level stock |
| Backend 404 on `/products/:id` for missing product | Error boundary with helpful UI message |

---

## Implementation Order

1. T2 — `product-stock.ts` helpers (no deps)
2. T1 — `CartLine` type
3. T3 — `shop-store.tsx` addToCart
4. T4 — New product route + slug redirect
5. T5 — addToCart call sites
6. T6 — checkout.tsx
7. T7 — cart.tsx + cart-drawer.tsx
8. T8 — All product Links
9. T9 — localStorage migration guard
10. T10 — Build & verify
