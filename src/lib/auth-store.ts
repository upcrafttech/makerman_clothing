const KEY = "makerman.auth";

/**
 * Checks whether a given JWT token string is structurally expired.
 */
function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const parsed = JSON.parse(jsonPayload);
    if (typeof parsed.exp === "number") {
      return Date.now() >= parsed.exp * 1000 - 10000;
    }
    return false;
  } catch {
    return true;
  }
}

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
      if (!raw) return null;
      const user = JSON.parse(raw) as AuthUser;
      if (!user || !user.token || isJwtExpired(user.token)) {
        window.localStorage.removeItem(KEY);
        return null;
      }
      return user;
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
