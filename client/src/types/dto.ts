import type { ProductCategory, JerseyType, Size } from './index';

// ============ Auth DTOs ============

export interface RegisterDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'customer' | 'admin';
  };
}

// ============ Product DTOs ============

export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: ProductCategory;
  team: string;
  player?: string;
  jerseyType: JerseyType;
  sizes: { size: Size; stock: number }[];
  tags: string[];
  isFeatured?: boolean;
  isLimitedDrop?: boolean;
  allowCustomization?: boolean;
}

export interface ProductFilters {
  team?: string;
  category?: ProductCategory;
  size?: Size;
  priceMin?: number;
  priceMax?: number;
  jerseyType?: JerseyType;
  grade?: 'A' | 'B' | null;
  isFeatured?: boolean;
  isLimitedDrop?: boolean;
  search?: string;
  sortBy?: 'price' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}

// ============ Order DTOs ============

export interface CartItem {
  productId: string;
  quantity: number;
  size: Size;
  customName?: string;
  customNumber?: string;
}

export interface CreateOrderDTO {
  items: CartItem[];
  customerName: string;
  phone: string;
  deliveryAddress: string;
  city: string;
  note?: string;
}

// ============ Review DTOs ============

export interface CreateReviewDTO {
  productId: string;
  rating: number;
  comment: string;
  images?: string[];
}
