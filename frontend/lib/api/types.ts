/* Made in GON — typed API contracts */

export type UUID = string;

export type Role = "USER" | "SELLER" | "ADMIN";

export interface UserPublic {
  id: UUID;
  email?: string | null;
  phone?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  role: Role;
  language?: string;
  seller_status?: "pending" | "active" | "suspended" | null;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
  user?: UserPublic;
}

export interface ProductImage {
  id: UUID;
  url: string;
  is_primary?: boolean;
}

export interface Product {
  id: UUID;
  slug?: string;
  seller_id?: UUID;
  category_id?: number | null;
  title_fr: string;
  title_ar?: string | null;
  description_fr?: string | null;
  description_ar?: string | null;
  price: number;
  stock?: number;
  is_active?: boolean;
  is_moderated?: boolean;
  status?: "pending" | "approved" | "rejected";
  authenticity_score?: number | null;
  authenticity_badge?: string | null;
  is_verified?: boolean;
  city?: string;
  rating?: number;
  review_count?: number;
  keywords?: string[];
  images?: ProductImage[];
  primary_image?: string;
  created_at?: string;
}

export interface ProductsListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
}

export interface ProductCreatePayload {
  category_id?: number;
  title_fr: string;
  title_ar?: string;
  description_fr?: string;
  description_ar?: string;
  price: number;
  stock: number;
  keywords?: string[];
}

export interface CartItem {
  id: UUID;
  product_id: UUID;
  product?: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping?: number;
  total: number;
}

export interface OrderItem {
  id: UUID;
  product_id: UUID;
  product_title?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: UUID;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  total: number;
  city?: string;
  items: OrderItem[];
  created_at: string;
}

export interface PublicStats {
  sellers_count: number;
  products_count: number;
  provinces_count: number;
  verified_pct: number;
  orders_count?: number;
}

export interface Review {
  id: UUID;
  author_name: string;
  city?: string;
  role?: "buyer" | "seller";
  rating: number;
  text_fr?: string;
  text_ar?: string;
  product_id?: UUID;
  created_at: string;
}

export interface VoiceProductResult {
  title_fr?: string;
  title_ar?: string;
  description_fr?: string;
  description_ar?: string;
  price?: number;
  keywords?: string[];
  category_slug?: string;
}

export interface ChatbotResponse {
  reply: string;
  conversation_id?: string;
}

export type ListParams = {
  page?: number;
  limit?: number;
  category?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  verified_only?: boolean;
  sort?: "relevance" | "price_asc" | "price_desc" | "newest" | "top_rated";
  q?: string;
  featured?: boolean;
};
