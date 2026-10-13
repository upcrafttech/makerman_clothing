import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, BUSINESS_ID } from "@/lib/api-client";
import {
  adaptProduct,
  registerProducts,
  getRegisteredProduct,
  registerCategories,
  adaptCustomerAddress,
} from "@/lib/adapters";
import { authStore } from "@/lib/auth-store";
import type {
  ApiPagedProducts,
  ApiCategory,
  ApiCart,
  ApiWishlist,
  ApiAuthResponse,
  ApiOrder,
  ApiReview,
  ApiProduct,
  ApiCustomerAddress,
  ApiCustomerAddressRequest,
  ApiStoreProfile,
} from "@/types/api";
import type { Product, Address } from "@/types";

/* ── Products ──────────────────────────────── */
export function useProducts(
  params: {
    page?: number | undefined;
    size?: number | undefined;
    search?: string | undefined;
    categoryId?: string | undefined;
    sort?: string | undefined;
    status?: string | undefined;
  } = {},
) {
  const page = params.page ?? 0;
  const size = params.size ?? 40;
  const sort = params.sort ?? "newest";
  const status = params.status ?? "ACTIVE";

  const qsObj: Record<string, string> = {
    page: String(page),
    size: String(size),
    sort,
    status,
  };
  if (params.search?.trim()) qsObj["search"] = params.search.trim();
  if (params.categoryId && params.categoryId !== "all") qsObj["categoryId"] = params.categoryId;

  const qs = new URLSearchParams(qsObj).toString();

  return useQuery({
    queryKey: ["products", qs],
    queryFn: async () => {
      const res = await apiFetch<ApiPagedProducts>(`/products?${qs}`);
      const adapted = (res.content ?? []).map(adaptProduct);
      registerProducts(adapted);
      return {
        ...res,
        content: adapted,
      };
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useProductById(id: string | undefined) {
  return useQuery({
    queryKey: ["product", "id", id],
    queryFn: async () => {
      if (!id) return null;
      const raw = await apiFetch<ApiProduct>(`/products/${id}`);
      return adaptProduct(raw);
    },
    enabled: Boolean(id),
  });
}

export function useProductBySlug(slug: string | undefined) {
  return useQuery<Product | null>({
    queryKey: ["product", "slug", slug],
    queryFn: async () => {
      if (!slug) return null;

      // 1. Check local memory registry first
      const cached = getRegisteredProduct(slug);
      if (cached) return cached;

      // 2. Fetch active catalog to locate the product
      const res = await apiFetch<ApiPagedProducts>("/products?page=0&size=100&status=ACTIVE");
      const list = (res.content ?? []).map(adaptProduct);
      registerProducts(list);

      const found = list.find((p) => p.slug === slug || p.id === slug);
      if (found) return found;

      // 3. If still not found, try search
      const searchRes = await apiFetch<ApiPagedProducts>(
        `/products?search=${encodeURIComponent(slug)}&page=0&size=10`,
      );
      const searchList = (searchRes.content ?? []).map(adaptProduct);
      registerProducts(searchList);

      return searchList.find((p) => p.slug === slug || p.id === slug) ?? null;
    },
    enabled: Boolean(slug),
  });
}

/* ── Categories ────────────────────────────── */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiFetch<ApiCategory[]>("/categories");
      registerCategories(res ?? []);
      return res;
    },
    staleTime: 1000 * 60 * 10,
  });
}

/* ── Reviews ───────────────────────────────── */
export function useProductReviews(productId: string | undefined, page = 0) {
  return useQuery({
    queryKey: ["reviews", productId, page],
    queryFn: async () => {
      if (!productId) return { content: [] as ApiReview[], totalElements: 0, totalPages: 0 };
      try {
        const res = await apiFetch<{
          data: {
            content: ApiReview[];
            totalElements?: number;
            totalPages?: number;
          };
        }>(`/storefront/products/${productId}/reviews?page=${page}&size=10`);
        return res.data ?? { content: [] };
      } catch {
        return { content: [] as ApiReview[], totalElements: 0, totalPages: 0 };
      }
    },
    enabled: Boolean(productId),
    retry: false,
  });
}

export function useCreateReview(productId: string) {
  const qc = useQueryClient();
  const token = authStore.getToken();

  return useMutation({
    mutationFn: (body: { rating: number; title?: string; body: string }) =>
      apiFetch<ApiReview>(`/storefront/products/${productId}/reviews`, {
        method: "POST",
        token,
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reviews", productId] });
    },
  });
}

/* ── Auth ──────────────────────────────────── */
export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      apiFetch<ApiAuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (b: { name: string; email: string; password: string; phone: string }) =>
      apiFetch<{ message: string; email: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...b, role: "CUSTOMER" }),
      }),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      apiFetch<ApiAuthResponse>("/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      }),
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) =>
      apiFetch<{ message: string }>("/auth/resend-otp", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: ({ email }: { email: string }) =>
      apiFetch<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (b: { email: string; otp: string; newPassword: string }) =>
      apiFetch<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(b),
      }),
  });
}

/* ── Cart (authenticated) ──────────────────── */
export function useApiCart() {
  const token = authStore.getToken();
  return useQuery({
    queryKey: ["api-cart"],
    queryFn: () => apiFetch<ApiCart>("/cart", { token }),
    enabled: Boolean(token),
    staleTime: 1000 * 30,
  });
}

