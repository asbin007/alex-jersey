/**
 * Normalizers: map backend API responses (which may use `id` or Sequelize shape)
 * to the frontend TypeScript interfaces that use `_id`.
 */
import type { Product, Order, User, Review } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Raw = Record<string, any>

export function normalizeProduct(raw: Raw): Product {
  return {
    _id: String(raw.id ?? raw._id ?? ''),
    name: raw.name ?? '',
    slug: raw.slug ?? '',
    description: raw.description ?? '',
    price: Number(raw.price ?? 0),
    compareAtPrice: raw.compareAtPrice != null ? Number(raw.compareAtPrice) : undefined,
    images: Array.isArray(raw.images) ? raw.images : (raw.images ? [raw.images] : []),
    category: raw.category ?? 'worldcup',
    team: raw.team ?? '',
    player: raw.player ?? undefined,
    jerseyType: raw.jerseyType ?? 'home',
    sizes: Array.isArray(raw.sizes)
      ? raw.sizes.map((s: Raw) => ({ size: s.size, stock: Number(s.stock ?? 0) }))
      : [],
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    isFeatured: Boolean(raw.isFeatured),
    isLimitedDrop: Boolean(raw.isLimitedDrop),
    allowCustomization: Boolean(raw.allowCustomization),
    rating: Number(raw.rating ?? 0),
    reviewCount: Number(raw.reviewCount ?? 0),
    isActive: raw.isActive !== undefined ? Boolean(raw.isActive) : true,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  }
}

export function normalizeOrder(raw: Raw): Order {
  return {
    _id: String(raw.id ?? raw._id ?? ''),
    orderNumber: raw.orderNumber ?? '',
    user: String(raw.userId ?? raw.user ?? ''),
    items: Array.isArray(raw.items)
      ? raw.items.map((item: Raw) => ({
          product: String(item.productId ?? item.product ?? ''),
          productName: item.productName ?? item.product?.name ?? '',
          quantity: Number(item.quantity ?? 1),
          size: item.size ?? '',
          price: Number(item.price ?? 0),
          customName: item.customName ?? undefined,
          customNumber: item.customNumber ?? undefined,
        }))
      : [],
    subtotal: Number(raw.subtotal ?? 0),
    deliveryCharge: Number(raw.deliveryCharge ?? 0),
    total: Number(raw.total ?? 0),
    status: raw.status ?? 'pending',
    paymentStatus: raw.paymentStatus ?? 'unpaid',
    paymentMethod: raw.paymentMethod ?? 'cod',
    customer: {
      name: raw.customerName ?? raw.customer?.name ?? '',
      phone: raw.customerPhone ?? raw.customer?.phone ?? '',
      deliveryAddress: raw.deliveryAddress ?? raw.customer?.deliveryAddress ?? '',
      city: raw.city ?? raw.customerCity ?? raw.customer?.city ?? '',
      note: raw.note ?? raw.customerNote ?? raw.customer?.note ?? undefined,
    },
    whatsappConfirmed: Boolean(raw.whatsappConfirmed),
    deliveryBoyId: raw.deliveryBoyId ?? null,
    statusHistory: Array.isArray(raw.statusHistory)
      ? raw.statusHistory.map((h: Raw) => ({
          status: h.status,
          timestamp: h.timestamp ?? h.createdAt ?? new Date().toISOString(),
          note: h.note ?? undefined,
        }))
      : [{ status: raw.status ?? 'pending', timestamp: raw.createdAt ?? new Date().toISOString() }],
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  }
}

export function normalizeUser(raw: Raw): User {
  return {
    _id: String(raw.id ?? raw._id ?? ''),
    name: raw.name ?? '',
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    role: raw.role ?? 'customer',
    address: raw.address
      ? { street: raw.address.street ?? '', city: raw.address.city ?? '', district: raw.address.district ?? '' }
      : undefined,
    avatar: raw.avatar ?? undefined,
    isActive: raw.isActive !== undefined ? Boolean(raw.isActive) : true,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  }
}

export function normalizeReview(raw: Raw): Review {
  const userRaw = raw.user
  const userName =
    userRaw && typeof userRaw === 'object' && 'name' in userRaw
      ? String((userRaw as { name?: string }).name ?? '')
      : undefined

  return {
    _id: String(raw.id ?? raw._id ?? ''),
    user:
      userRaw && typeof userRaw === 'object' && 'id' in userRaw
        ? String((userRaw as { id?: string }).id ?? '')
        : String(raw.userId ?? raw.user ?? ''),
    userName: userName || undefined,
    product: String(raw.productId ?? raw.product ?? ''),
    rating: Number(raw.rating ?? 0),
    comment: raw.comment ?? '',
    images: Array.isArray(raw.images) ? raw.images : undefined,
    isVerifiedPurchase: Boolean(raw.isVerifiedPurchase),
    isApproved: Boolean(raw.isApproved),
    createdAt: raw.createdAt ?? new Date().toISOString(),
  }
}

// Maps the AuthResponse.user shape (from login/register) to the full User type
export function authUserToUser(raw: Raw): User {
  return {
    _id: String(raw.id ?? raw._id ?? ''),
    name: raw.name ?? '',
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    role: raw.role ?? 'customer',
    address: undefined,
    avatar: undefined,
    isActive: true,
    createdAt: raw.createdAt ?? new Date().toISOString(),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  }
}
