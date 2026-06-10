import api from './api'
import { normalizeOrder, normalizeProduct, normalizeUser } from '@/lib/normalize'
import type { Order, OrderStatus, Product, User } from '@/types'
import type { CreateProductDTO } from '@/types/dto'

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalUsers: number
  pendingOrders: number
  recentOrders: Order[]
}

export interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
  format: string
}

/**
 * Upload multiple product images to Cloudinary via the admin upload endpoint.
 * Returns array of results with `.url` for each uploaded image.
 */
export async function uploadProductImages(files: File[]): Promise<UploadResult[]> {
  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))
  const { data } = await api.post('/admin/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data as UploadResult[]
}

/**
 * Create a new product. Call uploadProductImages first to get image URLs.
 */
export async function createAdminProduct(payload: CreateProductDTO): Promise<Product> {
  const { data } = await api.post('/admin/products', payload)
  return normalizeProduct(data)
}

export async function fetchAdminProducts(): Promise<Product[]> {
  const { data } = await api.get('/admin/products')
  return (data as Record<string, unknown>[]).map(normalizeProduct)
}

export async function updateAdminProduct(id: string, payload: Partial<Product>): Promise<Product> {
  const { data } = await api.put(`/admin/products/${id}`, payload)
  return normalizeProduct(data)
}

export async function deleteAdminProduct(id: string): Promise<void> {
  await api.delete(`/admin/products/${id}`)
}

export async function fetchAdminOrders(): Promise<Order[]> {
  const { data } = await api.get('/admin/orders', { params: { limit: 500 } })
  return (data as Record<string, unknown>[]).map(normalizeOrder)
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const { data } = await api.patch(`/admin/orders/${orderId}/status`, { status })
  return normalizeOrder(data)
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get('/admin/dashboard/stats')
  return {
    ...data,
    recentOrders: (data.recentOrders as Record<string, unknown>[]).map(normalizeOrder),
  }
}

export async function updateAdminPaymentStatus(orderId: string, paymentStatus: 'paid' | 'unpaid'): Promise<Order> {
  const { data } = await api.patch(`/admin/orders/${orderId}/payment`, { paymentStatus })
  return normalizeOrder(data)
}

export async function assignDeliveryBoy(orderId: string, deliveryBoyId: string | null): Promise<Order> {
  const { data } = await api.patch(`/admin/orders/${orderId}/assign`, { deliveryBoyId })
  return normalizeOrder(data)
}

// ── Delivery Boy Management ───────────────────────────────────────────────────

export interface DeliveryBoy {
  _id: string
  name: string
  email: string
  phone: string
  role: string
  createdAt: string
}

export async function fetchDeliveryBoys(): Promise<DeliveryBoy[]> {
  const { data } = await api.get('/admin/delivery-boys')
  return (data as DeliveryBoy[]).map(u => ({ ...u, _id: (u as unknown as { id?: string }).id ?? u._id }))
}

export async function createDeliveryBoy(payload: {
  name: string
  email: string
  phone: string
  password: string
}): Promise<{ user: DeliveryBoy; plainPassword: string }> {
  const { data } = await api.post('/admin/delivery-boys', payload)
  return { user: { ...data.user, _id: data.user.id ?? data.user._id }, plainPassword: data.plainPassword }
}

export async function deleteDeliveryBoy(id: string): Promise<void> {
  await api.delete(`/admin/delivery-boys/${id}`)
}

export async function fetchAdminUsers(): Promise<User[]> {
  const { data } = await api.get('/admin/users')
  return (data as Record<string, unknown>[]).map(normalizeUser)
}

export async function updateUserRole(userId: string, role: User['role']): Promise<User> {
  const { data } = await api.patch(`/admin/users/${userId}/role`, { role })
  return normalizeUser(data)
}
