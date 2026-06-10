
// ============ Enums & Literal Types ============

export type UserRole = 'customer' | 'admin' | 'delivery_boy';

export type ProductCategory = 'worldcup' | 'retro' | 'club' | 'streetwear';

export type JerseyType = 'home' | 'away' | 'third' | 'retro' | 'custom';

export type Size = 'S' | 'M' | 'L' | 'XL' | 'XXL';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ontheway' | 'delivered' | 'cancelled';

export type PaymentMethod = 'cod';

// ============ Sub-document Interfaces ============

export interface Address {
  street: string;
  city: string;
  district: string;
}

export interface SizeStock {
  size: Size;
  stock: number;
}

export interface OrderItem {
  product: string;
  productName: string;
  quantity: number;
  size: string;
  price: number;
  customName?: string;
  customNumber?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  deliveryAddress: string;
  city: string;
  note?: string;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

// ============ Main Model Interfaces ============

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  address?: Address;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category: ProductCategory;
  team: string;
  player?: string;
  jerseyType: JerseyType;
  sizes: SizeStock[];
  tags: string[];
  isFeatured: boolean;
  isLimitedDrop: boolean;
  allowCustomization: boolean;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  user: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customer: CustomerInfo;
  whatsappConfirmed: boolean;
  statusHistory: StatusHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  user: string;
  product: string;
  rating: number;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentCategory?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
}

// ============ Generic Utility Interfaces ============

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
}
