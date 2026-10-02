const KEY = "makerman.auth";

export interface AuthUser {
  token: string;
  id: string;
  userId: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  businessId?: string;
  businessName?: string;
}

type AuthListener = (user: AuthUser | null) => void;
const listeners = new Set<AuthListener>();

export const authStore = {
  get: (): AuthUser | null => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },

  set: (user: AuthUser) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(user));
      listeners.forEach((fn) => fn(user));
    } catch {
      /* ignore storage errors */
    }
  },

  clear: () => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(KEY);
      listeners.forEach((fn) => fn(null));
    } catch {
      /* ignore storage errors */
    }
  },

  getToken: (): string | null => {
    return authStore.get()?.token ?? null;
  },

  subscribe: (listener: AuthListener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
