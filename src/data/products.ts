import type { Product } from "@/types";

// Static mock data completely removed — all products and categories come strictly from backend API
export const CATEGORIES: Array<{ slug: string; label: string }> = [];

export const products: Product[] = [];

export const MATERIAL_FILTERS: string[] = [];
export const FIT_FILTERS: string[] = [];
export const COLOR_FILTERS: Array<{ name: string; hex: string }> = [];
export const SIZE_FILTERS: string[] = [];
