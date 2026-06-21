export type UserRole = 'customer' | 'admin' | 'delivery_boy'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ontheway'
  | 'delivered'
  | 'cancelled'

export type JerseyType = 'home' | 'away' | 'third' | 'retro' | 'custom'
export type ProductCategory = 'worldcup' | 'retro' | 'club' | 'streetwear'
export type Size = 'S' | 'M' | 'L' | 'XL' | 'XXL'

export interface SizeStock {
  size: Size
  stock: number
}

export interface Product {
  _id: string
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  images: string[]
  category: ProductCategory
  team: string
  player?: string
  jerseyType: JerseyType
  grade?: 'A' | 'B' | null
  gradeDescription?: string
  sizes: SizeStock[]
  tags: string[]
  isFeatured: boolean
  isLimitedDrop: boolean
  allowCustomization: boolean
  rating: number
  reviewCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  product: string
  productName: string
  quantity: number
  size: string
  price: number
  customName?: string
  customNumber?: string
}

export interface CustomerInfo {
  name: string
  phone: string
  deliveryAddress: string
  city: string
  note?: string
}

export interface Order {
  _id: string
  orderNumber: string
  user: string
  items: OrderItem[]
  subtotal: number
  deliveryCharge: number
  total: number
  status: OrderStatus
  paymentMethod: 'cod'
  customer: CustomerInfo
  whatsappConfirmed: boolean
  deliveryBoyId: string | null
  statusHistory: { status: OrderStatus; timestamp: string; note?: string }[]
  createdAt: string
  updatedAt: string
}

export interface User {
  _id: string
  name: string
  email: string
  phone: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Review {
  _id: string
  user: string
  product: string
  rating: number
  comment: string
  isVerifiedPurchase: boolean
  isApproved: boolean
  createdAt: string
}

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalUsers: number
  pendingOrders: number
  recentOrders: Order[]
  todayOrders: number
  todayRevenue: number
  yesterdayRevenue: number
  unassignedOrders: number
  statusBreakdown: Record<string, number>
  dailyRevenue: { date: string; revenue: number; orders: number }[]
  lowStockProducts: { id: string; name: string; sizes: { size: string; stock: number }[] }[]
  topProducts: { productId: string; productName: string; totalSold: number; totalRevenue: number }[]
}

export interface AuthUser {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
}

// DTO used when creating a product
export interface CreateProductDTO {
  name: string
  description: string
  price: number
  compareAtPrice?: number
  images: string[]
  category: ProductCategory
  team: string
  player?: string
  jerseyType: JerseyType
  grade?: 'A' | 'B' | null
  gradeDescription?: string
  sizes: SizeStock[]
  tags: string[]
  isFeatured?: boolean
  isLimitedDrop?: boolean
  allowCustomization?: boolean
}