export function useAddToCart() {
  const qc = useQueryClient();
  const token = authStore.getToken();

  return useMutation({
    mutationFn: (item: { productId: string; quantity: number; price: number }) =>
      apiFetch<ApiCart>("/cart/items", {
        method: "POST",
        token,
        body: JSON.stringify(item),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-cart"] }),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  const token = authStore.getToken();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      apiFetch<ApiCart>(`/cart/items/${itemId}`, {
        method: "PUT",
        token,
        body: JSON.stringify({ quantity }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-cart"] }),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  const token = authStore.getToken();

  return useMutation({
    mutationFn: (itemId: string) =>
      apiFetch<void>(`/cart/items/${itemId}`, {
        method: "DELETE",
        token,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-cart"] }),
  });
}

export function useClearCartItems() {
  const qc = useQueryClient();
  const token = authStore.getToken();

  return useMutation({
    mutationFn: async () => {
      if (!token) return;
      const cart = await apiFetch<ApiCart>("/cart", { token });
      if (cart?.items?.length) {
        await Promise.allSettled(
          cart.items.map((item) =>
            apiFetch<void>(`/cart/items/${item.id}`, { method: "DELETE", token }),
          ),
        );
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-cart"] }),
  });
}

/* ── Wishlist (authenticated) ──────────────── */
export function useApiWishlist() {
  const token = authStore.getToken();
  return useQuery({
    queryKey: ["api-wishlist"],
    queryFn: () => apiFetch<ApiWishlist>("/wishlist", { token }),
    enabled: Boolean(token),
  });
}

export function useAddToWishlist() {
  const qc = useQueryClient();
  const token = authStore.getToken();

  return useMutation({
    mutationFn: (productId: string) =>
      apiFetch<ApiWishlist>("/wishlist/items", {
        method: "POST",
        token,
        body: JSON.stringify({ productId }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-wishlist"] }),
  });
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient();
  const token = authStore.getToken();

  return useMutation({
    mutationFn: (itemId: string) =>
      apiFetch<void>(`/wishlist/items/${itemId}`, {
        method: "DELETE",
        token,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-wishlist"] }),
  });
}

/* ── Orders ─────────────────────────────────── */
export function useOrders() {
  const token = authStore.getToken();
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => apiFetch<{ content: ApiOrder[] }>("/orders", { token }),
    enabled: Boolean(token),
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  const token = authStore.getToken();

  return useMutation({
    mutationFn: (body: object) =>
      apiFetch<ApiOrder>("/orders", {
        method: "POST",
        token,
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      qc.invalidateQueries({ queryKey: ["api-cart"] });
    },
  });
}

/* ── Payments (Razorpay) ───────────────────── */
export interface RazorpayOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  internalOrderId?: string;
}

export function useCreateRazorpayOrder() {
  return useMutation({
    mutationFn: (body: { amount: number; receipt?: string | undefined; platformOrderId?: string | undefined }) =>
      apiFetch<RazorpayOrderResponse>("/payment/create-order", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

export function useVerifyRazorpayPayment() {
  return useMutation({
    mutationFn: (body: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
      platformOrderId?: string | undefined;
    }) =>
      apiFetch<{ message: string }>("/payment/verify", {
        method: "POST",
        body: JSON.stringify(body),
      }),
  });
}

/* ── Customer Addresses ────────────────────── */
export function useCustomerAddresses() {
  const token = authStore.getToken();
  return useQuery<Address[]>({
    queryKey: ["customer-addresses"],
    queryFn: async () => {
      const res = await apiFetch<{
        success: boolean;
        message?: string;
        data: ApiCustomerAddress[];
      }>("/customer/addresses/all", { token });
      return (res?.data ?? []).map(adaptCustomerAddress);
    },
    enabled: Boolean(token),
  });
}

export function useCreateCustomerAddress() {
  const qc = useQueryClient();
  const token = authStore.getToken();

  return useMutation({
    mutationFn: (body: ApiCustomerAddressRequest) =>
      apiFetch<{ success: boolean; data: ApiCustomerAddress }>("/customer/addresses", {
        method: "POST",
        token,
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer-addresses"] });
    },
  });
}

export function useUpdateCustomerAddress() {
  const qc = useQueryClient();
  const token = authStore.getToken();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ApiCustomerAddressRequest }) =>
      apiFetch<{ success: boolean; data: ApiCustomerAddress }>(`/customer/addresses/${id}`, {
        method: "PUT",
        token,
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer-addresses"] });
    },
  });
}

export function useDeleteCustomerAddress() {
  const qc = useQueryClient();
  const token = authStore.getToken();

  return useMutation({
    mutationFn: (addressId: string) =>
      apiFetch<{ success: boolean }>(`/customer/addresses/${addressId}`, {
        method: "DELETE",
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer-addresses"] });
    },
  });
}

export function useSetDefaultCustomerAddress() {
  const qc = useQueryClient();
  const token = authStore.getToken();

  return useMutation({
    mutationFn: (addressId: string) =>
      apiFetch<{ success: boolean; data: ApiCustomerAddress }>(`/customer/addresses/${addressId}/default`, {
        method: "PATCH",
        token,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customer-addresses"] });
    },
  });
}

/* ── Store Profile (public tenant info) ─────── */
export function useStoreProfile() {
  return useQuery({
    queryKey: ["store-profile"],
    queryFn: async () => {
      try {
        return await apiFetch<ApiStoreProfile>("/businesses/store-profile");
      } catch {
        const businesses = await apiFetch<any[]>("/businesses");
        if (Array.isArray(businesses)) {
          const match =
            businesses.find((b) => b.id === BUSINESS_ID) ||
            businesses.find((b) => b.name?.toLowerCase().includes("makerman")) ||
            businesses[0];
          if (match) return match as ApiStoreProfile;
        }
        throw new Error("No store profile found");
      }
    },
    staleTime: 1000 * 60 * 30, // 30 mins
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}



