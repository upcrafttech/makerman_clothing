// Raw API response types — mirrors backend Java DTOs

export interface ApiVariant {
  id: string;
  sizeLabel: string;
  colorName: string;
  colorCode: string; // hex color e.g. "#1A1A1A"
  quantity: number;
}

export interface ApiMetafield {
  key: string;
  value: string;
}

export interface ApiProduct {
  id: string;
  businessId: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  stock: number;
  averageRating: number | null;
  reviewCount: number | null;
  imageUrl: string | null;
  imageUrls: string[] | null;
  variants: ApiVariant[];
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  metafields: ApiMetafield[] | null;
  createdAt: string;
}

export interface ApiPagedProducts {
  content: ApiProduct[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface ApiCategory {
  id: string;
  name: string;
}

export interface ApiAuthResponse {
  token: string;
  id: string;
  userId: string;
  email: string;
  name: string; // full name
  phone: string | null;
  role: string;
  businessId: string;
  businessName: string;
}

export interface ApiCartItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ApiCart {
  id: string;
  businessId: string;
  customerId: string;
  items: ApiCartItem[];
}

export interface ApiWishlistItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  productPrice: number;
}

export interface ApiWishlist {
  id: string;
  businessId: string;
  customerId: string;
  items: ApiWishlistItem[];
}

export interface ApiOrderItem {
  productId: string;
  variantUuid: string | null;
  quantity: number;
  price: number;
}

export interface ApiOrderItemDTO {
  id?: string;
  productId: string;
  productName?: string;
  quantity: number;
  price: number;
}

export interface ApiOrder {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  items: ApiOrderItemDTO[];
  createdAt: string;
}

export interface ApiReview {
  id: string;
  productId: string;
  rating: number;
  title: string | null;
  body: string | null;
  customerName: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}
