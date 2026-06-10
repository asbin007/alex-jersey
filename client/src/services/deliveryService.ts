import axios from 'axios'
import { normalizeOrder } from '@/lib/normalize'
import type { Order } from '@/types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Separate axios instance using delivery_token from localStorage
const deliveryApi = axios.create({ baseURL: API_BASE })
deliveryApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('delivery_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
deliveryApi.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('delivery_token')
      localStorage.removeItem('delivery_user')
      if (!window.location.pathname.startsWith('/delivery/login')) {
        window.location.href = '/delivery/login'
      }
    }
    return Promise.reject(error)
  }
)

export interface DeliveryUser {
  id: string
  name: string
  email: string
  phone: string
  role: 'delivery_boy' | 'admin'
}

export async function deliveryLogin(
  email: string,
  password: string
): Promise<{ token: string; user: DeliveryUser }> {
  const { data } = await deliveryApi.post('/auth/delivery-login', { email, password })
  return data
}

export async function fetchAllDeliveryOrders(): Promise<Order[]> {
  const { data } = await deliveryApi.get('/delivery/orders')
  return (data as Record<string, unknown>[]).map(normalizeOrder)
}

export async function updateDeliveryStatus(
  orderId: string,
  status: 'ontheway' | 'delivered'
): Promise<{ order: Order; whatsappUrl: string }> {
  const { data } = await deliveryApi.patch(`/delivery/orders/${orderId}/status`, { status })
  return { order: normalizeOrder(data.order), whatsappUrl: data.whatsappUrl }
}
