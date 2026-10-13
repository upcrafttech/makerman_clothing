const isBrowser = typeof window !== "undefined";
const envApiUrl = (import.meta.env as Record<string, string>)["VITE_API_BASE_URL"];
const BASE_URL =
  envApiUrl && envApiUrl.trim() !== ""
    ? envApiUrl.trim()
    : isBrowser
      ? "/api"
      : "https://dashboard.upcraft.tech/api";
export const BUSINESS_ID =
  ((import.meta.env as Record<string, string>)["VITE_BUSINESS_ID"] as string) ||
  "1a6176f2-7f3b-41f3-92ab-514885680a2a";

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Business-Id": BUSINESS_ID,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((rest.headers as Record<string, string> | undefined) ?? {}),
  };

  const url = path.startsWith("http") ? path : `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...rest,
    headers,
  });

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  const contentType = res.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const errorMsg =
      (typeof data === "object" && data !== null && "message" in data
        ? (data as { message: string }).message
        : null) ||
      (typeof data === "string" && data.length > 0 ? data : `HTTP ${res.status}`);
    throw new Error(errorMsg);
  }

  return data as T;
}
