import api from './api'
import type { DashboardStats, Order, OrderStatus, Product, Review, User, CreateProductDTO } from '@/types'

export interface DeliveryBoy {
  _id: string
  id: string
  name: string
  email: string
  phone: string
  role: string
  createdAt: string
}

export async function fetchDeliveryBoys(): Promise<DeliveryBoy[]> {
  const { data } = await api.get('/admin/delivery-boys')
  return (data as DeliveryBoy[]).map(u => ({ ...u, _id: u.id ?? u._id }))
}

export async function createDeliveryBoy(payload: {
  name: string; email: string; phone: string; password: string
}): Promise<{ user: DeliveryBoy; plainPassword: string }> {
  const { data } = await api.post('/admin/delivery-boys', payload)
  return { user: { ...data.user, _id: data.user.id ?? data.user._id }, plainPassword: data.plainPassword }
}

export async function deleteDeliveryBoy(id: string): Promise<void> {
  await api.delete(`/admin/delivery-boys/${id}`)
}

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password })
  return data as { token: string; user: { id: string; name: string; email: string; phone: string; role: string } }
}

export interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
  format: string
}

/**
 * Upload multiple images (up to 5) to Cloudinary via the admin upload endpoint.
 * Returns array of upload results with URLs.
 */
export async function uploadImages(files: File[]): Promise<UploadResult[]> {
  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))
  const { data } = await api.post('/admin/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data as UploadResult[]
}

/**
 * Create a new product. Images must already be uploaded URLs.
 */
export async function createProduct(payload: CreateProductDTO): Promise<Product> {
  const { data } = await api.post('/admin/products', payload)
  return data as Product
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get('/admin/dashboard/stats')
  return data
}

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await api.get('/admin/products')
  return data
}

export async function fetchOrders(): Promise<Order[]> {
  const { data } = await api.get('/admin/orders', { params: { limit: 500 } })
  return data
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const { data } = await api.patch(`/admin/orders/${orderId}/status`, { status })
  return data
}

export async function fetchUsers(): Promise<User[]> {
  const { data } = await api.get('/admin/users')
  return data
}

export async function updateUserRole(userId: string, role: 'customer' | 'admin' | 'delivery_boy'): Promise<User> {
  const { data } = await api.patch(`/admin/users/${userId}/role`, { role })
  return data
}

export async function fetchReviews(): Promise<Review[]> {
  const { data } = await api.get('/admin/reviews')
  return data
}

export async function approveReview(reviewId: string): Promise<Review> {
  const { data } = await api.patch(`/admin/reviews/${reviewId}/approve`)
  return data
}

export async function deleteReview(reviewId: string): Promise<void> {
  await api.delete(`/admin/reviews/${reviewId}`)
}

export async function updateProduct(id: string, payload: Partial<CreateProductDTO> & { isActive?: boolean }): Promise<Product> {
  const { data } = await api.put(`/admin/products/${id}`, payload)
  return data as Product
}

export async function toggleProductActive(id: string, isActive: boolean): Promise<Product> {
  const { data } = await api.put(`/admin/products/${id}`, { isActive })
  return data
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/admin/products/${id}`)
}

export async function assignDeliveryBoy(orderId: string, deliveryBoyId: string | null): Promise<Order> {
  const { data } = await api.patch(`/admin/orders/${orderId}/assign`, { deliveryBoyId })
  return data
}

export async function fetchDeliveryOrders(): Promise<Order[]> {
  const { data } = await api.get('/delivery/orders')
  return data
}

export async function updateDeliveryStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const { data } = await api.patch(`/delivery/orders/${orderId}/status`, { status })
  return data
}

export interface WhatsAppStatus {
  connected: boolean
  status: string        // WORKING | STARTING | STOPPED | FAILED | SCAN_QR_CODE | UNAVAILABLE
  session: string
  me: { id: string; pushName: string } | null
}

export async function fetchWhatsAppStatus(): Promise<WhatsAppStatus> {
  const { data } = await api.get('/admin/whatsapp/status')
  return data as WhatsAppStatus
}

export interface WAMessage {
  id: string
  from: string
  fromName: string | null
  body: string
  repliedWith: string | null
  isRead: boolean
  createdAt: string
}

export async function fetchWhatsAppMessages(params?: {
  page?: number; limit?: number; unreadOnly?: boolean
}): Promise<{ data: WAMessage[]; total: number; unread: number; totalPages: number }> {
  const { data } = await api.get('/admin/whatsapp/messages', { params })
  return data
}

export async function markMessageRead(id: string): Promise<void> {
  await api.patch(`/admin/whatsapp/messages/${id}/read`)
}

export async function markAllMessagesRead(): Promise<void> {
  await api.patch('/admin/whatsapp/messages/read-all')
}
