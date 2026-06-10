import api from './api'
import { normalizeOrder } from '@/lib/normalize'
import type { Order } from '@/types'
import type { CreateOrderDTO } from '@/types/dto'

export interface CreateOrderResponse {
  order: Order
  whatsappUrl: string
}

export async function createOrder(payload: CreateOrderDTO): Promise<CreateOrderResponse> {
  const { data } = await api.post('/orders', payload)
  return {
    order: normalizeOrder(data.order),
    whatsappUrl: data.whatsappUrl,
  }
}

export async function fetchMyOrders(): Promise<Order[]> {
  const { data } = await api.get('/orders/my-orders')
  return (data as Record<string, unknown>[]).map(normalizeOrder)
}
