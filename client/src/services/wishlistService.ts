import api from './api'
import { normalizeProduct } from '@/lib/normalize'
import type { Product } from '@/types'

export async function fetchWishlist(): Promise<Product[]> {
  const { data } = await api.get('/wishlist')
  return (data as Record<string, unknown>[]).map(normalizeProduct)
}

export async function addToWishlist(productId: string): Promise<void> {
  await api.post(`/wishlist/${productId}`)
}

export async function removeFromWishlist(productId: string): Promise<void> {
  await api.delete(`/wishlist/${productId}`)
}

export async function checkWishlist(productId: string): Promise<boolean> {
  const { data } = await api.get(`/wishlist/${productId}`)
  return data.inWishlist
}
