import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

import { defaultAddresses, seedOrders, BRAND } from "@/data/content";
import { productService } from "@/services";
import { authStore } from "@/lib/auth-store";
import { apiFetch, BUSINESS_ID } from "@/lib/api-client";
import { getRegisteredProduct, adaptCustomerAddress } from "@/lib/adapters";
import type { Address, CartLine, Order, Product } from "@/types";
import type { ApiCart, ApiWishlist, ApiCustomerAddress, ApiStoreProfile } from "@/types/api";

export interface StoreInfo {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  fullAddress: string;
  gstin?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  currency?: string | null;
}

export const defaultStoreInfo: StoreInfo = {
  name: BRAND.name,
  email: BRAND.email,
  phone: BRAND.phone,
  whatsapp: BRAND.whatsapp,
  address: "Unit 4, Kamala Mills Compound, Lower Parel",
  city: "Mumbai",
  state: "Maharashtra",
  country: "India",
  pincode: "400013",
  fullAddress: BRAND.address,
  gstin: null,
  description: BRAND.tagline,
  logoUrl: null,
  currency: "INR",
};

const KEY = "makerman.v1";

type Session = { email: string; firstName: string; lastName: string } | null;

type PersistShape = {
  cart: CartLine[];
  wishlist: string[];
  recentlyViewed: string[];
  compare: string[];
  addresses: Address[];
  orders: Order[];
  session: Session;
};

const initial: PersistShape = {
  cart: [],
  wishlist: [],
  recentlyViewed: [],
  compare: [],
  addresses: [],
  orders: seedOrders,
  session: null,
};

