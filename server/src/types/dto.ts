import { ProductCategory, JerseyType, Size } from './index';

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

export interface DecodedToken {
  userId: string;
  role: 'customer' | 'admin';
  iat: number;
  exp: number;
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

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

export interface ProductFilters {
  team?: string;
  category?: ProductCategory;
  size?: Size;
  priceMin?: number;
  priceMax?: number;
  jerseyType?: JerseyType;
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

export interface OrderFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ============ Review DTOs ============

export interface CreateReviewDTO {
  productId: string;
  rating: number;
  comment: string;
  images?: string[];
}

// ============ Admin DTOs ============

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface UserFilters {
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}
