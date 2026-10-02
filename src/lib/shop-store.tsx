import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { defaultAddresses, seedOrders } from "@/data/content";
import { productService } from "@/services";
import { authStore } from "@/lib/auth-store";
import { apiFetch } from "@/lib/api-client";
import { getRegisteredProduct } from "@/lib/adapters";
import type { Address, CartLine, Order, Product } from "@/types";

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
  addresses: defaultAddresses,
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
  clearCart: () => void;
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
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistShape>(initial);
  const [hydrated, setHydrated] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickView, setQuickView] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      const parsed = raw ? (JSON.parse(raw) as PersistShape) : initial;
      const authUser = authStore.get();
      if (authUser) {
        const parts = (authUser.name || "").split(" ");
        parsed.session = {
          email: authUser.email,
          firstName: parts[0] || "Valued",
          lastName: parts.slice(1).join(" ") || "Client",
        };
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

  const patch = useCallback((fn: (prev: PersistShape) => PersistShape) => setState(fn), []);

  const addToCart = useCallback<ShopContextValue["addToCart"]>(
    (productSlug, size, color, quantity = 1) => {
      const product = productService.bySlug(productSlug);
      patch((prev) => {
        const id = `${productSlug}|${size}|${color}`;
        const existing = prev.cart.find((l) => l.id === id && !l.savedForLater);
        const cart = existing
          ? prev.cart.map((l) => (l.id === id ? { ...l, quantity: l.quantity + quantity } : l))
          : [...prev.cart, { id, productSlug, size, color, quantity }];
        return { ...prev, cart };
      });
      toast.success("Added to bag", { description: `${product?.name ?? "Item"} · ${size} · ${color}` });
      setCartOpen(true);
    },
    [patch],
  );

  const updateQuantity = useCallback<ShopContextValue["updateQuantity"]>(
    (lineId, quantity) =>
      patch((prev) => ({
        ...prev,
        cart:
          quantity <= 0
            ? prev.cart.filter((l) => l.id !== lineId)
            : prev.cart.map((l) => (l.id === lineId ? { ...l, quantity } : l)),
      })),
    [patch],
  );

  const removeLine = useCallback<ShopContextValue["removeLine"]>(
    (lineId) => {
      patch((prev) => ({ ...prev, cart: prev.cart.filter((l) => l.id !== lineId) }));
      toast("Item removed from bag");
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

  const clearCart = useCallback(() => patch((prev) => ({ ...prev, cart: [] })), [patch]);

  const toggleWishlist = useCallback<ShopContextValue["toggleWishlist"]>(
    (slug) => {
      patch((prev) => {
        const has = prev.wishlist.includes(slug);
        toast(has ? "Removed from favorites" : "Added to favorites");
        return {
          ...prev,
          wishlist: has ? prev.wishlist.filter((s) => s !== slug) : [slug, ...prev.wishlist],
        };
      });
    },
    [patch],
  );

  const moveWishlistToCart = useCallback<ShopContextValue["moveWishlistToCart"]>(
    (slug) => {
      const product = productService.bySlug(slug);
      if (!product) return;
      addToCart(slug, product.sizes[Math.min(2, product.sizes.length - 1)]!, product.colors[0]!.name, 1);
      patch((prev) => ({ ...prev, wishlist: prev.wishlist.filter((s) => s !== slug) }));
    },
    [addToCart, patch],
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
    (address) =>
      patch((prev) => {
        const exists = prev.addresses.some((a) => a.id === address.id);
        let addresses = exists
          ? prev.addresses.map((a) => (a.id === address.id ? address : a))
          : [...prev.addresses, address];
        if (address.isDefault) {
          addresses = addresses.map((a) => ({ ...a, isDefault: a.id === address.id }));
        }
        return { ...prev, addresses };
      }),
    [patch],
  );

  const deleteAddress = useCallback<ShopContextValue["deleteAddress"]>(
    (id) => patch((prev) => ({ ...prev, addresses: prev.addresses.filter((a) => a.id !== id) })),
    [patch],
  );

  const setDefaultAddress = useCallback<ShopContextValue["setDefaultAddress"]>(
    (id) =>
      patch((prev) => ({
        ...prev,
        addresses: prev.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
      })),
    [patch],
  );

  const placeOrder = useCallback<ShopContextValue["placeOrder"]>(
    (order) => patch((prev) => ({ ...prev, orders: [order, ...prev.orders], cart: [] })),
    [patch],
  );

  const syncLocalCartToBackend = useCallback(async () => {
    const token = authStore.getToken();
    if (!token) return;
    const active = state.cart.filter((l) => !l.savedForLater);
    for (const line of active) {
      const product =
        getRegisteredProduct(line.productSlug) ?? productService.bySlug(line.productSlug);
      if (!product) continue;
      try {
        await apiFetch("/cart/items", {
          method: "POST",
          token,
          body: JSON.stringify({
            productId: product.id,
            quantity: line.quantity,
            price: product.price,
          }),
        });
      } catch (e) {
        console.warn("Cart sync item warning:", e);
      }
    }
  }, [state.cart]);

  const signIn = useCallback<ShopContextValue["signIn"]>(
    (email, firstName) => {
      const authUser = authStore.get();
      const name = authUser?.name || firstName || "Valued Client";
      const parts = name.split(" ");
      patch((prev) => ({
        ...prev,
        session: { email, firstName: parts[0] || name, lastName: parts.slice(1).join(" ") || "" },
      }));
      syncLocalCartToBackend();
    },
    [patch, syncLocalCartToBackend],
  );

  const signOut = useCallback(() => {
    authStore.clear();
    patch((prev) => ({ ...prev, session: null }));
  }, [patch]);

  const value = useMemo<ShopContextValue>(() => {
    const active = state.cart.filter((l) => !l.savedForLater);
    const subtotal = active.reduce((sum, line) => {
      const product = productService.bySlug(line.productSlug);
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
      recentlyViewed: productService.bySlugs(state.recentlyViewed),
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
    };
  }, [
    state,
    hydrated,
    cartOpen,
    searchOpen,
    quickView,
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
