
import api from './api'
import { normalizeProduct } from '@/lib/normalize'
import type { Product, PaginatedResult, Review } from '@/types'
import type { ProductFilters, CreateReviewDTO } from '@/types/dto'
import { normalizeReview } from '@/lib/normalize'

function buildParams(filters: ProductFilters = {}): Record<string, string | number> {
  const params: Record<string, string | number> = {}
  if (filters.team) params.team = filters.team
  if (filters.category) params.category = filters.category
  if (filters.size) params.size = filters.size
  if (filters.priceMin != null) params.priceMin = filters.priceMin
  if (filters.priceMax != null) params.priceMax = filters.priceMax
  if (filters.jerseyType) params.jerseyType = filters.jerseyType
  if (filters.grade) params.grade = filters.grade
  if (filters.isFeatured) params.isFeatured = 'true'
  if (filters.isLimitedDrop) params.isLimitedDrop = 'true'
  if (filters.sortBy) params.sortBy = filters.sortBy
  if (filters.page) params.page = filters.page
  if (filters.limit) params.limit = filters.limit
  if (filters.search) params.search = filters.search
  return params
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<PaginatedResult<Product>> {
  const { data } = await api.get('/products', { params: buildParams(filters) })
  return {
    data: (data.data as Record<string, unknown>[]).map(normalizeProduct),
    total: data.total,
    page: data.page,
    totalPages: data.totalPages,
    hasNext: data.hasNext,
  }
}

export async function fetchProduct(slugOrId: string): Promise<Product> {
  const { data } = await api.get(`/products/${slugOrId}`)
  return normalizeProduct(data)
}

export async function fetchRelatedProducts(productId: string, limit = 4): Promise<Product[]> {
  const { data } = await api.get(`/products/${productId}/related`, { params: { limit } })
  return (data as Record<string, unknown>[]).map(normalizeProduct)
}

export async function fetchProductReviews(productId: string): Promise<Review[]> {
  const { data } = await api.get(`/products/${productId}/reviews`)
  return (data as Record<string, unknown>[]).map(r => normalizeReview(r))
}

export interface ReviewStatus {
  hasPurchased: boolean
  hasReviewed: boolean
  canReview: boolean
  review: Record<string, unknown> | null
}

export async function fetchReviewStatus(productId: string): Promise<ReviewStatus> {
  const { data } = await api.get(`/products/${productId}/reviews/status`)
  return data
}

export async function submitProductReview(
  productId: string,
  payload: Pick<CreateReviewDTO, 'rating' | 'comment'>,
): Promise<Review> {
  const { data } = await api.post(`/products/${productId}/reviews`, payload)
  return normalizeReview(data)
}

export function uniqueTeams(products: Product[]): string[] {
  return [...new Set(products.map(p => p.team))].sort()
}
