export type ColorOption = { name: string; hex: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  gender: "women" | "men" | "unisex";
  collections: string[];
  price: number;
  compareAtPrice?: number | undefined;
  shortDescription: string;
  description: string;
  material: string;
  fit: string;
  care: string[];
  details: string[];
  colors: ColorOption[];
  sizes: string[];
  rating: number;
  reviewCount: number;
  images: string[];
  badge?: "New" | "Best Seller" | "Limited" | "Sale" | undefined;
  inStock: boolean;
  stockCount: number;
  tags: string[];
  createdAt: string;
  completeTheLook?: string[] | undefined;
  variants?: Array<{ id: string; sizeLabel: string; colorName: string; colorCode: string; quantity: number }> | undefined;
};

export type Collection = {
  slug: string;
  title: string;
  description: string;
  image: string;
  productSlugs: string[];
};

export type Review = {
  id: string;
  productSlug: string;
  name: string;
  city: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
};

export type Article = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  author: string;
  date: string;
  readingTime: string;
  image: string;
  body: { heading?: string | undefined; paragraphs: string[]; image?: string | undefined }[];
};

export type CartLine = {
  id: string;
  productSlug: string;
  size: string;
  color: string;
  quantity: number;
  savedForLater?: boolean | undefined;
};

export type Address = {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | undefined;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export type OrderStatus =
  | "Order Placed"
  | "Confirmed"
  | "Packed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered";

export type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  deliveryDate: string;
  paymentMethod: string;
  address: Address;
  items: { productSlug: string; name: string; size: string; color: string; quantity: number; price: number }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "rating";

export type ProductFilters = {
  categories?: string[] | undefined;
  sizes?: string[] | undefined;
  colors?: string[] | undefined;
  materials?: string[] | undefined;
  fits?: string[] | undefined;
  collections?: string[] | undefined;
  gender?: string | undefined;
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  inStockOnly?: boolean | undefined;
  minRating?: number | undefined;
  query?: string | undefined;
};
