import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { getAllRegisteredProducts, getRegisteredProduct, adaptProduct, registerProducts } from "@/lib/adapters";
import { apiFetch } from "@/lib/api-client";
import { productService } from "@/services";
import type { ApiPagedProducts } from "@/types/api";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params }) => {
    // Try registry by slug first; redirect to ID-based URL
    const found =
      getRegisteredProduct(params.slug) ??
      productService.bySlug(params.slug) ??
      getAllRegisteredProducts().find((p) => p.slug === params.slug);

    if (found) {
      throw redirect({ to: "/product/$id", params: { id: found.id } });
    }

    // Fetch all products to find slug match, then redirect
    try {
      const json = await apiFetch<ApiPagedProducts>("/products?page=0&size=100&status=ACTIVE");
      const adapted = (json.content ?? []).map(adaptProduct);
      registerProducts(adapted);
      const matched = adapted.find((p) => p.slug === params.slug || p.id === params.slug);
      if (matched) {
        throw redirect({ to: "/product/$id", params: { id: matched.id } });
      }
    } catch (err) {
      // Re-throw redirect responses; ignore fetch errors
      if (err && typeof err === "object" && "redirect" in err) throw err;
      /* ignore fetch errors */
    }

    throw notFound();
  },
  component: () => null,
});