type ShopContextValue = {
  hydrated: boolean;
  cart: CartLine[];
  cartCount: number;
  subtotal: number;
  wishlist: string[];
  favorites: string[];
  favoritesCount: number;
  recentlyViewed: Product[];
  compare: string[];
  addresses: Address[];
  orders: Order[];
  session: Session;
  addToCart: (productSlug: string, size: string, color: string, quantity?: number) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  toggleSaveForLater: (lineId: string) => void;
  clearCart: () => Promise<void> | void;
  toggleWishlist: (slug: string) => void;
  isWishlisted: (slug: string) => boolean;
  moveWishlistToCart: (slug: string) => void;
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  moveFavoriteToCart: (slug: string) => void;
  toggleCompare: (slug: string) => void;
  markViewed: (slug: string) => void;
  saveAddress: (address: Address) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  placeOrder: (order: Order) => void;
  signIn: (email: string, firstName?: string) => void;
  signOut: () => void;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  quickView: string | null;
  setQuickView: (slug: string | null) => void;
  storeInfo: StoreInfo;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [state, setState] = useState<PersistShape>(initial);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickView, setQuickView] = useState<string | null>(null);

  const [storeInfo, setStoreInfo] = useState<StoreInfo>(() => {
    try {
      if (typeof window !== "undefined") {
        const cached = window.localStorage.getItem("upcraft_store_info");
        if (cached) return JSON.parse(cached);
      }
    } catch {}
    return defaultStoreInfo;
  });

  // Fetch store profile from backend once on mount (with /businesses fallback)
  useEffect(() => {
    let isMounted = true;
    const fetchStore = async () => {
      try {
        let data: ApiStoreProfile | null = null;
        try {
          data = await apiFetch<ApiStoreProfile>("/businesses/store-profile");
        } catch {
          // Fallback to /businesses list if store-profile endpoint returns 403 or 404
          const businesses = await apiFetch<any[]>("/businesses");
          if (Array.isArray(businesses)) {
            data =
              businesses.find((b) => b.id === BUSINESS_ID) ||
              businesses.find((b) => b.name?.toLowerCase().includes("makerman")) ||
              businesses[0] ||
              null;
          }
        }

        if (!data || !isMounted) return;
        const phone = data.phone || defaultStoreInfo.phone;
        const parts = [
          data.address,
          data.city,
          data.state ? `${data.state}${data.pincode ? ` — ${data.pincode}` : ""}` : data.pincode,
          data.country,
        ].filter(Boolean);

        const updated: StoreInfo = {
          name: data.name || defaultStoreInfo.name,
          email: data.email || defaultStoreInfo.email,
          phone: phone,
          whatsapp: phone,
          address: data.address || defaultStoreInfo.address,
          city: data.city || defaultStoreInfo.city,
          state: data.state || defaultStoreInfo.state,
          country: data.country || defaultStoreInfo.country,
          pincode: data.pincode || defaultStoreInfo.pincode,
          fullAddress: parts.length > 0 ? parts.join(", ") : defaultStoreInfo.fullAddress,
          gstin: data.gstin || null,
          description: (data.description || defaultStoreInfo.description) ?? null,
          logoUrl: data.logoUrl || null,
          currency: ((data as any).baseCurrency || defaultStoreInfo.currency) ?? null,
        };
        setStoreInfo(updated);
        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem("upcraft_store_info", JSON.stringify(updated));
          }
        } catch {}
      } catch (err) {
        console.warn("Failed to fetch store profile:", err);
      }
    };

    fetchStore();
    return () => {
      isMounted = false;
    };
  }, []);

  // Maps to link frontend identifiers to backend item UUIDs without re-rendering
  const apiCartMap = useRef<Map<string, string>>(new Map()); // lineId -> backend cartItem.id
  const apiWishlistMap = useRef<Map<string, string>>(new Map()); // slug / productId -> backend wishlistItem.id

  const patch = useCallback((fn: (prev: PersistShape) => PersistShape) => setState(fn), []);

  const syncFromBackend = useCallback(async () => {
    const token = authStore.getToken();
    if (!token) return;

    // 1. Sync Cart from Backend
    try {
      const apiCart = await apiFetch<ApiCart>("/cart", { token });
      if (apiCart && Array.isArray(apiCart.items)) {
        const cartLines: CartLine[] = apiCart.items.map((item) => {
          const product =
            getRegisteredProduct(item.productId) ?? productService.bySlug(item.productId);
          const slug = product?.slug ?? item.productId;
          const defaultSize = product?.sizes?.[0] || "M";
          const defaultColor = product?.colors?.[0]?.name || "Standard";
          const lineId = `${slug}|${defaultSize}|${defaultColor}`;

          apiCartMap.current.set(lineId, item.id);

          return {
            id: lineId,
            productSlug: slug,
            size: defaultSize,
            color: defaultColor,
            quantity: item.quantity,
          };
        });

        patch((prev) => ({
          ...prev,
          cart: cartLines,
        }));
      }
    } catch (e) {
      console.warn("Backend cart fetch failed:", e);
    }

    // 2. Sync Wishlist from Backend
    try {
      const apiWl = await apiFetch<ApiWishlist>("/wishlist", { token });
      if (apiWl && Array.isArray(apiWl.items)) {
        const slugs: string[] = [];
        for (const item of apiWl.items) {
          const product =
            getRegisteredProduct(item.productId) ?? productService.bySlug(item.productId);
          const slug = product?.slug ?? item.productId;
          slugs.push(slug);
          apiWishlistMap.current.set(slug, item.id);
          apiWishlistMap.current.set(item.productId, item.id);
        }

        patch((prev) => ({
          ...prev,
          wishlist: slugs,
        }));
      }
    } catch (e) {
      console.warn("Backend wishlist fetch failed:", e);
    }

    // 3. Sync Customer Addresses from Backend
    try {
      const apiAddrs = await apiFetch<{
        success: boolean;
        message?: string;
        data: ApiCustomerAddress[];
      }>("/customer/addresses/all", { token });
      if (apiAddrs?.data && Array.isArray(apiAddrs.data)) {
        patch((prev) => ({
          ...prev,
          addresses: apiAddrs.data.map(adaptCustomerAddress),
        }));
      }
    } catch (e) {
      console.warn("Backend addresses fetch failed:", e);
    }
  }, [patch]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      const parsed = raw ? (JSON.parse(raw) as PersistShape) : initial;
      if (Array.isArray(parsed.addresses)) {
        parsed.addresses = parsed.addresses.filter(
          (a) => a.id !== "addr-1" && a.id !== "addr-2" && a.fullName !== "Aarav Deshpande",
        );
      }
      const authUser = authStore.get();
      if (authUser && authStore.getToken()) {
        const parts = (authUser.name || "").split(" ");
        parsed.session = {
          email: authUser.email,
          firstName: parts[0] || "Valued",
          lastName: parts.slice(1).join(" ") || "Client",
        };
      } else {
        parsed.cart = [];
        parsed.wishlist = [];
        parsed.session = null;
      }
      setState({ ...initial, ...parsed });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, hydrated]);

  // Sync with backend on initial hydration if authenticated
  useEffect(() => {
    if (hydrated && authStore.getToken()) {
      syncFromBackend();
    }
  }, [hydrated, syncFromBackend]);

  const addToCart = useCallback<ShopContextValue["addToCart"]>(
    (productSlug, size, color, quantity = 1) => {
      const token = authStore.getToken();
      if (!token) {
        toast.info("Please sign in to add items to your shopping bag");
        navigate({ to: "/account" });
        return;
      }

      const product = getRegisteredProduct(productSlug) ?? productService.bySlug(productSlug);
      if (!product) return;
      const id = `${productSlug}|${size}|${color}`;

      // 1. Optimistic Local State Update
      patch((prev) => {
        const existing = prev.cart.find((l) => l.id === id && !l.savedForLater);
        const cart = existing
          ? prev.cart.map((l) => (l.id === id ? { ...l, quantity: l.quantity + quantity } : l))
          : [...prev.cart, { id, productSlug, size, color, quantity }];
        return { ...prev, cart };
      });

      toast.success("Added to bag", {
        description: `${product.name} · ${size} · ${color}`,
      });
      setCartOpen(true);

      // 2. Async Backend Sync
      apiFetch<ApiCart>("/cart/items", {
        method: "POST",
        token,
        body: JSON.stringify({
          productId: product.id,
          quantity,
          price: product.price,
        }),
      })
        .then((res) => {
          if (res?.items) {
            const added = res.items.find((i) => i.productId === product.id);
            if (added) {
              apiCartMap.current.set(id, added.id);
            }
          }
        })
        .catch((e) => {
          console.warn("Async cart add API warning:", e);
        });
    },
    [patch, navigate],
  );

  const updateQuantity = useCallback<ShopContextValue["updateQuantity"]>(
    (lineId, quantity) => {
      // 1. Optimistic local update
      patch((prev) => ({
        ...prev,
        cart:
          quantity <= 0
            ? prev.cart.filter((l) => l.id !== lineId)
            : prev.cart.map((l) => (l.id === lineId ? { ...l, quantity } : l)),
      }));

      // 2. Async Backend Sync if Authenticated
      const token = authStore.getToken();
      const backendId = apiCartMap.current.get(lineId);
      if (token && backendId) {
        if (quantity <= 0) {
          apiFetch<void>(`/cart/items/${backendId}`, {
            method: "DELETE",
            token,
          })
            .then(() => {
              apiCartMap.current.delete(lineId);
            })
            .catch((e) => {
              console.warn("Async cart remove API warning:", e);
            });
        } else {
          apiFetch<ApiCart>(`/cart/items/${backendId}`, {
            method: "PUT",
            token,
            body: JSON.stringify({ quantity }),
          }).catch((e) => {
            console.warn("Async cart update API warning:", e);
          });
        }
      }
    },
    [patch],
  );

  const removeLine = useCallback<ShopContextValue["removeLine"]>(
    (lineId) => {
      // 1. Optimistic local update
      patch((prev) => ({ ...prev, cart: prev.cart.filter((l) => l.id !== lineId) }));
      toast("Item removed from bag");

      // 2. Async Backend Sync if Authenticated
      const token = authStore.getToken();
      const backendId = apiCartMap.current.get(lineId);
      if (token && backendId) {
        apiFetch<void>(`/cart/items/${backendId}`, {
          method: "DELETE",
          token,
        })
          .then(() => {
            apiCartMap.current.delete(lineId);
          })
          .catch((e) => {
            console.warn("Async cart delete API warning:", e);
          });
      }
    },
    [patch],
  );

  const toggleSaveForLater = useCallback<ShopContextValue["toggleSaveForLater"]>(
    (lineId) =>
      patch((prev) => ({
        ...prev,
        cart: prev.cart.map((l) => (l.id === lineId ? { ...l, savedForLater: !l.savedForLater } : l)),
      })),
    [patch],
  );

  const clearCart = useCallback(async () => {
    // 1. Optimistic local clear
    patch((prev) => ({ ...prev, cart: [] }));
    apiCartMap.current.clear();

    // 2. Async backend clear if Authenticated
    const token = authStore.getToken();
    if (!token) return;
    try {
      const cartRes = await apiFetch<ApiCart>("/cart", { token });
      if (cartRes?.items?.length) {
        await Promise.allSettled(
          cartRes.items.map((item) =>
            apiFetch<void>(`/cart/items/${item.id}`, { method: "DELETE", token }),
          ),
        );
      }
    } catch (e) {
      console.warn("Backend clear cart warning:", e);
    }
  }, [patch]);

  const toggleWishlist = useCallback<ShopContextValue["toggleWishlist"]>(
    (slug) => {
      const token = authStore.getToken();
      if (!token) {
        toast.info("Please sign in to save items to your favorites");
        navigate({ to: "/account" });
        return;
      }

      const product = getRegisteredProduct(slug) ?? productService.bySlug(slug);

      patch((prev) => {
        const has = prev.wishlist.includes(slug);
        toast(has ? "Removed from favorites" : "Added to favorites");

        if (has) {
          const backendId =
            apiWishlistMap.current.get(slug) ||
            (product ? apiWishlistMap.current.get(product.id) : undefined);
          if (backendId) {
            apiFetch<void>(`/wishlist/items/${backendId}`, {
              method: "DELETE",
              token,
            })
              .then(() => {
                apiWishlistMap.current.delete(slug);
                if (product) apiWishlistMap.current.delete(product.id);
              })
              .catch((e) => console.warn("Wishlist remove API warning:", e));
          }
        } else if (product) {
          apiFetch<ApiWishlist>("/wishlist/items", {
            method: "POST",
            token,
            body: JSON.stringify({ productId: product.id }),
          })
            .then((res) => {
              if (res?.items) {
                const added = res.items.find((i) => i.productId === product.id);
                if (added) {
                  apiWishlistMap.current.set(slug, added.id);
                  apiWishlistMap.current.set(product.id, added.id);
                }
              }
            })
            .catch((e) => console.warn("Wishlist add API warning:", e));
        }

        return {
          ...prev,
          wishlist: has ? prev.wishlist.filter((s) => s !== slug) : [slug, ...prev.wishlist],
        };
      });
    },
    [patch, navigate],
  );

  const moveWishlistToCart = useCallback<ShopContextValue["moveWishlistToCart"]>(
    (slug) => {
      const token = authStore.getToken();
      if (!token) {
        toast.info("Please sign in to add items to your shopping bag");
        navigate({ to: "/account" });
        return;
      }

      const product = getRegisteredProduct(slug) ?? productService.bySlug(slug);
      if (!product) return;
      addToCart(
        slug,
        product.sizes[Math.min(2, product.sizes.length - 1)] ?? "M",
        product.colors[0]?.name ?? "Standard",
        1,
      );
      toggleWishlist(slug);
    },
    [addToCart, toggleWishlist, navigate],
  );

  const toggleCompare = useCallback<ShopContextValue["toggleCompare"]>(
    (slug) =>
      patch((prev) => {
        const has = prev.compare.includes(slug);
        if (!has && prev.compare.length >= 4) {
          toast("You can compare up to 4 pieces");
          return prev;
        }
        return {
          ...prev,
          compare: has ? prev.compare.filter((s) => s !== slug) : [...prev.compare, slug],
        };
      }),
    [patch],
  );

  const markViewed = useCallback<ShopContextValue["markViewed"]>(
    (slug) =>
      patch((prev) => ({
        ...prev,
        recentlyViewed: [slug, ...prev.recentlyViewed.filter((s) => s !== slug)].slice(0, 8),
      })),
    [patch],
  );

  const saveAddress = useCallback<ShopContextValue["saveAddress"]>(
    (address) => {
      // 1. Optimistic Local Update
      patch((prev) => {
        const exists = prev.addresses.some((a) => a.id === address.id);
        let addresses = exists
          ? prev.addresses.map((a) => (a.id === address.id ? address : a))
          : [...prev.addresses, address];
        if (address.isDefault) {
          addresses = addresses.map((a) => ({ ...a, isDefault: a.id === address.id }));
        }
        return { ...prev, addresses };
      });

      // 2. Async Backend Sync if Authenticated
      const token = authStore.getToken();
      if (token) {
        const cleanPhone = (address.phone ?? "").replace(/\D/g, "").slice(-10);
        const cleanPincode = (address.pincode ?? "").replace(/\D/g, "").slice(0, 6);
        const reqBody = {
          recipientName: address.fullName,
          phone: cleanPhone || "9820441120",
          addressLine1: address.line1,
          addressLine2: address.line2 || null,
          city: address.city,
          state: address.state,
          country: "India",
          pincode: cleanPincode || "400013",
          addressType: "HOME",
          isDefault: address.isDefault,
        };

        const isBackendUuid = address.id && !address.id.startsWith("addr-");
        if (isBackendUuid) {
          apiFetch<{ success: boolean; data: ApiCustomerAddress }>(`/customer/addresses/${address.id}`, {
            method: "PUT",
            token,
            body: JSON.stringify(reqBody),
          }).catch((e) => console.warn("Customer address update API warning:", e));
        } else {
          apiFetch<{ success: boolean; data: ApiCustomerAddress }>("/customer/addresses", {
            method: "POST",
            token,
            body: JSON.stringify(reqBody),
          })
            .then((res) => {
              if (res?.data?.id) {
                patch((prev) => ({
                  ...prev,
                  addresses: prev.addresses.map((a) =>
                    a.id === address.id ? adaptCustomerAddress(res.data) : a,
                  ),
                }));
              }
            })
            .catch((e) => console.warn("Customer address create API warning:", e));
        }
      }
    },
    [patch],
  );

  const deleteAddress = useCallback<ShopContextValue["deleteAddress"]>(
    (id) => {
      patch((prev) => ({ ...prev, addresses: prev.addresses.filter((a) => a.id !== id) }));
      const token = authStore.getToken();
      if (token && id && !id.startsWith("addr-")) {
        apiFetch<void>(`/customer/addresses/${id}`, {
          method: "DELETE",
          token,
        }).catch((e) => console.warn("Customer address delete API warning:", e));
      }
    },
    [patch],
  );

  const setDefaultAddress = useCallback<ShopContextValue["setDefaultAddress"]>(
    (id) => {
      patch((prev) => ({
        ...prev,
        addresses: prev.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
      }));
      const token = authStore.getToken();
      if (token && id && !id.startsWith("addr-")) {
        apiFetch<void>(`/customer/addresses/${id}/default`, {
          method: "PATCH",
          token,
        }).catch((e) => console.warn("Customer address setDefault API warning:", e));
      }
    },
    [patch],
  );

  const placeOrder = useCallback<ShopContextValue["placeOrder"]>(
    (order) => patch((prev) => ({ ...prev, orders: [order, ...prev.orders], cart: [] })),
    [patch],
  );

  const signIn = useCallback<ShopContextValue["signIn"]>(
    (email, firstName) => {
      const authUser = authStore.get();
      const name = authUser?.name || firstName || "Valued Client";
      const parts = name.split(" ");
      patch((prev) => ({
        ...prev,
        session: { email, firstName: parts[0] || name, lastName: parts.slice(1).join(" ") || "" },
      }));
      syncFromBackend();
    },
    [patch, syncFromBackend],
  );

  const signOut = useCallback(() => {
    authStore.clear();
    apiCartMap.current.clear();
    apiWishlistMap.current.clear();
    patch((prev) => ({ ...prev, session: null, cart: [], wishlist: [], addresses: [] }));
  }, [patch]);

  const value = useMemo<ShopContextValue>(() => {
    const active = state.cart.filter((l) => !l.savedForLater);
    const subtotal = active.reduce((sum, line) => {
      const product = getRegisteredProduct(line.productSlug) ?? productService.bySlug(line.productSlug);
      return sum + (product ? product.price * line.quantity : 0);
    }, 0);

    return {
      hydrated,
      cart: state.cart,
      cartCount: active.reduce((n, l) => n + l.quantity, 0),
      subtotal,
      wishlist: state.wishlist,
      favorites: state.wishlist,
      favoritesCount: state.wishlist.length,
      recentlyViewed: state.recentlyViewed
        .map((s) => getRegisteredProduct(s) ?? productService.bySlug(s))
        .filter((p): p is Product => Boolean(p)),
      compare: state.compare,
      addresses: state.addresses,
      orders: state.orders,
      session: state.session,
      addToCart,
      updateQuantity,
      removeLine,
      toggleSaveForLater,
      clearCart,
      toggleWishlist,
      isWishlisted: (slug: string) => state.wishlist.includes(slug),
      moveWishlistToCart,
      toggleFavorite: toggleWishlist,
      isFavorite: (slug: string) => state.wishlist.includes(slug),
      moveFavoriteToCart: moveWishlistToCart,
      toggleCompare,
      markViewed,
      saveAddress,
      deleteAddress,
      setDefaultAddress,
      placeOrder,
      signIn,
      signOut,
      cartOpen,
      setCartOpen,
      searchOpen,
      setSearchOpen,
      quickView,
      setQuickView,
      storeInfo,
    };
  }, [
    state,
    hydrated,
    cartOpen,
    searchOpen,
    quickView,
    storeInfo,
    addToCart,
    updateQuantity,
    removeLine,
    toggleSaveForLater,
    clearCart,
    toggleWishlist,
    moveWishlistToCart,
    toggleCompare,
    markViewed,
    saveAddress,
    deleteAddress,
    setDefaultAddress,
    placeOrder,
    signIn,
    signOut,
  ]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopContextValue {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}

export function useStoreInfo(): StoreInfo {
  const ctx = useContext(ShopContext);
  if (ctx?.storeInfo) return ctx.storeInfo;
  return defaultStoreInfo;
}
